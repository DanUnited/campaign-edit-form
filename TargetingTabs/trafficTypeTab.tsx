import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Tooltip } from 'antd';

import usePrevious from 'utils/hooks/usePrevious';
import { useTargetingContext } from './targetingContext/targetingContext';
import { setValidationError, trafficTypeChangeAction } from './targetingContext/store';
import { TrafficType } from 'modules/api-requests/campaigns/entities';
import { FormSwitch } from '../FormSwitch';
import { Dictionaries } from 'models/dictionary/entities';

interface ITrafficTypeForm {
  value?: TrafficType[] | null,
  onChange?: (value: TrafficType[] | null) => void,
}

const TrafficTypeForm = ({ value, onChange }: ITrafficTypeForm) => {
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();
  const [mainStreamFlag, setMainStreamFlag] = useState(true);
  const [adultFlag, setAdultFlag] = useState(true);
  const prevValue = usePrevious(value, [TrafficType.ADULT, TrafficType.MAINSTREAM]);

  useEffect(() => {
    if (onChange) {
      if (!adultFlag && !mainStreamFlag) {
        onChange([]);
        dispatch(setValidationError(
          'trafficType' as any as Dictionaries,
          t('Traffic type: enable at least one option'),
        ));
      } else {
        const resultValue: TrafficType[] = [];
        if (mainStreamFlag) {
          resultValue.push(TrafficType.MAINSTREAM);
        }
        if (adultFlag) {
          resultValue.push(TrafficType.ADULT);
        }
        onChange(resultValue);
        dispatch(setValidationError('trafficType' as any as Dictionaries, undefined));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainStreamFlag, adultFlag]);

  useEffect(() => {
    let badge = t('All');
    if (value?.length === 0) {
      badge = t('None');
    } else if (value?.length === 1) {
      badge = value?.includes(TrafficType.ADULT) ? t('Adult') : t('Mainstream');
    }
    dispatch(trafficTypeChangeAction(badge));
  }, [value, dispatch, t]);

  useEffect(() => {
    if (!prevValue && value) {
      setMainStreamFlag(value.includes(TrafficType.MAINSTREAM));
      setAdultFlag(value.includes(TrafficType.ADULT));
    }
  }, [value, prevValue]);

  return (
    <div>
      <Form.Item>
        <Tooltip title={t('Traffic from subscribers collected from mainstream sites')} placement={'right'}>
          <FormSwitch value={mainStreamFlag} onChange={setMainStreamFlag}>{t('Mainstream')}</FormSwitch>
        </Tooltip>
      </Form.Item>
      <Form.Item>
        <Tooltip title={t('Traffic from subscribers collected from adult sites')} placement={'right'}>
          <FormSwitch value={adultFlag} onChange={setAdultFlag}>{t('Adult')}</FormSwitch>
        </Tooltip>
      </Form.Item>
    </div>
  );
};

export const TrafficTypeTab = () => {
  return (
    <Form.Item name="trafficType">
      <TrafficTypeForm />
    </Form.Item>
  );
};