import {
  Activity,
  FeedAPIResponse,
  GetFeedOptions,
  Reaction,
  ReactionAPIResponse,
  ReactionAddChildOptions,
  ReactionAddOptions,
  ReactionFilterAPIResponse,
  ReactionFilterConditions,
  StreamClient,
  UR,
} from 'getstream';
import isEqual from 'lodash/isEqual';
import React, { PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FeedManager } from './FeedManager';
import { TransportType, useStreamContext } from './StreamApp';

export type FeedContextValue<T extends TransportType> = {
  feedGroup: string;
  feedManager: FeedManager<T>;
  hasDoneRequest: boolean;
  hasNextPage: boolean;
  hasReverseNextPage: boolean;
  userId?: string;
} & Pick<
  FeedManager<T>,
  | 'loadNextPage'
  | 'loadNextReactions'
  | 'loadReverseNextPage'
  | 'onAddChildReaction'
  | 'onAddReaction'
  | 'onMarkAsRead'
  | 'onMarkAsSeen'
  | 'onRemoveActivity'
  | 'onRemoveChildReaction'
  | 'onRemoveReaction'
  | 'onToggleChildReaction'
  | 'onToggleReaction'
  | 'getActivityPath'
  | 'refresh'
  | 'refreshUnreadUnseen'
> &
  Pick<
    FeedManager<T>['state'],
    'activities' | 'activityOrder' | 'realtimeAdds' | 'realtimeDeletes' | 'refreshing' | 'unread' | 'unseen'
  >;

type DeleteRequestFn = (id: string) => Promise<void | unknown>;

export type FeedProps<T extends TransportType> = {
  /** The feed group part of the feed */
  feedGroup: string;
  /** The location that should be used for analytics when liking in the feed,
   * this is only useful when you have analytics enabled for your app. */
  analyticsLocation?: string;
  /** Override activity delete request */
  /* Components to display in the feed */
  children?: React.ReactNode;
  doActivityDeleteRequest?: DeleteRequestFn;
  /** Override child reaction add request */
  doChildReactionAddRequest?: (
    kind: string,
    reaction: Reaction<T['reactionType']>,
    data?: T['childReactionType'],
    options?: ReactionAddChildOptions,
  ) => Promise<ReactionAPIResponse<T['childReactionType']>>;
  /** Override child reaction delete request */
  doChildReactionDeleteRequest?: DeleteRequestFn;
  /** The feed read handler (change only for advanced/complex use-cases) */
  doFeedRequest?: (
    client: StreamClient<T>,
    feedGroup: string,
    userId?: string,
    options?: GetFeedOptions,
  ) => Promise<FeedAPIResponse<T>>;
  /** Override reaction add request */
  doReactionAddRequest?: (
    kind: string,
    activity: Activity<T>,
    data?: T['reactionType'],
    options?: ReactionAddOptions,
  ) => Promise<ReactionAPIResponse<T['reactionType']>>;
  /** Override reaction delete request */
  doReactionDeleteRequest?: DeleteRequestFn;
  /** Override reactions filter request */
  doReactionsFilterRequest?: (options: ReactionFilterConditions) => Promise<ReactionFilterAPIResponse<T>>;
  /** If true, feed shows the Notifier component when new activities are added */
  notify?: boolean;
  /** Read options for the API client (eg. limit, ranking, ...) */
  options?: GetFeedOptions;
  /** The user_id part of the feed */
  userId?: string;
};

export const FeedContext = React.createContext<FeedContextValue<TransportType> | UR>({});

export const FeedProvider = <T extends TransportType>({
  children,
  value,
}: PropsWithChildren<{
  value: FeedContextValue<T>;
}>) => <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;

export const useFeedContext = <T extends TransportType>() => useContext(FeedContext) as FeedContextValue<T>;

export function Feed<T extends TransportType>(props: FeedProps<T>) {
  const { analyticsClient, client, user, errorHandler, sharedFeedManagers } = useStreamContext<T>();
  const { feedGroup, userId, children, options, notify } = props;
  const [, setForceUpdateState] = useState(0);

  const optionsReference = useRef<GetFeedOptions | undefined>();

  if (!isEqual(optionsReference.current, options)) optionsReference.current = options;

  const feedId = client?.feed(feedGroup, userId).id;

  const manager = useMemo(() => {
    if (!feedId) return null;

    // TODO: check if any of the clients changed
    return sharedFeedManagers[feedId] || new FeedManager<T>({ ...props, analyticsClient, client, user, errorHandler });
  }, [feedId]);

  useEffect(() => {
    const forceUpdate = () => setForceUpdateState((prevState) => prevState + 1);
    if (manager) manager.props.notify = notify;
    manager?.register(forceUpdate);
    return () => manager?.unregister(forceUpdate);
  }, [manager, notify]);

  useEffect(() => {
    if (!manager) return;

    if (optionsReference.current) {
      manager.props.options = optionsReference.current;
    }

    manager.refresh();
  }, [manager, optionsReference.current]);

  if (!manager) return null;

  const ctx = {
    feedGroup,
    userId,
    feedManager: manager,
    getActivityPath: manager.getActivityPath,
    onToggleReaction: manager.onToggleReaction,
    onAddReaction: manager.onAddReaction,
    onRemoveReaction: manager.onRemoveReaction,
    onToggleChildReaction: manager.onToggleChildReaction,
    onAddChildReaction: manager.onAddChildReaction,
    onRemoveChildReaction: manager.onRemoveChildReaction,
    onRemoveActivity: manager.onRemoveActivity,
    onMarkAsRead: manager.onMarkAsRead,
    onMarkAsSeen: manager.onMarkAsSeen,
    refresh: manager.refresh,
    refreshUnreadUnseen: manager.refreshUnreadUnseen,
    loadNextReactions: manager.loadNextReactions,
    loadNextPage: manager.loadNextPage,
    hasNextPage: manager.hasNextPage(),
    loadReverseNextPage: manager.loadReverseNextPage,
    hasReverseNextPage: manager.hasReverseNextPage(),
    activityOrder: manager.state.activityOrder,
    activities: manager.state.activities,
    realtimeAdds: manager.state.realtimeAdds,
    realtimeDeletes: manager.state.realtimeDeletes,
    refreshing: manager.state.refreshing,
    unread: manager.state.unread,
    unseen: manager.state.unseen,
    hasDoneRequest: manager.state.lastResponse != null,
  };

  return <FeedProvider value={ctx}>{children}</FeedProvider>;
}
