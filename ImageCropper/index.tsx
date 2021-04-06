import React, { Ref, useCallback, useEffect, useRef, useState } from 'react';
import { Crop } from 'react-image-crop';
import { pathOr, isEmpty } from 'ramda';
import { Modal, message, Alert, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { RcFile } from 'antd/lib/upload';
import { fetch } from 'whatwg-fetch';

import { ImageType, IUploadRequest, IUploadResponse } from 'modules/api-requests/resource/entities';
import useImage from 'utils/hooks/useImage';
import usePrevious from 'utils/hooks/usePrevious';
import CropElement from './Crop';

import { CropControlsContainer, DraggerContainer, PlusIcon, StyledDragger } from './elements';
import { getBase64FromBlob, getCroppedImgFunc } from './utils';

export interface IImageCropper {
  uploadRequest?: (data: IUploadRequest, type: ImageType) => Promise<IUploadResponse>;
  getResourceRequest?: (a: string) => Promise<any>;
  minHeight: number;
  minWidth: number;
  maxHeight?: number;
  maxWidth?: number;
  aspect?: number;
  title?: string;
  value?: string;
  onChange?: (url: string | null) => void;
  onCropURLChanged?: (url: string) => void;
  onLoadingChanged?: (isLoading: boolean) => void;
  disabled?: boolean;
  type: ImageType;
}

export const ImageCropper = React.forwardRef(({
    minHeight,
    minWidth,
    maxHeight = Infinity,
    maxWidth = Infinity,
    aspect = 2,
    title,
    uploadRequest,
    getResourceRequest,
    onCropURLChanged,
    onLoadingChanged,
    value,
    onChange,
    disabled,
    type,
  }: IImageCropper,
  ref: Ref<HTMLDivElement>,
) => {
  const [croppedImgURL, setCroppedImgUrl] = useState<string>('');
  const [croppedImgURLCache, setCroppedImgURLCache] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const visibleRef = useRef(false);
  const [scale, setScale] = useState({
    x: 1,
    y: 1,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    visibleRef.current = visibleModal;
  }, [visibleModal]);

  useEffect(() => {
    if (onCropURLChanged) {
      onCropURLChanged(croppedImgURL);
    }
  }, [onCropURLChanged, croppedImgURL]);

  const [originalSrc, setOriginalSrc] = useState<string>();

  const onImageSet = useCallback((objectURL: string) => {
    setOriginalSrc(objectURL);
    setCroppedImgUrl(objectURL);
    setCroppedImgURLCache(objectURL);
  }, [setCroppedImgUrl, setCroppedImgURLCache]);
  const [, , isImageLoading] = useImage(value, getResourceRequest, onImageSet);

  useEffect(() => {
    if (onLoadingChanged) {
      onLoadingChanged(isImageLoading);
    }
  }, [isImageLoading, onLoadingChanged]);

  const prevCroppedImgURL = usePrevious<string>(croppedImgURL, '');

  useEffect(() => {
    if (!isEmpty(prevCroppedImgURL) && prevCroppedImgURL !== croppedImgURLCache) {
      URL.revokeObjectURL(prevCroppedImgURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [croppedImgURL]);

  const onImageLoaded = useCallback((image: HTMLImageElement) => {
    imgRef.current = image;
    if (image.naturalHeight < minHeight || image.naturalWidth < minWidth) {
      setErrorMsg(t(`This image doesn't have a proper size.`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minHeight, minWidth, imgRef, setErrorMsg]);

  const getCroppedImg = useCallback(
    getCroppedImgFunc({ setScale, minWidth, minHeight, maxWidth, maxHeight }),
    [setScale, minWidth, minHeight, maxWidth, maxHeight],
  );

  const onCropComplete = useCallback(async (cropProp: Crop) => {
    if (imgRef.current && cropProp.width) {
      const croppedImageUrl = await getCroppedImg(
        imgRef.current,
        cropProp,
      );

      if (croppedImageUrl && visibleRef.current) {
        setCroppedImgUrl(croppedImageUrl);
      }
    }
  }, [imgRef, visibleRef, getCroppedImg, setCroppedImgUrl]);

  const handleOk = useCallback(() => {
    setVisibleModal(false);
    setCroppedImgURLCache(croppedImgURL);

    setIsImageUploading(true);
    fetch(croppedImgURL).then((response) => response.blob()).then((imgBlob: Blob) => {
      const formData = new FormData();
      formData.append('resource', imgBlob, 'filename');

      if (uploadRequest) {
        uploadRequest(formData, type).then((result) => {
          const fileName = pathOr('', ['value', 'data'])(result);
          if (onChange) {
            onChange(fileName);
          }
          setIsImageUploading(false);
        });
      }
    });
  }, [setVisibleModal, setCroppedImgURLCache, setIsImageUploading, croppedImgURL, uploadRequest, onChange, type]);

  const handleCancel = useCallback(() => {
    setCroppedImgUrl(croppedImgURLCache);
    setVisibleModal(false);
  }, [setCroppedImgUrl, croppedImgURLCache, setVisibleModal]);

  const beforeUpload = useCallback((file: RcFile): Promise<void | Blob | File> => {
    return new Promise(() => {
      const isCorrect =
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/gif' ||
        file.type === 'image/webp' ||
        file.type === 'image/ico' ||
        file.type === 'image/cur' ||
        file.type === 'image/bmp';

      if (!isCorrect) {
        message.error('Unsupported image extension');
        return Promise.reject();
      } else {
        setErrorMsg('');

        setIsImageUploading(true);

        getBase64FromBlob(file, (imageUrl) => {
          setOriginalSrc(imageUrl as string);
          setVisibleModal(true);
          setIsImageUploading(false);
        });

        return Promise.resolve(file);
      }
    });
  }, [setErrorMsg]);

  const innerContent = (
    <div>
      {
        !disabled && <PlusIcon className="fas fa-plus" />
      }
      <div>{title ? title : t('Drag your image here or click in this area.')}</div>
      <div>{t('Min size')}: {`${minWidth}x${minHeight}`}</div>
    </div>
  );

  const onCropEdit = useCallback(() => setVisibleModal(true), [setVisibleModal]);
  const onCropDelete = useCallback(() => {
    setCroppedImgUrl('');
    if (onChange) {
      onChange(null);
    }
  }, [setCroppedImgUrl, onChange]);

  const PreviewBlock = (
    <>
      {
        !disabled && (
          <CropControlsContainer>
            <i className="fas fa-pencil-alt" onClick={onCropEdit} />
            <i className="far fa-trash-alt" onClick={onCropDelete} />
          </CropControlsContainer>
        )
      }
      <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImgURL} />
    </>
  );

  return (
    <div style={{ maxWidth: minWidth }} ref={ref}>
      <Spin spinning={Boolean(isImageUploading || (isImageLoading && !croppedImgURL))}>
        <DraggerContainer
          width={minWidth}
          height={minHeight}
        >
          <StyledDragger
            showUploadList={false}
            beforeUpload={beforeUpload}
            disabled={disabled || (croppedImgURL !== '')}
            accept={'.jpeg,.png,.jpg,.gif,.webp,.ico,.cur,.bmp'}
          >
            {value && croppedImgURL ? PreviewBlock : innerContent}
          </StyledDragger>
        </DraggerContainer>
      </Spin>

      <Modal
        title={t('Crop Image')}
        visible={visibleModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('Crop')}
        destroyOnClose
        width={620}
        okButtonProps={{
          disabled: !isEmpty(errorMsg),
        }}
      >
        {originalSrc && (
          <>
            <CropElement
              src={originalSrc}
              minWidth={minWidth / scale.x}
              minHeight={minHeight / scale.y}
              aspect={aspect}
              onImageLoaded={onImageLoaded}
              onComplete={onCropComplete}
            />
            {
              errorMsg && <Alert message={errorMsg} type={'error'} />
            }
          </>
        )}
      </Modal>
    </div>
  );
});
