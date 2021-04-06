import React, { useCallback, useEffect, useState } from 'react';
import useForceUpdate from 'antd/es/_util/hooks/useForceUpdate';
import { Form, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { equals } from 'ramda';

import { setValidationError, zoneChangeAction } from './targetingContext/store';
import { Dictionaries } from 'models/dictionary/entities';
import { TargetingTextArea } from '../TargetingTextArea';
import { useTargetingContext } from './targetingContext/targetingContext';
import { zoneIdsValidator } from '../validators';
import { isNotEmpty } from 'utils/ramda';
import { RadioWrapper } from '../elements';
import { useTargetingValidationStatus } from './targetingContext/utils';
import useDebounce from 'utils/debounce';
import usePrevious from 'utils/hooks/usePrevious';

import { FormInstance } from 'antd/es/form';

interface IZoneTabProps {
  form: FormInstance;
}

let itemCount = 0;

export const ZoneTab = ({ form }: IZoneTabProps) => {
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();
  const forceUpdate = useForceUpdate();
  const zoneIdList = form.getFieldValue('zoneIdList') || [];
  const [formValues, setFormValues] = useState([]);
  const forValuesObj = JSON.stringify({ ...formValues });
  const [lines, setLines] = useState<string[]>([]);
  const debouncedLines = useDebounce(lines, 125);
  const prevLines = usePrevious(debouncedLines, null);

  const validateZoneId = useCallback((items: string[]) => {
    zoneIdsValidator(null, items).then(
      () =>  {
        dispatch(setValidationError('zone' as any as Dictionaries, undefined));
        forceUpdate();
      },
      (e) =>  {
        dispatch(setValidationError('zone' as any as Dictionaries, e));
        forceUpdate();
      },
    )
  }, [forceUpdate, dispatch]);

  useEffect(() => {
    if (prevLines !== null) {
      const updatedItemCount = debouncedLines.length;
      if (!equals(itemCount, updatedItemCount)) {
        itemCount = updatedItemCount;
        dispatch(zoneChangeAction(itemCount ? String(itemCount) : t('None')));
      }

      validateZoneId(debouncedLines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLines, prevLines, validateZoneId])

  useEffect(() => {
    setFormValues(zoneIdList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneIdList.length]);

  useEffect(() => {
    const listener = (customEvent: any) => {
      setFormValues(customEvent.detail.zoneIdList);
    };
    document.addEventListener('changeBlackWhiteLists', listener, true);
    return () => document.removeEventListener('changeBlackWhiteLists', listener, true);
  }, []);

  useEffect(() => {
    setLines(formValues.filter(isNotEmpty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forValuesObj]);

  const getValidationStatus = useTargetingValidationStatus();

  const onBlur =  useCallback((items: string[]) => validateZoneId(items), [validateZoneId]);

  return (
    <>
      <Form.Item name="zoneIdListMode">
        <Radio.Group>
          <RadioWrapper value={'blacklist'}>
            <b>{t('Blacklist')}</b> <i>{t('(the sources will be blocked)')}</i>
          </RadioWrapper>
          <RadioWrapper value={'whitelist'}>
            <b>{t('Whitelist')}</b> <i>{t('(only the sources from this list)')}</i>
          </RadioWrapper>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="zoneIdList" validateStatus={getValidationStatus('zone')}>
        <TargetingTextArea onChangeCallback={setLines} onBlurCallback={onBlur} />
      </Form.Item>
    </>
  );
};
