import React from 'react';
import { Skeleton, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

import {
  AndroidContentContainer,
  AndroidHeaderContainer, AndroidImageContainer, AndroidNotifyIconContainer,
  AndroidPreviewContainer, AndroidUpIcon, ChromeIcon,
  ContentMessage,
  ContentTitle,
  Flex,
  HeaderTime,
} from './elements';
import { INotificationPreviewProps } from './index';

export const AndroidPreview = ({
  isImageLoading,
  isIconLoading,
  title,
  message,
  imageURL,
  iconURL,
}: INotificationPreviewProps) => {
  const { t } = useTranslation();

  return (
    <AndroidPreviewContainer>
      <AndroidHeaderContainer>
        <ChromeIcon className="fab fa-chrome" />
        <span>Chrome • mondiad.com</span>
        <HeaderTime>{t('now')}</HeaderTime>
        <AndroidUpIcon />
        <AndroidNotifyIconContainer>
          <Spin spinning={isIconLoading}>
            {isIconLoading && <Skeleton.Avatar />}
            {iconURL && !isIconLoading && <img src={iconURL} alt={t('icon')} />}
          </Spin>
        </AndroidNotifyIconContainer>
      </AndroidHeaderContainer>
      <AndroidContentContainer>
        <Flex>
          <ContentTitle>
            {title}
          </ContentTitle>
        </Flex>
        <Flex>
          <ContentMessage>
            {message}
          </ContentMessage>
        </Flex>
      </AndroidContentContainer>
      <Spin spinning={isImageLoading}>
        {
          isImageLoading && (
            <AndroidImageContainer>
              <Skeleton.Image style={{ width: 150, height: 150 }} />
            </AndroidImageContainer>
          )
        }
        {
          imageURL && !isImageLoading && (
            <AndroidImageContainer>
              <img src={imageURL} alt={t('image notification')} />
            </AndroidImageContainer>
          )
        }
      </Spin>
    </AndroidPreviewContainer>
  );
}
