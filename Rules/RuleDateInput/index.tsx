import React, { useCallback, useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import { Dropdown, Radio, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';
import { InnerPickerBlock, StyledRadio, StyledMenuItem } from './elements';
import { NumberInputItem } from 'components/common/forms/input/numberInput';

import { InputProps } from 'antd/es/input';
import { RadioChangeEvent } from 'antd/es/radio';

export const getValueForDaysTitle = (value: number | string = 0) => {
  switch (value) {
    case 0:
      return i18n.t('Today');
    case 1:
      return i18n.t('Yesterday');
    default:
      return i18n.t('Last') + ` ${value} ` + i18n.t('days');
  }
};

interface IRuleDateInput {
  value?: number;
  onChange?: (value: number) => void;
  inputProps?:  Omit<InputProps, 'onChange'>;
}

export const RuleDateInput = ({ value, onChange, inputProps }: IRuleDateInput) => {
  const [innerValue, setInnerValue] = useState<number | undefined>(0);
  const shouldRenderCustom = ![0, 1, 7].includes(value || 0);
  const { t } = useTranslation();

  const onChangeEvent = useCallback((e: RadioChangeEvent | React.FocusEvent<HTMLInputElement>) => {
    setInnerValue(Number(e.target.value));
    if (onChange) {
      onChange(Number(e.target.value));
    }
  }, [onChange]);

  const onInputChange = useCallback((val?: number | string) => {
    setInnerValue(val as number);
  }, []);

  useEffect(() => {
    if (value && (innerValue !== value)) {
      setInnerValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const overlay = useMemo(() => (
    <Menu>
      <StyledMenuItem>
        <Radio.Group onChange={onChangeEvent} value={value} style={{ width: 120 }}>
          <StyledRadio value={0}>
            {getValueForDaysTitle(0)}
          </StyledRadio>
          <StyledRadio value={1}>
            {getValueForDaysTitle(1)}
          </StyledRadio>
          <StyledRadio value={7}>
            {getValueForDaysTitle(7)}
          </StyledRadio>
          <StyledRadio value={10}>
            {getValueForDaysTitle('x')}
          </StyledRadio>
        </Radio.Group>
      </StyledMenuItem>
    </Menu>
  ), [onChangeEvent, value]);

  return <>
    {
      shouldRenderCustom ? (
        <InnerPickerBlock style={{ width: 160 }}>
          <span>{t('last')} </span>
          <NumberInputItem
            addonAfter={'days'}
            style={{ width: 100 }}
            onBlur={onChangeEvent}
            value={innerValue}
            onChange={onInputChange}
            min={0}
            {...inputProps}
          />
          <Dropdown overlay={overlay} trigger={['click']}>
            <DownOutlined />
          </Dropdown>
        </InnerPickerBlock>
      ) : (
        <Dropdown overlay={overlay} trigger={['click']}>
          <div className={'ant-input-number'} style={{ width: 110 }}>
            <InnerPickerBlock>
              {getValueForDaysTitle(innerValue)}
              <DownOutlined />
            </InnerPickerBlock>
          </div>
        </Dropdown>
      )
    }
  </>;
};