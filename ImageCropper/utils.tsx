import { Crop } from 'react-image-crop';
import { pathOr } from 'ramda';
import { fetch } from 'whatwg-fetch';
import toBlob from 'canvas-to-blob';
import calcFinalSize from './calcFinalSize';

interface IProps {
  setScale: (value: {x: number, y: number}) => void;
  minHeight: number;
  minWidth: number;
  maxHeight: number;
  maxWidth: number;
}

export const getCroppedImgFunc = ({ setScale, minWidth, minHeight, maxWidth, maxHeight }: IProps) =>
  (image: HTMLImageElement, cropProp: Crop): Promise<string> => {
    const canvas = document.createElement('canvas');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    setScale({ x: scaleX, y: scaleY });

    const cropHeight = pathOr(0, ['height'])(cropProp) * scaleY;
    const cropWidth = cropHeight * pathOr(0, ['aspect'])(cropProp);
    const cropX = pathOr(0, ['x'])(cropProp) * scaleX;
    const cropY = pathOr(0, ['y'])(cropProp) * scaleY;

    const { width: targetWidth, height: targetHeight } = calcFinalSize(
      cropWidth, cropHeight,
      minWidth, minHeight,
      maxWidth, maxHeight,
    );

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight,
      );
    }

    return getImageMime(image).then((mimeType) => {
      const filteredMimeType = ['image/bmp', 'unknown'].includes(mimeType) ? 'image/jpeg' : mimeType;
      return new Promise<string>((resolve, reject) => {
        toBlob.init();
        canvas.toBlob((blob: Blob | null) => {
          if (!blob) {
            reject();
          }
          const url = URL.createObjectURL(blob);

          return resolve(url);
        }, filteredMimeType);
      });
    });
  };

export const getBase64FromBlob = (
  img: Blob | File | undefined,
  callback: (img: string | ArrayBuffer | null) => void,
) => {
  if (img) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
};

export const getMimeFromHeader = (header: string): string => {
  // https://en.wikipedia.org/wiki/List_of_file_signatures
  // https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern

  if (header.slice(0, 4) === '424d') {
    return 'image/bmp';
  }
  switch (header) {
    case '89504e47':
      return 'image/png';
    case '47494638':
      return 'image/gif';
    case '52494646':
      return 'image/webp';
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
    case 'ffd8ffe3':
    case 'ffd8ffe8':
      return 'image/jpeg';
    default:
      return 'unknown';
  }
};

export const getImageMime = (img: HTMLImageElement) => {
  if (img) {
    return fetch(img.src).then((response) => response.blob()).then((imgBlob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const arr = (new Uint8Array(reader.result as any)).subarray(0, 4);
          const header = arr.reduce((out, item) => out + item.toString(16), '');
          resolve(getMimeFromHeader(header));
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(imgBlob);
      }),
    );
  }

  return Promise.reject();
};
