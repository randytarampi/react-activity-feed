import { Activity, EnrichedActivity } from 'getstream';
import React from 'react';
import { TransportType, useFeedContext, useStreamContext } from '../context';
import { PropsWithElementAttributes } from '../utils';
import { Color, RepostIcon } from './Icons';
import { ReactionToggleIcon } from './ReactionToggleIcon';

export type RepostButtonProps<T extends TransportType> = PropsWithElementAttributes<{
  /** The activity received for stream for which to show the repost button. This is
   * used to initialize the toggle state and the counter. */
  activity: EnrichedActivity<T>;
  /** The feed group part of the feed that the activity should be reposted to,
   * e.g. `user` when posting to your own profile */
  feedGroup?: string;
  /** Repost reaction custom data  */
  repostData?: T['reactionType'];
  /** onAddReaction supports targetFeeds that you can use to send a notification to the post owner like ["notification:USER_ID"] */
  targetFeeds?: string[];
  /** The user_id part of the feed that the activity should be reposted to, default to current user id */
  userId?: string;
}>;

/**
 * A repost button ready to be embedded as Activity footer
 */
export const RepostButton = <T extends TransportType>({
  activity,
  feedGroup = 'user',
  userId,
  repostData,
  targetFeeds = [],
  className,
  style,
}: RepostButtonProps<T>) => {
  const feed = useFeedContext<T>();
  const app = useStreamContext<T>();

  // this to prevent reposting another repost, you can only repost an original activity to avoid nesting
  const originalActivity =
    activity.verb === 'repost' && typeof activity.object === 'object'
      ? (activity.object as EnrichedActivity<T>)
      : activity;

  return (
    <ReactionToggleIcon<T>
      counts={originalActivity.reaction_counts}
      own_reactions={originalActivity.own_reactions}
      kind="repost"
      onPress={() =>
        feed.onToggleReaction('repost', originalActivity as Activity<T>, repostData, {
          targetFeeds: [`${feedGroup}:${userId || app.user?.id}`, ...targetFeeds],
        })
      }
      activeIcon={<RepostIcon style={{ color: Color.Active }} />}
      inactiveIcon={<RepostIcon style={{ color: Color.Inactive }} />}
      className={className}
      style={style}
    />
  );
};
