import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Feed, TransportType, useFeedContext } from '../context';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { ElementOrComponentOrLiteralType, PropsWithElementAttributes, smartRender } from '../utils';
import { DropdownPanel, DropdownPanelProps } from './DropdownPanel';
import { IconBadge } from './IconBadge';
import { NotificationFeed, NotificationFeedProps } from './NotificationFeed';

export type NotificationDropdownProps<T extends TransportType> = PropsWithElementAttributes<
  {
    Icon?: ElementOrComponentOrLiteralType;
    width?: number;
  } & Pick<DropdownPanelProps, 'Footer' | 'Header' | 'right'> &
    NotificationFeedProps<T>
>;

const NotificationDropdownInner = <T extends TransportType>({
  width,
  Footer,
  Header,
  Icon,
  right,
  className,
  style,
  ...feedProps
}: NotificationDropdownProps<T>) => {
  const feed = useFeedContext<T>();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setOpen(false), open);

  useEffect(() => {
    feed.refreshUnreadUnseen();
  }, []);

  return (
    <div className={classNames('raf-notification-dropdown', className)} style={style}>
      <IconBadge showNumber unseen={feed.unseen} hidden={!feedProps.notify} onClick={() => setOpen(true)}>
        {Icon && smartRender(Icon)}
      </IconBadge>

      <div
        ref={dropdownRef}
        style={{ maxWidth: width }}
        className={`raf-notification-dropdown__panel${open ? ' raf-notification-dropdown__panel--open' : ''}${
          right ? ' raf-notification-dropdown__panel--right' : ''
        }`}
      >
        {open && (
          <DropdownPanel arrow right={right} Header={Header} Footer={Footer}>
            <NotificationFeed {...feedProps} />
          </DropdownPanel>
        )}
      </div>
    </div>
  );
};

/**
 * IMPORTANT: Changing most of the props below doesn't result in the desired effect.
 * These settings related to feed management should be changed in the `sharedFeeds` prop of the [`StreamApp`](#streamapp) component.
 */
export const NotificationDropdown = <T extends TransportType>({
  width = 475,
  Footer,
  Header,
  Icon,
  right,
  feedGroup = 'notification',
  options,
  ...feedProps
}: NotificationDropdownProps<T>) => {
  const optionsWithDefaults = { ...options, mark_seen: options?.mark_seen ?? true };

  return (
    <Feed<T> {...feedProps} feedGroup={feedGroup} options={optionsWithDefaults}>
      <NotificationDropdownInner<T>
        width={width}
        Footer={Footer}
        Header={Header}
        Icon={Icon}
        right={right}
        {...feedProps}
        feedGroup={feedGroup}
        options={optionsWithDefaults}
      />
    </Feed>
  );
};
