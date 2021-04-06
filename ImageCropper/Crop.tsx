import ReactCrop, { Crop } from 'react-image-crop';
import React, { useState } from 'react';

interface IProps extends Omit<ReactCrop.ReactCropProps, 'crop' | 'onChange'> {
  aspect: number;
}

export default ({ aspect, ...props }: IProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    aspect,
  });

  return (
    <ReactCrop
      crop={crop}
      ruleOfThirds
      onChange={setCrop}
      style={{ display: 'inline-block' }}
      keepSelection={true}
      {...props}
    />
  );
};
