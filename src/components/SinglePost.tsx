import { GetFeedOptions } from 'getstream';
import React from 'react';
import { TransportType } from '../context';
import { FlatFeed, FlatFeedProps } from './FlatFeed';

export type SinglePostProps<T extends TransportType> = FlatFeedProps<T> & { activityId: string };

/**
 * Shows the detail of a single activity
 */
export function SinglePost<T extends TransportType>({
  options,
  activityId,
  doFeedRequest,
  ...props
}: SinglePostProps<T>) {
  return (
    <FlatFeed<T>
      {...props}
      options={{ withRecentReactions: true, ...options }}
      doFeedRequest={(client, feedGroup, userId, opts) => {
        if (doFeedRequest) {
          return doFeedRequest(client, feedGroup, userId, {
            ...opts,
            id_lte: activityId,
            id_gte: activityId,
            limit: 1,
          });
        }

        return client.feed(feedGroup, userId).getActivityDetail(activityId, opts as GetFeedOptions);
      }}
    />
  );
}
