import React from 'react';
import { TransportType } from '../context/StreamApp';
import { useTranslationContext } from '../context/TranslationContext';
import { humanizeTimestamp, useOnClickUser, userOrDefault } from '../utils';
import { ActivityProps } from './Activity';
import { UserBar } from './UserBar';

export type ActivityHeaderProps<T extends TransportType> = Pick<
  ActivityProps<T>,
  'activity' | 'HeaderRight' | 'icon' | 'onClickUser' | 'className' | 'style'
>;

export const ActivityHeader = <T extends TransportType>({
  activity,
  HeaderRight,
  icon,
  onClickUser,
  style = { padding: '8px 16px' },
  className,
}: ActivityHeaderProps<T>) => {
  const { tDateTimeParser } = useTranslationContext();

  const actor = userOrDefault<T>(activity.actor);
  const handleUserClick = useOnClickUser<T>(onClickUser);

  return (
    <div style={style} className={className}>
      <UserBar
        username={actor.data.name}
        avatar={actor.data.profileImage}
        onClickUser={handleUserClick?.(actor)}
        subtitle={HeaderRight ? humanizeTimestamp(activity.time, tDateTimeParser) : undefined}
        timestamp={activity.time}
        icon={icon}
        Right={HeaderRight}
      />
    </div>
  );
};
