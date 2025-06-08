import classNames from 'classnames';
import { Data as EmojiDataSet } from 'emoji-mart';
import { Activity, EnrichedActivity } from 'getstream';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useFeedContext, useTranslationContext } from '../context';
import { TransportType } from '../context/StreamApp';
import { PropsWithElementAttributes, inputValueFromEvent } from '../utils';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Textarea, TextareaProps } from './Textarea';

export type CommentFieldProps<T extends TransportType> = PropsWithElementAttributes<
  {
    activity: EnrichedActivity<T>;
    /** Override the default emoji dataset, library has a light set of emojis
     * to show more emojis use your own or emoji-mart sets
     * https://github.com/missive/emoji-mart#datasets
     */
    emojiData?: EmojiDataSet;
    image?: string;
    onSuccess?: () => void;
    placeholder?: string;
    targetFeeds?: string[];
    trigger?: TextareaProps['trigger'];
  },
  HTMLFormElement
>;

export const CommentField = <T extends TransportType>({
  activity,
  emojiData,
  onSuccess,
  image,
  placeholder,
  trigger,
  targetFeeds,
  className,
  style,
}: CommentFieldProps<T>) => {
  const feed = useFeedContext<T>();
  const { t } = useTranslationContext();
  const textareaReference = useRef<HTMLTextAreaElement>();
  const [text, setText] = useState<string>();

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement> | KeyboardEvent) => {
    event.preventDefault();

    if (!text) return;

    try {
      await feed.onAddReaction('comment', activity as Activity<T>, { text }, { targetFeeds });
    } catch (error) {
      console.error(error);
    }

    setText('');
    onSuccess?.();
  };

  useEffect(() => {
    if (!textareaReference.current) return;

    const handleFormSubmitKey = (event: KeyboardEvent) => {
      const { current: textarea } = textareaReference;
      if (event.key === 'Enter' && textarea?.nextSibling === null) {
        handleFormSubmit(event);
      }
    };

    textareaReference.current.addEventListener('keydown', handleFormSubmitKey);

    return () => textareaReference.current?.removeEventListener('keydown', handleFormSubmitKey);
  }, []);

  return (
    <form onSubmit={handleFormSubmit} className={classNames('raf-comment-field', className)} style={style}>
      {image && <Avatar image={image} circle size={39} />}
      <div className="raf-comment-field__group">
        <Textarea
          rows={1}
          value={text}
          placeholder={placeholder ?? t('Start Typing...')}
          onChange={(event) => setText((pv) => inputValueFromEvent<HTMLTextAreaElement>(event, true) ?? pv)}
          emojiData={emojiData}
          trigger={trigger}
          maxLength={280}
          innerRef={(element) => (textareaReference.current = element)}
        />
        <Button buttonStyle="primary" disabled={!text} type="submit">
          {t('Post')}
        </Button>
      </div>
    </form>
  );
};
