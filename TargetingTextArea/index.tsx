import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Input } from 'antd';
import { trim, uniq } from 'ramda';

import { isNotEmpty } from 'utils/ramda';

interface IProps {
  value?: string[];
  onChange?: (_: string[]) => void;
  onChangeCallback?: (items: string[]) => void;
  onBlurCallback?: (items: string[]) => void;
}

const getItemsFromText = (value: string) => uniq(
  value
    .split('\n')
    .reduce((prevValue: string[], currentValue: string) =>
      [...prevValue, ...currentValue.split(/\s+/)], [])
    .map(trim)
    .filter(isNotEmpty),
);

export const TargetingTextArea: React.FC<IProps> = ({
  value = [],
  onChange = () => void 0,
  onChangeCallback,
  onBlurCallback,
}) => {
  const [trueValue, setTrueValue] = useState<string>('');

  useEffect(() => {
    if (value && value.length) {
      setTrueValue(value.join('\n'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.length]);

  const onChangeCb = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const items = e.target.value ? getItemsFromText(e.target.value) : [];
      setTrueValue(e.target.value);

      if (onChangeCallback) {
        onChangeCallback(items);
      }
    },
    [onChangeCallback],
  );

  const onBlur = useCallback(() => {
    const actualValue = getItemsFromText(trueValue);
    if (actualValue.length === value?.length) {
      setTrueValue(getItemsFromText(trueValue).join('\n'));
    }

    onChange(actualValue);
    if (onBlurCallback) {
      onBlurCallback(actualValue);
    }
  }, [onBlurCallback, onChange, trueValue, value]);

  return <Input.TextArea value={trueValue} onChange={onChangeCb} rows={10} onBlur={onBlur} />;
};
