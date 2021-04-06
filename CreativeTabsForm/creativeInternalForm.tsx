import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Form, Input } from 'antd';
import { isNil } from 'ramda';

import { CreativeStatus } from 'components/common/forms/campaign-status';
import { FormLabel } from 'components/common/forms/elements';
import { ImageCropper } from '../ImageCropper';
import { NotificationPreview } from '../NotificationPreview';
import { CampaignContentForm } from '../CampaignContentForm';
import { CreativeFormCol, CreativeFormPreview, CreativeFormRow, StyledEmojiInput, CreativeImagesRow } from './elements';

import { CreativeStatuses, ICreative } from 'modules/api-requests/campaigns/entities';
import { ImageType, IUploadRequest, IUploadResponse } from 'modules/api-requests/resource/entities';
import { FormInstance } from 'antd/es/form';

interface IInternalCreative extends ICreative {
  canSave?: boolean;
}

interface ICreativeFormProps {
  uploadRequest?: (data: IUploadRequest, type: ImageType) => Promise<IUploadResponse>;
  getResourceRequest: (imgId: string) => Promise<any>;
  value?: IInternalCreative;
  creativeIndex: number;
  form: FormInstance;
  canSwitchCreativeType: boolean;
}

export const CreativeInternalForm = ({
  uploadRequest,
  getResourceRequest,
  value,
  creativeIndex,
  form,
  canSwitchCreativeType,
}: ICreativeFormProps) => {
  const { t } = useTranslation();
  const initialValues =
    value ||
    (({
      id: undefined,
      canSave: false,
      title: '',
      description: '',
      image: '',
      icon: '',
      status: CreativeStatuses.PENDING,
    } as any) as IInternalCreative);
  const [iconURL, setIconURL] = useState<string>('');
  const [imageURL, setImageURL] = useState<string>('');
  const [isImageLoading, setImageLoading] = useState(false);
  const [isIconLoading, setIconLoading] = useState(false);
  const [canSaveWithoutModerate, setCanSaveWithoutModerate] = useState(Boolean(initialValues.id));

  const [showTranslatedTitle, setTranslatedTitle] = useState(true);
  const [showTranslatedDescription, setTranslatedDescription] = useState(true);
  const onTitleChange = () => setTranslatedTitle(false);
  const onDescriptionChange = () => setTranslatedDescription(false);
  const translatedTitle = showTranslatedTitle ? initialValues.titleTranslation : undefined;
  const translatedMessage = showTranslatedDescription ? initialValues.descriptionTranslation : undefined;

  useEffect(() => {
    !isNil(initialValues.canSave)
      ? setCanSaveWithoutModerate(initialValues.canSave)
      : setCanSaveWithoutModerate(Boolean(initialValues.id));
  }, [initialValues.canSave, initialValues.id]);

  return (
    <CreativeFormRow>
      <CreativeFormCol>
        <Form.Item name={[creativeIndex, 'id']} noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name={[creativeIndex, 'canSave']} noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name={[creativeIndex, 'status']} noStyle>
          <Input hidden />
        </Form.Item>
        <CreativeStatus
          form={form}
          creativeIndex={creativeIndex}
          creative={initialValues}
          canSaveWithoutModerate={canSaveWithoutModerate}
        />
        {initialValues.id && (
          <CampaignContentForm
            creativeIndex={creativeIndex}
            creativeId={initialValues.id}
            disabled={!canSwitchCreativeType}
          />
        )}
        <Form.Item
          label={t('Title')}
          name={[creativeIndex, 'title']}
          rules={[
            { required: true, whitespace: true, message: t('Input a campaign title') },
            { max: 128, message: t('Too much letters') },
          ]}
        >
          <StyledEmojiInput id="title" onChange={onTitleChange} />
        </Form.Item>
        <Form.Item
          label={t('Description')}
          name={[creativeIndex, 'description']}
          rules={[{ max: 256, message: t('Too much letters') }]}
        >
          <StyledEmojiInput id="description" onChange={onDescriptionChange} />
        </Form.Item>
        <CreativeImagesRow gutter={16}>
          <Col span={24} sm={7} style={{minWidth: 100}}>
            <FormLabel label={t('Icon')} required />
            <Form.Item
              name={[creativeIndex, 'icon']}
              rules={[{ required: true, message: t('Icon picture is required') }]}
            >
              <ImageCropper
                minHeight={192}
                minWidth={192}
                maxHeight={192}
                maxWidth={192}
                aspect={1}
                title={t(' ')}
                uploadRequest={uploadRequest}
                getResourceRequest={getResourceRequest}
                onCropURLChanged={setIconURL}
                onLoadingChanged={setIconLoading}
                type={ImageType.ICON}
              />
            </Form.Item>
          </Col>
          <Col span={24} sm={17}>
            <FormLabel label={t('Image')} />
            <Form.Item name={[creativeIndex, 'image']}>
              <ImageCropper
                minHeight={240}
                minWidth={360}
                maxHeight={800}
                maxWidth={1200}
                aspect={1.5}
                uploadRequest={uploadRequest}
                getResourceRequest={getResourceRequest}
                onCropURLChanged={setImageURL}
                onLoadingChanged={setImageLoading}
                type={ImageType.IMAGE}
              />
            </Form.Item>
          </Col>
        </CreativeImagesRow>
      </CreativeFormCol>
      <CreativeFormPreview>
        <NotificationPreview
          title={initialValues.title}
          message={initialValues.description}
          translatedTitle={translatedTitle}
          translatedMessage={translatedMessage}
          iconURL={iconURL}
          imageURL={imageURL}
          isIconLoading={isIconLoading}
          isImageLoading={isImageLoading}
        />
      </CreativeFormPreview>
    </CreativeFormRow>
  );
};
