import classNames from 'classnames';
import { ReactionsRecords } from 'getstream';
import React from 'react';
import { TransportType } from '../context/StreamApp';
import { PropsWithElementAttributes } from '../utils';
import { ReactionIcon, ReactionIconProps } from './ReactionIcon';

type ReactionToggleIconProps<T extends TransportType> = PropsWithElementAttributes<
  {
    /** The icon to show when the user has done this reaction (e.g. a filled in heart) */
    activeIcon: ReactionIconProps['icon'];
    /** The icon to show when the user has not done this reaction yet (e.g. an empty in heart) */
    inactiveIcon: ReactionIconProps['icon'];
    /** The map with own reactions */
    own_reactions?: ReactionsRecords<T> | Record<string, T['childReactionType']>;
  } & Omit<ReactionIconProps, 'icon'>
>;

export const ReactionToggleIcon = <T extends TransportType>({
  inactiveIcon,
  activeIcon,
  own_reactions: ownReactions,
  kind,
  className,
  style,
  ...restProps
}: ReactionToggleIconProps<T>) => {
  const icon = ownReactions?.[kind ?? '']?.length ? activeIcon : inactiveIcon;
  return (
    <div className={classNames('raf-reaction-toggle-icon', className)} style={style}>
      <ReactionIcon icon={icon} kind={kind} {...restProps} />
    </div>
  );
};
