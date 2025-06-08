import classNames from 'classnames';
import { EnrichedActivity } from 'getstream';
import React from 'react';
import { FileIcon } from 'react-file-utils';
import { TransportType } from '../context/StreamApp';
import { sanitizeURL, smartRender, textRenderer } from '../utils';
import { ActivityProps } from './Activity';
import { Audio } from './Audio';
import { Card as DefaultCard } from './Card';
import { Gallery } from './Gallery';
import { Video } from './Video';

export type ActivityContentProps<T extends TransportType> = ActivityProps<T>;

export const ActivityContent = <T extends TransportType>({
  activity,
  Repost,
  Card = DefaultCard,
  className,
  style,
  ...props
}: ActivityContentProps<T>) => {
  const {
    object,
    text = (typeof object === 'string' ? object : '').trim(),
    attachments: { og, images = [], files = [] } = {},
    verb,
    image,
  } = activity;

  return (
    <div className={classNames('raf-activity__content', className)} style={style}>
      {text && (
        <div style={{ padding: '8px 16px' }}>
          <p>{textRenderer(text, 'raf-activity', props.onClickMention, props.onClickHashtag)}</p>
        </div>
      )}

      {og && (
        <div style={{ padding: '8px 16px' }}>
          {og.videos ? <Video og={og} /> : og.audios ? <Audio og={og} /> : smartRender(Card, og)}
        </div>
      )}

      {typeof image === 'string' && (
        <div style={{ padding: '8px 0' }}>
          <Gallery images={[image]} />
        </div>
      )}

      {!!images.length && (
        <div style={{ padding: '8px 0' }}>
          <Gallery images={images} />
        </div>
      )}

      {!!files.length && (
        <ol className="raf-activity__attachments">
          {files.map(({ name, url, mimeType }, i) => (
            <a href={sanitizeURL(url)} download key={i}>
              <li className="raf-activity__file">
                <FileIcon mimeType={mimeType} filename={name} /> {name}
              </li>
            </a>
          ))}
        </ol>
      )}

      {verb === 'repost' &&
        typeof object === 'object' &&
        smartRender(Repost, {
          ...props,
          activity: object as EnrichedActivity<T>,
        })}
    </div>
  );
};
