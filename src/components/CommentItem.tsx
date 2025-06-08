import classNames from 'classnames';
import { EnrichedReaction } from 'getstream';
import React from 'react';
import { useTranslationContext } from '../context';
import { TransportType } from '../context/StreamApp';
import {
  OnClickUserHandler,
  PropsWithElementAttributes,
  humanizeTimestamp,
  textRenderer,
  useOnClickUser,
} from '../utils';
import { Avatar } from './Avatar';
import { Flex } from './Flex';

export type CommentItemProps<T extends TransportType> = PropsWithElementAttributes<
  {
    comment: EnrichedReaction<T>;
    onClickUser?: OnClickUserHandler<T>;
  } & Partial<Record<'onClickMention' | 'onClickHashtag', (word: string) => void>>
>;

export const CommentItem = <T extends TransportType>({
  comment: { user, created_at, data },
  onClickHashtag,
  onClickMention,
  onClickUser,
  className,
  style,
}: CommentItemProps<T>) => {
  const { tDateTimeParser } = useTranslationContext();

  const handleUserClick = useOnClickUser<T, SVGSVGElement | HTMLSpanElement>(onClickUser);

  return (
    <div className={classNames('raf-comment-item', className)} style={style}>
      <Flex a="flex-start" style={{ padding: '8px 0' }}>
        {user?.data.profileImage && (
          <Avatar onClick={handleUserClick?.(user)} image={user.data.profileImage} circle size={25} />
        )}
      </Flex>
      <Flex d="column" style={{ flex: 1, margin: '0 8px' }}>
        <div className="raf-comment-item__content">
          <time dateTime={created_at} title={created_at}>
            <small>{humanizeTimestamp(created_at, tDateTimeParser)}</small>
          </time>
          <p>
            <span onClick={handleUserClick?.(user)} className="raf-comment-item__author">
              {user?.data.name}
            </span>{' '}
            {textRenderer(data.text as string, 'raf-comment-item', onClickMention, onClickHashtag)}
          </p>
        </div>
      </Flex>
    </div>
  );
};
