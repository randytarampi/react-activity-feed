import {
  ClientOptions,
  DefaultGenerics,
  GetFeedOptions,
  OGAPIResponse,
  StreamClient,
  StreamUser,
  UR,
  connect,
} from 'getstream';
import React, { PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react';
import StreamAnalytics from 'stream-analytics';
import { Streami18n } from '../i18n/Streami18n';
import { ErrorHandler, handleError } from '../utils/errors';
import { FeedManager } from './FeedManager';
import { TranslationContextValue, TranslationProvider } from './TranslationContext';

export type SharedFeedManagers<T extends TransportType> = Record<string, FeedManager<T>>;

type Attachments = {
  files?: Array<{ mimeType: string; name: string; url: string }>;
  images?: string[];
  og?: OGAPIResponse;
};

export type DefaultUT = UR & { name: string; id?: string; profileImage?: string };

export type DefaultAT = UR & { attachments?: Attachments; text?: string };

export type SharedFeed = { feedGroup: string; notify: boolean; options: GetFeedOptions };

export type StreamAppProps<UT extends DefaultUT = DefaultUT> = {
  apiKey: string;
  appId: string;
  token: string;
  analyticsToken?: string;
  children?: ReactNode;
  defaultUserData?: UT;
  errorHandler?: ErrorHandler;
  i18nInstance?: Streami18n;
  options?: ClientOptions;
  sharedFeeds?: Array<SharedFeed>;
};

export interface TransportType extends DefaultGenerics {
  activityType: DefaultAT;
  childReactionType: UR;
  collectionType: UR;
  personalizationType: UR;
  reactionType: UR;
  userType: DefaultUT;
}

export type StreamContextValue<T extends TransportType> = {
  analyticsClient: null | StreamAnalytics<T['userType']>;
  client: null | StreamClient<T>;
  errorHandler: ErrorHandler;
  sharedFeedManagers: SharedFeedManagers<T>;
  user?: StreamUser<T>;
  userData?: T['userType'];
};

export const StreamContext = React.createContext<StreamContextValue<TransportType>>({
  analyticsClient: null,
  client: null,
  errorHandler: handleError,
  sharedFeedManagers: {},
});

export const StreamAppProvider = <T extends TransportType>({
  children,
  value,
}: PropsWithChildren<{
  value: StreamContextValue<T>;
}>) => (
  <StreamContext.Provider value={(value as unknown) as StreamContextValue<TransportType>}>
    {children}
  </StreamContext.Provider>
);

export const useStreamContext = <T extends TransportType>() =>
  (useContext(StreamContext) as unknown) as StreamContextValue<T>;

/**
 * Manages the connection with Stream. Any components that should talk to
 * Stream should be a child of this component.
 */
export function StreamApp<T extends TransportType>({
  apiKey,
  appId,
  errorHandler = handleError,
  i18nInstance,
  token,
  analyticsToken,
  children,
  defaultUserData,
  options,
  sharedFeeds = [{ feedGroup: 'notification', notify: true, options: { mark_seen: true } }],
}: StreamAppProps<T['userType']>) {
  const [client, setClient] = useState<StreamClient<T> | null>(null);
  const [user, setUser] = useState<StreamUser<T>>();
  const [analyticsClient, setAnalyticsClient] = useState<StreamAnalytics<T['userType']> | null>(null);
  const [userData, setUserDate] = useState<T['userType']>();
  const [translator, setTranslator] = useState<TranslationContextValue>();
  const [sharedFeedManagers, setSharedFeedManagers] = useState<SharedFeedManagers<T>>({});

  useEffect(() => {
    const streami18n =
      i18nInstance && i18nInstance instanceof Streami18n ? i18nInstance : new Streami18n({ language: 'en' });

    streami18n.getTranslators().then(setTranslator);
    streami18n.registerSetLanguageCallback((t) =>
      setTranslator((prevState) => ({ ...(prevState as TranslationContextValue), t })),
    );
  }, [i18nInstance]);

  const getUserInfo = async (user: StreamUser<T>) => {
    try {
      const { data } = await user.getOrCreate((defaultUserData || { name: 'Unknown' }) as T['userType']);
      setUserDate(data);
    } catch (e) {
      errorHandler(e, 'get-user-info', { userId: user.id });
    }
  };

  useEffect(() => {
    const client = connect<T>(apiKey, token, appId, options || {});

    let analyticsClient: StreamAnalytics<T['userType']> | null = null;
    if (analyticsToken) {
      analyticsClient = new StreamAnalytics<T['userType']>({ apiKey, token: analyticsToken });
      analyticsClient.setUser(client.userId as string);
    }

    const feeds: Record<string, FeedManager<T>> = {};
    for (const feedProps of sharedFeeds) {
      const manager = new FeedManager<T>({
        ...feedProps,
        client,
        analyticsClient,
        errorHandler,
        user,
      });

      feeds[manager.feed().id] = manager;
    }

    setClient(client);
    setUser(client.currentUser as StreamUser<T>);
    setAnalyticsClient(analyticsClient);
    setSharedFeedManagers(feeds);

    getUserInfo(client.currentUser as StreamUser<T>);

    return () => client.fayeClient?.disconnect();
  }, [apiKey, token, appId, analyticsClient]);

  if (!translator?.t) return null;

  return (
    <StreamAppProvider value={{ client, analyticsClient, errorHandler, userData, user, sharedFeedManagers }}>
      <TranslationProvider value={translator}>
        <>{children || 'You are connected to Stream, Throw some components in here!'}</>
      </TranslationProvider>
    </StreamAppProvider>
  );
}
