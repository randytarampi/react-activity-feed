import { EnrichedActivity } from 'getstream';
import React from 'react';
import { LoadingIndicator as DefaultLoadingIndicator, LoadingIndicatorProps } from 'react-file-utils';
import { Feed, FeedManagerProps, FeedProps, TransportType, useFeedContext, useTranslationContext } from '../context';
import { ElementOrComponentOrLiteralType, smartRender } from '../utils';
import { ActivityProps, Activity as DefaultActivity } from './Activity';
import { FeedPlaceholder, FeedPlaceholderProps } from './FeedPlaceholder';
import { LoadMorePaginator, LoadMorePaginatorProps } from './LoadMorePaginator';
import { NewActivitiesNotification, NewActivitiesNotificationProps } from './NewActivitiesNotification';

type FlatFeedInnerProps<T extends TransportType> = {
  /** The component used to render an activity in the feed
   * #Activity (Component)#
   */
  Activity: ElementOrComponentOrLiteralType<ActivityProps<T>>;
  /** Component to show when the feed is refreshing
   * #LoadingIndicator (Component)#
   */
  LoadingIndicator: ElementOrComponentOrLiteralType<LoadingIndicatorProps>;
  /** The component to use to render new activities notification
   * #Notifier (NewActivitiesNotification Component)#
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

export type FlatFeedProps<T extends TransportType> = Partial<FlatFeedInnerProps<T>> &
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
  >;

const DefaultNotifier = (props: NewActivitiesNotificationProps) => (
  <NewActivitiesNotification labelPlural="activities" labelSingle="activity" {...props} />
);

const FlatFeedInner = <T extends TransportType>({
  Activity,
  Notifier,
  Placeholder,
  Paginator,
  LoadingIndicator,
  options,
}: FlatFeedInnerProps<T>) => {
  const feed = useFeedContext<T>();
  const { t } = useTranslationContext();

  const refreshFeed = () => feed.refresh(options);

  if (feed.refreshing && !feed.hasDoneRequest) {
    return <div className="raf-loading-indicator">{smartRender<LoadingIndicatorProps>(LoadingIndicator)}</div>;
  }

  return (
    <>
      {smartRender<NewActivitiesNotificationProps>(Notifier, {
        adds: feed.realtimeAdds,
        deletes: feed.realtimeDeletes,
        onClick: feed.hasReverseNextPage ? feed.loadReverseNextPage : refreshFeed,
        labelFunction: feed.hasReverseNextPage ? () => t('Load activities') : undefined,
      })}

      {feed.activities.size === 0 && feed.hasDoneRequest
        ? smartRender<FeedPlaceholderProps>(Placeholder)
        : smartRender<LoadMorePaginatorProps>(Paginator, {
            loadNextPage: feed.loadNextPage,
            hasNextPage: feed.hasNextPage,
            refreshing: feed.refreshing,
            children: feed.activityOrder.map((id) =>
              smartRender<ActivityProps<T>>(Activity, {
                activity: feed.activities.get(id)?.toJS() as EnrichedActivity<T>,
                feedGroup: feed.feedGroup,
                userId: feed.userId,
                // @ts-expect-error
                key: id,
              }),
            ),
          })}
    </>
  );
};

/**
 * Renders a feed of activities, this component is a StreamApp consumer
 * and must always be a child of the `<StreamApp>` element
 */
export const FlatFeed = <T extends TransportType>({
  userId,
  options,
  analyticsLocation,
  doFeedRequest,
  doActivityDeleteRequest,
  doChildReactionAddRequest,
  doChildReactionDeleteRequest,
  doReactionAddRequest,
  doReactionDeleteRequest,
  doReactionsFilterRequest,
  feedGroup = 'timeline',
  notify = false,
  Activity = DefaultActivity,
  Notifier = DefaultNotifier,
  Placeholder = FeedPlaceholder,
  Paginator = LoadMorePaginator,
  LoadingIndicator = DefaultLoadingIndicator,
}: FlatFeedProps<T>) => {
  return (
    <Feed<T>
      feedGroup={feedGroup}
      userId={userId}
      options={options}
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
      <FlatFeedInner<T>
        Activity={Activity}
        Notifier={Notifier}
        Placeholder={Placeholder}
        Paginator={Paginator}
        LoadingIndicator={LoadingIndicator}
        options={options}
      />
    </Feed>
  );
};
