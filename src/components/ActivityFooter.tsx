import classNames from 'classnames';
import React from 'react';
import { TransportType } from '../context/StreamApp';
import { ActivityProps } from './Activity';
import { Flex } from './Flex';
import { LikeButton } from './LikeButton';
import { RepostButton } from './RepostButton';

export type ActivityFooterProps<T extends TransportType> = Pick<
  ActivityProps<T>,
  'activity' | 'feedGroup' | 'userId' | 'className' | 'style'
> & {
  targetFeeds?: string[];
};

export const ActivityFooter = <T extends TransportType>({
  activity,
  feedGroup = 'user',
  userId,
  targetFeeds,
  className,
  style,
}: ActivityFooterProps<T>) => (
  <div className={classNames('raf-activity-footer', className)} style={style}>
    <div className="raf-activity-footer__left" />
    <div className="raf-activity-footer__right">
      <Flex a="center">
        <LikeButton<T> activity={activity} targetFeeds={targetFeeds} />
        <RepostButton<T> activity={activity} targetFeeds={targetFeeds} feedGroup={feedGroup} userId={userId} />
      </Flex>
    </div>
  </div>
);
