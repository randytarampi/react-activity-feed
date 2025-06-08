import { Activity, EnrichedActivity, EnrichedReaction, Reaction } from 'getstream';
import React, { useEffect } from 'react';
import { useFeedContext } from '../context';
import { TransportType } from '../context/StreamApp';
import { PropsWithElementAttributes } from '../utils';
import { Color, ThumbsUpIcon } from './Icons';
import { ReactionToggleIcon } from './ReactionToggleIcon';

export type LikeButtonProps<T extends TransportType> = PropsWithElementAttributes<{
  /** The activity received from stream that should be liked when pressing the LikeButton. */
  activity?: EnrichedActivity<T>;
  /** The reaction received from stream that should be liked when pressing the LikeButton. */
  reaction?: EnrichedReaction<T>;
  /** onAddReaction supports targetFeeds that you can use to send a notification to the post owner like ["notification:USER_ID"] */
  targetFeeds?: string[];
}>;

export const LikeButton = <T extends TransportType>({
  activity,
  reaction,
  targetFeeds,
  className,
  style,
}: LikeButtonProps<T>) => {
  const feed = useFeedContext<T>();

  useEffect(() => {
    if (!reaction && !activity) console.warn('LikeButton requires an activity or reaction to work properly');
    if (reaction && activity) console.warn('LikeButton requires only one of the activity or reaction to work properly');
  }, []);

  return (
    <ReactionToggleIcon
      className={className}
      style={style}
      counts={reaction?.children_counts ?? activity?.reaction_counts}
      own_reactions={reaction?.own_children ?? activity?.own_reactions}
      kind="like"
      onPress={() => {
        if (reaction)
          return feed.onToggleChildReaction(
            'like',
            reaction as Reaction<T['reactionType']>,
            {} as T['childReactionType'],
            { targetFeeds },
          );
        if (activity)
          return feed.onToggleReaction('like', activity as Activity<T>, {} as T['reactionType'], {
            targetFeeds,
          });
        return Promise.resolve();
      }}
      activeIcon={<ThumbsUpIcon style={{ color: Color.Active }} />}
      inactiveIcon={<ThumbsUpIcon style={{ color: Color.Inactive }} />}
      labelSingle="like"
      labelPlural="likes"
    />
  );
};
