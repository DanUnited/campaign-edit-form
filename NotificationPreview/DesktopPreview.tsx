import React from 'react';
import { Skeleton, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import {
  ChromeIcon,
  ContentContainer,
  ContentMessage,
  ContentTitle,
  DesktopPreviewContainer,
  Flex,
  HeaderContainer,
  ImageContainer,
  NotifyIconContainer,
  UpIcon,
} from './elements';
import { INotificationPreviewProps } from './index';

export const DesktopPreview = ({
  isImageLoading,
  isIconLoading,
  title,
  message,
  imageURL,
  iconURL,
}: INotificationPreviewProps) => {
  const { t } = useTranslation();

  return (
    <DesktopPreviewContainer>
      <HeaderContainer>
        <ChromeIcon className="fab fa-chrome" />
        <span>Chrome • mondiad.com</span>
        <UpIcon />
        <NotifyIconContainer>
          <Spin spinning={isIconLoading}>
            {isIconLoading && <Skeleton.Avatar />}
            {iconURL && !isIconLoading && <img src={iconURL} alt={t('icon')} />}
          </Spin>
        </NotifyIconContainer>
      </HeaderContainer>
      <ContentContainer>
        <Flex>
          <ContentTitle>{title}</ContentTitle>
        </Flex>
        <Flex>
          <ContentMessage>{message}</ContentMessage>
        </Flex>
      </ContentContainer>
      <Spin spinning={isImageLoading}>
        {isImageLoading && (
          <ImageContainer>
            <Skeleton.Image style={{ width: 150, height: 150 }} />
          </ImageContainer>
        )}
        {imageURL && !isImageLoading && (
          <ImageContainer>
            <img src={imageURL} alt={t('image notification')} />
          </ImageContainer>
        )}
      </Spin>
    </DesktopPreviewContainer>
  );
};
