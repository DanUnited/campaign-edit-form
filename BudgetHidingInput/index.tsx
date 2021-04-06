import React, { Ref, useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';

import { BlurNumberInput } from 'components/common/forms/input/blurNumberInput';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { InputNumberProps } from 'antd/es/input-number';

interface IProps {
  value?: number;
  useOnChange?: (_: string | number | undefined) => void;
  onChange?: (_: string | number | undefined) => void;
  style?: object;
}

export const budgetFormatter = (value?: number | string) => `$ ${value}`;
export const budgetParser = (v?: string) => v?.replace(/\$|\s|(,*)/g, '') ?? '';
const maxValue = 1e7;

export const BudgetHidingInput = React.forwardRef(({ value, onChange, useOnChange, ...props }: IProps, ref: Ref<InputNumberProps>) => {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if ((value || value === 0) && disabled) {
      setDisabled(false);
    }

    if (useOnChange) {
      useOnChange(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onChecked = (e: CheckboxChangeEvent) => {
    setDisabled(e.target.checked);
    if (onChange) {
      onChange(undefined);
    }
  };

  const disableStyles: any = disabled ? {
    opacity: 0,
    pointerEvents: 'none',
  } : {
    opacity: 1,
  };

  return (
    <>
      <Checkbox checked={disabled} onChange={onChecked}>{t('Unlimited')}</Checkbox>
      <BlurNumberInput
        {...props}
        style={{ ...disableStyles, ...props.style }}
        formatter={budgetFormatter}
        parser={budgetParser}
        precision={2}
        min={20}
        max={maxValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
        ref={ref}
      />
    </>
  );
});
