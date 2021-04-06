import React, { Ref, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Button, Tooltip, notification } from 'antd';

import { isAdminRole } from 'models/currentUser';
import { Title, TextP, PreviewContainer, TranslateImage, TranslateButton, ButtonWrapper } from './elements';
import { DesktopPreview } from './DesktopPreview';

export interface INotificationPreviewProps {
  isImageLoading: boolean;
  isIconLoading: boolean;
  imageURL?: string;
  iconURL?: string;
  title?: string;
  message?: string;
  translatedTitle?: string;
  translatedMessage?: string;
  column?: boolean;
}

export const openNotification = ({
  title = '',
  message,
  imageURL,
  iconURL,
}: Omit<INotificationPreviewProps, 'isImageLoading' | 'isIconLoading'>) => {
  const titleText = title?.length >= 48 ? title?.substring(0, 45) + '...' : title;
  const bodyText = message
    ? message?.length > 100 ? title?.substring(0, 99) + '...' : message
    : undefined;

  Notification.requestPermission((permission: NotificationPermission) => {
    if (permission === 'granted') {
      try {
        return new Notification(titleText, {
          body: bodyText,
          icon: iconURL ? iconURL : undefined,
          image: imageURL ? imageURL : undefined,
        });
      } catch (error) {
        notification.warn({
          message: i18n.t('Notification error'),
          description: i18n.t('Notifications are not available in your browser'),
        });
      }
    } else {
      notification.warn({
        message: i18n.t('Notification error'),
        description: i18n.t('Notification permissions should be granted in your browser'),
      });
    }
  });
};

export const NotificationPreview = React.forwardRef(
  (
    {
      imageURL,
      iconURL,
      title,
      message,
      translatedTitle,
      translatedMessage,
      isImageLoading,
      isIconLoading,
      column,
    }: INotificationPreviewProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const { t } = useTranslation();
    const isAdmin = useSelector(isAdminRole);
    const [translate, setTranslate] = useState(false);
    const onTranslate = () => setTranslate((v) => !v);
    const translateDisabled = !translatedTitle && !translatedMessage;
    const titleText = title ? title : t('Here goes the title.');

    const onOpenNotification = () =>
      openNotification({
        title: titleText,
        message,
        imageURL,
        iconURL,
      });

    return (
      <PreviewContainer ref={ref} data-column={column}>
        <Title>{t('Notification Preview')}</Title>
        <DesktopPreview
          title={translate && translatedTitle ? translatedTitle : titleText}
          message={translate && translatedMessage ? translatedMessage : message}
          imageURL={imageURL}
          iconURL={iconURL}
          isImageLoading={isImageLoading}
          isIconLoading={isIconLoading}
        />
        <Title>{t('Online Preview')}</Title>
        <TextP>{t('*To be able to see the notification you need to allow us to send you push notifications.')}</TextP>
        <ButtonWrapper>
          <Button onClick={onOpenNotification} type="primary">
            {t('Preview')}
          </Button>
          {isAdmin ? (
            <Tooltip title={t('Translate')}>
              <TranslateButton
                onClick={onTranslate}
                disabled={translateDisabled}
                type={translate ? 'primary' : 'default'}
                icon={
                  <TranslateImage
                    data-active={translate}
                    data-disabled={translateDisabled}
                    src="/img/google-translate.svg"
                    alt={t('Translate')}
                  />
                }
              />
            </Tooltip>
          ) : null}
        </ButtonWrapper>
      </PreviewContainer>
    );
  },
);
