import { Activity, NewActivity } from 'getstream';
import React, { ReactNode } from 'react';
import {
  FilePreviewer,
  FileUpload,
  FileUploadButton,
  ImageDropzone,
  ImagePreviewer,
  ImageUpload,
  ImageUploadButton,
  LoadingIndicator,
} from 'react-file-utils';
import { TransportType, useTranslationContext } from '../../context';
import { ElementOrComponentOrLiteralType, PropsWithElementAttributes, smartRender } from '../../utils';
import { Audio } from '../Audio';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Card } from '../Card';
import { EmojiPicker, EmojiPickerProps } from '../EmojiPicker';
import { BookmarkIcon } from '../Icons';
import { Panel, PanelContent, PanelFooter, PanelHeading } from '../Panel';
import { Textarea as DefaultTextarea, TextareaProps } from '../Textarea';
import { Title } from '../Title';
import { Video } from '../Video';
import { useStatusUpdateForm } from './useStatusUpdateForm';

export type StatusUpdateFormProps<T extends TransportType> = PropsWithElementAttributes<{
  /** The verb that should be used to post the activity, default to "post" */
  activityVerb?: string;
  /** Override Post request */
  doRequest?: (activity: NewActivity<T>) => Promise<Activity<T>>;
  /** Override the default emoji dataset, library has a light set of emojis
   * to show more emojis use your own or [emoji-mart sets](https://github.com/missive/emoji-mart#datasets)
   */
  emojiData?: EmojiPickerProps['emojiData'];
  /** Override the default i18n dictionary providing your own translations where necessary */
  emojiI18n?: EmojiPickerProps['i18n'];
  /** The feed group part of the feed that the activity should be posted to, default to "user" */
  feedGroup?: string;
  /** Add extra footer item */
  FooterItem?: ReactNode;
  /** The header to display */
  Header?: ReactNode;
  /** If you want to change something about the activity data that this form
   * sends to stream you can do that with this function. This function gets the
   * activity data that the form would send normally and should return the
   * modified activity data that should be posted instead.
   *
   * For instance, this would add a target field to the activity:
   *
   * ```javascript
   * &lt;StatusUpdateForm
   *   modifyActivityData={(data) => ({...data, target: 'Group:1'})}
   * />
   * ```
   * */
  modifyActivityData?: (activity: NewActivity<T>) => NewActivity<T>;
  /** A callback to run after the activity is posted successfully */
  onSuccess?: (activity: Activity<T>) => void;
  /** Custom Textarea component implementation */
  Textarea?: ElementOrComponentOrLiteralType<Omit<TextareaProps, 'maxLength' | 'rows'>>;
  /** An extra trigger for ReactTextareaAutocomplete, this can be used to show
   * a menu when typing @xxx or #xxx, in addition to the emoji menu when typing
   * :xxx  */
  trigger?: TextareaProps['trigger'];
  /** The user_id part of the feed that the activity should be posted to  */
  userId?: string;
}>;

export function StatusUpdateForm<T extends TransportType>({
  feedGroup = 'user',
  activityVerb = 'post',
  modifyActivityData,
  emojiData,
  emojiI18n,
  Header,
  FooterItem,
  Textarea = DefaultTextarea,
  trigger,
  doRequest,
  userId,
  onSuccess,
  style,
  className,
}: StatusUpdateFormProps<T>) {
  const { t } = useTranslationContext();
  const state = useStatusUpdateForm<T>({
    feedGroup,
    activityVerb,
    modifyActivityData,
    doRequest,
    userId,
    onSuccess,
  });

  return (
    <Panel style={style} className={className}>
      <form onSubmit={state.onSubmitForm}>
        <ImageDropzone handleFiles={state.uploadNewFiles}>
          <PanelHeading>{Header ?? <Title>{t('New Post')}</Title>}</PanelHeading>

          <PanelContent>
            <div style={{ display: 'flex' }}>
              {state.userData.profileImage && (
                <div style={{ marginRight: '16px' }}>
                  <Avatar image={state.userData.profileImage} size={50} circle />
                </div>
              )}

              {smartRender(Textarea, {
                emojiData,
                innerRef: state.textInputRef,
                onChange: state.onChange,
                onPaste: state.onPaste,
                placeholder: t('Type your post...'),
                trigger,
                value: state.text,
              })}
            </div>

            {state.isOgScraping && (
              <div className="raf-status-update-form__og-loading">
                <LoadingIndicator /> {t('Getting website data...')}
              </div>
            )}

            {state.activeOg && (
              <div style={{ margin: '8px 0' }}>
                {!state.activeOg.videos && !state.activeOg.audios ? (
                  <Card nolink handleClose={state.dismissOg} {...state.activeOg} />
                ) : (
                  <>
                    {!!state.activeOg.videos && <Video og={state.activeOg} handleClose={state.dismissOg} />}
                    {!!state.activeOg.audios && <Audio og={state.activeOg} handleClose={state.dismissOg} />}
                  </>
                )}
              </div>
            )}

            {state.availableOg && state.availableOg.length > 1 && (
              <ol className="raf-status-update-form__url-list">
                {state.availableOg.map(({ url, title }) => (
                  <li
                    onClick={() => state.setActiveOg(url as string)}
                    key={url}
                    className={`raf-status-update-form__url-list-item${
                      url === state.ogActiveUrl ? ' raf-status-update-form__url-list-item--active' : ''
                    }`}
                  >
                    <BookmarkIcon
                      style={{
                        width: '0.75em',
                        verticalAlign: '-0.125em',
                      }}
                    />{' '}
                    {title !== undefined ? title : url}
                  </li>
                ))}
              </ol>
            )}

            {state.images.order.length > 0 && (
              <ImagePreviewer
                imageUploads={state.images.order.map((id) => state.images.data[id]) as ImageUpload[]}
                handleRemove={state.removeImage}
                handleRetry={(id) => state.uploadImage(id, state.images.data[id])}
                handleFiles={state.uploadNewFiles}
              />
            )}

            {state.files.order.length > 0 && (
              <FilePreviewer
                uploads={state.files.order.map((id) => state.files.data[id]) as FileUpload[]}
                handleRemove={state.removeFile}
                handleRetry={(id) => state.uploadFile(id, state.files.data[id])}
                handleFiles={state.uploadNewFiles}
              />
            )}
          </PanelContent>

          <PanelFooter>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginRight: '32px', display: 'inline-block' }}>
                  <ImageUploadButton resetOnChange handleFiles={state.uploadNewFiles} multiple />
                </div>
                <div style={{ marginRight: '32px', display: 'inline-block' }}>
                  <FileUploadButton handleFiles={state.uploadNewFiles} multiple />
                </div>
                <EmojiPicker onSelect={state.onSelectEmoji} emojiData={emojiData} i18n={emojiI18n} />
                {FooterItem}
              </div>

              <Button type="submit" buttonStyle="primary" loading={state.submitting} disabled={!state.canSubmit()}>
                {t('Post')}
              </Button>
            </div>
          </PanelFooter>
        </ImageDropzone>
      </form>
    </Panel>
  );
}
