import React, { useEffect } from 'react';
import { InputNumber } from 'antd';
import usePrevious from 'utils/hooks/usePrevious';

import { InputNumberProps } from 'antd/es/input-number';
interface IThresholdInput extends Omit<InputNumberProps, 'onChange'> {
  onChange?: (value?: number | string | null) => void;
}

// based on rc-input-number
function toPrecisionAsStep(precision: number, num?: number | string) {
  if (!isNaN(Math.abs(precision)) && num !== undefined) {
    return Number(num).toFixed(Math.abs(precision));
  }

  return num;
}

export const ThresholdInput = ({ onChange, value, precision = 0, ...props }: IThresholdInput) => {
  const prevPrevision = usePrevious(precision, 0);

  useEffect(() => { // restore 2.001 to 2, by default it doesn't
    if ((prevPrevision !== precision) && onChange) {
      onChange(toPrecisionAsStep(precision, value));
    }
  }, [precision, value, onChange, prevPrevision]);

  return (
    <InputNumber
      placeholder={'Value'}
      min={0}
      precision={precision}
      {...props}
      style={{ width: 90, marginLeft: 8 }}
      onChange={onChange}
      value={value}
    />
  );
};