import classNames from 'classnames';
import { EnrichedActivity } from 'getstream';
import React, { useMemo } from 'react';
import { Thumbnail } from 'react-file-utils';
import { TransportType } from '../context/StreamApp';
import { PropsWithElementAttributes, userOrDefault } from '../utils';

export type AttachedActivityProps<T extends TransportType> = PropsWithElementAttributes<{
  activity: EnrichedActivity<T>;
}>;

export function AttachedActivity<T extends TransportType>({
  activity: { object, verb, attachments, actor },
  className,
  style,
}: AttachedActivityProps<T>) {
  const images = attachments?.images ?? [];
  const user = useMemo(() => userOrDefault<T>(actor), [actor]);

  if (verb !== 'repost' && verb !== 'post' && verb !== 'comment') return null;

  return (
    <div className={classNames('raf-attached-activity', className)} style={style}>
      {images.length ? (
        <div className="raf-attached-activity__images">
          {images.slice(0, 5).map((image, i) => (
            <Thumbnail image={image} size={50} key={`image-${i}`} />
          ))}
        </div>
      ) : (
        <React.Fragment>
          <p className="raf-attached-activity__author">
            <strong>{user.data.name}</strong>
          </p>
          <p className="raf-attached-activity__content">{object as string}</p>
        </React.Fragment>
      )}
    </div>
  );
}
