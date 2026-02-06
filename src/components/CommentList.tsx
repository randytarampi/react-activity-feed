import React from 'react';
import { TransportType } from '../context/StreamApp';
import { ElementOrComponentOrLiteralType, smartRender } from '../utils';
import { CommentItemProps, CommentItem as DefaultCommentItem } from './CommentItem';
import { LoadMorePaginator, LoadMorePaginatorProps } from './LoadMorePaginator';
import { ReactionList } from './ReactionList';

export type CommentListProps<T extends TransportType> = {
  /** The ID of the activity for which these comments are */
  activityId: string;
  /** Only needed for reposted activities where you want to show the comments
   * of the original activity, not of the repost */
  activityPath?: Array<string>;
  /** The component that should render the comment
   * #CommentItem (Component)#
   */
  CommentItem?: ElementOrComponentOrLiteralType<CommentItemProps<T>>;
  /** Show and load comments starting with the oldest reaction first, instead
   * of the default where comments are displayed and loaded most recent first.
   */
  oldestToNewest?: boolean;
  /** By default pagination is done with a "Load more" button, you can use
   * [InfiniteScrollPaginator](/components/infinite-scroll) to enable infinite scrolling
   * #LoadMorePaginator (Component)#
   */
  Paginator?: ElementOrComponentOrLiteralType<LoadMorePaginatorProps>;
  /** Reverse the order the comments are displayed in. */
  reverseOrder?: boolean;
};

export const CommentList = <T extends TransportType>({
  Paginator = LoadMorePaginator,
  CommentItem = DefaultCommentItem,
  activityId,
  activityPath,
  oldestToNewest = false,
  reverseOrder = false,
}: CommentListProps<T>) => (
  <ReactionList<T>
    Paginator={Paginator}
    activityId={activityId}
    reactionKind="comment"
    Reaction={({ reaction: comment }) => <>{smartRender<CommentItemProps<T>>(CommentItem, { comment })}</>}
    activityPath={activityPath}
    oldestToNewest={oldestToNewest}
    reverseOrder={reverseOrder}
  />
);
