import classNames from 'classnames';
import { EnrichedActivity } from 'getstream';
import React from 'react';
import { TransportType } from '../context/StreamApp';
import {
  ElementOrComponentOrLiteralType,
  PropsWithElementAttributes,
  UserOrDefaultReturnType,
  smartRender,
} from '../utils';
import { ActivityContentProps, ActivityContent as DefaultActivityContent } from './ActivityContent';
import { ActivityFooterProps } from './ActivityFooter';
import { ActivityHeaderProps, ActivityHeader as DefaultActivityHeader } from './ActivityHeader';
import { CardProps, Card as DefaultCard } from './Card';

type WordClickHandler = (word: string) => void;

export type ActivityProps<T extends TransportType> = PropsWithElementAttributes<{
  /** The activity received for stream for which to show the like button. This is
   * used to initialize the toggle state and the counter. */
  activity: EnrichedActivity<T>;
  /** Card component to display.
   * #Card (Component)#
   */
  Card?: ElementOrComponentOrLiteralType<CardProps>;
  /** Content component to display.
   * #ActivityContent (Component)#
   */
  Content?: ElementOrComponentOrLiteralType<ActivityContentProps<T>>;
  /** The feed group part of the feed that the activity should be reposted to
   * when pressing the RepostButton, e.g. `user` when posting to your own profile
   * defaults to 'user' feed */
  feedGroup?: string;
  Footer?: ElementOrComponentOrLiteralType<ActivityFooterProps<T>>;
  /** Header component to display.
   * #ActivityHeader (Component)#
   */
  Header?: ElementOrComponentOrLiteralType<ActivityHeaderProps<T>>;
  HeaderRight?: ElementOrComponentOrLiteralType;
  icon?: string;
  /** Handler for any routing you may do on clicks on Hashtags */
  onClickHashtag?: WordClickHandler;
  /** Handler for any routing you may do on clicks on Mentions */
  onClickMention?: WordClickHandler;
  onClickUser?: (user: UserOrDefaultReturnType<T>) => void;
  /** UI component to render original activity within a repost
   * #Repost (Component)#
   */
  Repost?: ElementOrComponentOrLiteralType<ActivityProps<T>>;
  /** The user_id part of the feed that the activity should be reposted to when
   * pressing the RepostButton */
  userId?: string;
}>;

const DefaultRepost = <T extends TransportType>({
  Header = DefaultActivityHeader,
  HeaderRight,
  Content = DefaultActivityContent,
  activity,
  icon,
  onClickHashtag,
  onClickMention,
  onClickUser,
}: ActivityProps<T>) => (
  <div className="raf-card raf-activity raf-activity-repost">
    {smartRender<ActivityHeaderProps<T>>(Header, {
      HeaderRight,
      icon,
      activity,
      onClickUser,
    })}
    {smartRender<ActivityContentProps<T>>(Content, { onClickMention, onClickHashtag, activity })}
  </div>
);

export const Activity = <T extends TransportType>({
  Header = DefaultActivityHeader,
  HeaderRight,
  Content = DefaultActivityContent,
  Footer,
  Card = DefaultCard,
  activity,
  icon,
  onClickHashtag,
  onClickMention,
  onClickUser,
  Repost = DefaultRepost,
  userId,
  feedGroup,
  className,
  style,
}: ActivityProps<T>) => (
  <div className={classNames('raf-activity', className)} style={style}>
    {smartRender<ActivityHeaderProps<T>>(Header, { HeaderRight, icon, activity, onClickUser })}
    {smartRender<ActivityContentProps<T>>(Content, {
      activity,
      Content,
      Card,
      feedGroup,
      Footer,
      Header,
      HeaderRight,
      icon,
      onClickHashtag,
      onClickMention,
      onClickUser,
      Repost,
      userId,
    })}
    {smartRender<ActivityFooterProps<T>>(Footer, { activity, feedGroup, userId })}
  </div>
);
