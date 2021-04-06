import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, InputNumber, Row, Col, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { isNil } from 'ramda';

import { useTargetingContext } from './targetingContext/targetingContext';
import { setValidationError, ageChange } from './targetingContext/store';
import { Dictionaries } from 'models/dictionary/entities';
import { debounce } from 'utils/debounce';

import { FormInstance } from 'antd/es/form';
import { InputNumberProps } from 'antd/es/input-number';

interface IProps {
  form: FormInstance;
}

interface IExtendedInputNumber extends InputNumberProps {
  onChangeCallback?: (value: number | undefined | string | null) => void;
}

const ExtendedInputNumber = (props: IExtendedInputNumber) => {
  const { onChange, onChangeCallback, value } = props;

  const debouncedOnChangeCallback = useMemo(
    (): IExtendedInputNumber['onChangeCallback'] =>
      typeof onChangeCallback === 'function' ? debounce(onChangeCallback, 300) : undefined,
    [onChangeCallback],
  );

  const realOnChange = useCallback(
    (newValue: number | undefined | string | null) => {
      if (onChange) {
        onChange(newValue);
      }
      if (debouncedOnChangeCallback) {
        debouncedOnChangeCallback(newValue);
      }
    },
    [onChange, debouncedOnChangeCallback],
  );

  return <InputNumber {...props} onChange={realOnChange} value={value} />;
};

const defaultMinAge = 0;
const defaultMaxAge = 99;

export const AgeTab = ({ form }: IProps) => {
  const [hasInit, setHasInit] = useState(false);
  const [unlimitedAge, setUnlimitedAge] = useState(true);
  const [agesChangesCount, setAgesChangesCount] = useState(0); // for rerender
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();

  const minAge = form.getFieldValue('minAge');
  const maxAge = form.getFieldValue('maxAge');
  const hasAge = useMemo(() => Boolean(!isNil(minAge) || !isNil(maxAge)), [minAge, maxAge]);
  const emptyAge = useMemo(() => Boolean(minAge === undefined && maxAge === undefined), [minAge, maxAge]);

  const changeAge = useCallback(
    (isUnlimited: boolean) => {
      if (isUnlimited) {
        form.setFields([
          { name: 'minAge', value: null },
          { name: 'maxAge', value: null },
        ]);
      }
      setUnlimitedAge(isUnlimited);
    },
    [form],
  );

  useEffect(() => {
    if (!emptyAge && !hasInit) {
      setHasInit(true);
      setUnlimitedAge(!hasAge);
    }
  }, [emptyAge, hasInit, hasAge]);

  useEffect(() => {
    dispatch(ageChange(unlimitedAge ? t('All') : t('Custom')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlimitedAge]);

  useEffect(() => {
    dispatch(
      setValidationError(
        ('age' as any) as Dictionaries,
        !unlimitedAge && !hasAge ? t('Subscribers age: fill min and/or max values') : undefined,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAge, unlimitedAge]);

  // TODO: use forceUpdate instead
  const onChangeCallback = useCallback(() => {
    setAgesChangesCount(agesChangesCount + 1);
  }, [agesChangesCount]);

  return (
    <>
      <Form.Item>
        <Switch
          defaultChecked
          checkedChildren={t('All ages')}
          unCheckedChildren={t('Custom')}
          checked={unlimitedAge}
          onChange={changeAge}
        />
      </Form.Item>
      <Row gutter={16} style={{ opacity: Number(!unlimitedAge) }}>
        <Col>
          <Form.Item label={t('Min age (days)')} name="minAge">
            <ExtendedInputNumber
              min={defaultMinAge}
              max={maxAge || defaultMaxAge}
              onChangeCallback={onChangeCallback}
            />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label={t('Max age (days)')} name="maxAge">
            <ExtendedInputNumber
              min={minAge || defaultMinAge}
              max={defaultMaxAge}
              onChangeCallback={onChangeCallback}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
