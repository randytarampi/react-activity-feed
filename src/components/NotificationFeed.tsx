import { NotificationActivityEnriched } from 'getstream';
import React, { useEffect } from 'react';
import { LoadingIndicator as DefaultLoadingIndicator, LoadingIndicatorProps } from 'react-file-utils';
import { Feed, FeedManagerProps, FeedProps, TransportType, useFeedContext } from '../context';
import { ElementOrComponentOrLiteralType, smartRender } from '../utils';
import { FeedPlaceholder, FeedPlaceholderProps } from './FeedPlaceholder';
import { LoadMorePaginator, LoadMorePaginatorProps } from './LoadMorePaginator';
import { NewActivitiesNotification, NewActivitiesNotificationProps } from './NewActivitiesNotification';
import { Notification, NotificationProps } from './Notification';

type NotificationFeedInnerProps<T extends TransportType> = {
  /** the component used to render a grouped notifications in the feed
   * #Notification (Component)#
   */
  Group: ElementOrComponentOrLiteralType<NotificationProps<T>>;
  /** Component to show when the feed is refreshing
   * #LoadingIndicator (Component)#
   */
  LoadingIndicator: ElementOrComponentOrLiteralType<LoadingIndicatorProps>;
  /** The component to use to render new activities notification
   * #NewActivitiesNotification (Component)#
   */
  Notifier: ElementOrComponentOrLiteralType<NewActivitiesNotificationProps>;
  /** By default pagination is done with a "Load more" button, you can use
   * [InfiniteScrollPaginator](/components/infinite-scroll) to enable infinite scrolling
   * #LoadMorePaginator (Component)#
   */
  Paginator: ElementOrComponentOrLiteralType<LoadMorePaginatorProps>;
  /** Component to show when there are no activities in the feed
   * #FeedPlaceholder (Component)#
   */
  Placeholder: ElementOrComponentOrLiteralType<FeedPlaceholderProps>;
  /** Read options for the API client (eg. limit, ranking, ...) */
  options?: FeedProps<T>['options'];
};

export type NotificationFeedProps<T extends TransportType> = Partial<
  NotificationFeedInnerProps<T> &
    Pick<
      FeedManagerProps<T>,
      | 'analyticsLocation'
      | 'doActivityDeleteRequest'
      | 'doChildReactionAddRequest'
      | 'doChildReactionDeleteRequest'
      | 'doFeedRequest'
      | 'doReactionAddRequest'
      | 'doReactionDeleteRequest'
      | 'doReactionsFilterRequest'
      | 'feedGroup'
      | 'notify'
      | 'userId'
    >
>;

const NotificationFeedInner = <T extends TransportType>({
  Group,
  LoadingIndicator,
  Notifier,
  Paginator,
  Placeholder,
  options,
}: NotificationFeedInnerProps<T>) => {
  const feed = useFeedContext<T>();

  const refreshFeed = () => feed.refresh(options);

  useEffect(() => {
    return () => {
      feed.activities.clear();
      feed.activityOrder.splice(0, feed.activityOrder.length);
    };
  }, [feed.feedGroup, feed.userId]);

  if (feed.refreshing && !feed.hasDoneRequest) {
    return <div className="raf-loading-indicator">{smartRender<LoadingIndicatorProps>(LoadingIndicator)}</div>;
  }

  return (
    <>
      {smartRender<NewActivitiesNotificationProps>(Notifier, {
        adds: feed.realtimeAdds,
        deletes: feed.realtimeDeletes,
        onClick: refreshFeed,
      })}

      {feed.activities.size === 0 && feed.hasDoneRequest
        ? smartRender<FeedPlaceholderProps>(Placeholder)
        : smartRender<LoadMorePaginatorProps>(Paginator, {
            loadNextPage: feed.loadNextPage,
            hasNextPage: feed.hasNextPage,
            refreshing: feed.refreshing,
            children: feed.activityOrder.map((id) =>
              smartRender<NotificationProps<T>>(Group, {
                activityGroup: feed.activities.get(id)?.toJS() as NotificationActivityEnriched<T>,
                // @ts-expect-error
                key: id,
              }),
            ),
          })}
    </>
  );
};

/**
 * Renders a Notification feed, this component is a StreamApp consumer and must always be a child of `<StreamApp>`.
 */
export const NotificationFeed = <T extends TransportType>({
  options,
  userId,
  analyticsLocation,
  doFeedRequest,
  doActivityDeleteRequest,
  doChildReactionAddRequest,
  doChildReactionDeleteRequest,
  doReactionAddRequest,
  doReactionDeleteRequest,
  doReactionsFilterRequest,
  feedGroup = 'notification',
  notify = false,
  Group = Notification,
  Notifier = NewActivitiesNotification,
  Paginator = LoadMorePaginator,
  Placeholder = FeedPlaceholder,
  LoadingIndicator = DefaultLoadingIndicator,
}: NotificationFeedProps<T>) => {
  return (
    <Feed<T>
      feedGroup={feedGroup}
      userId={userId}
      options={{ ...options, mark_seen: options?.mark_seen ?? true }}
      notify={notify}
      analyticsLocation={analyticsLocation}
      doFeedRequest={doFeedRequest}
      doActivityDeleteRequest={doActivityDeleteRequest}
      doReactionAddRequest={doReactionAddRequest}
      doReactionDeleteRequest={doReactionDeleteRequest}
      doChildReactionAddRequest={doChildReactionAddRequest}
      doChildReactionDeleteRequest={doChildReactionDeleteRequest}
      doReactionsFilterRequest={doReactionsFilterRequest}
    >
      <NotificationFeedInner<T>
        Group={Group}
        LoadingIndicator={LoadingIndicator}
        Notifier={Notifier}
        Paginator={Paginator}
        Placeholder={Placeholder}
        options={options}
      />
    </Feed>
  );
};
