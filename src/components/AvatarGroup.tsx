import classNames from 'classnames';
import { EnrichedUser } from 'getstream';
import React from 'react';
import { TransportType } from '../context/StreamApp';
import { OnClickUserHandler, PropsWithElementAttributes, useOnClickUser } from '../utils';
import { Avatar } from './Avatar';

export type AvatarGroupProps<T extends TransportType> = PropsWithElementAttributes<{
  avatarSize?: number;
  limit?: number;
  onClickUser?: OnClickUserHandler<T>;
  users?: Array<EnrichedUser<T>>;
}>;

export function AvatarGroup<T extends TransportType>({
  limit = 5,
  users = [],
  avatarSize = 30,
  onClickUser,
  className,
  style,
}: AvatarGroupProps<T>) {
  const handleUserClick = useOnClickUser<T>(onClickUser);

  return (
    <div className={classNames('raf-avatar-group', className)} style={style}>
      {users.slice(0, limit).map((user, i) => (
        <div className="raf-avatar-group__avatar" key={`avatar-${i}`}>
          <Avatar onClick={handleUserClick?.(user)} image={user.data?.profileImage} size={avatarSize} circle />
        </div>
      ))}
    </div>
  );
}
