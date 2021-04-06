import React, { useCallback, useEffect, useState } from 'react';
import { Form, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { equals } from 'ramda';

import { sourceChangeAction } from './targetingContext/store';
import { TargetingTextArea } from '../TargetingTextArea';
import { useTargetingContext } from './targetingContext/targetingContext';
import { isNotEmpty } from 'utils/ramda';

import { FormInstance } from 'antd/es/form';
import { RadioWrapper } from '../elements';

interface ISubIdsTabProps {
  form: FormInstance;
}

let itemCount = 0;

export const SubIdsTab = ({ form }: ISubIdsTabProps) => {
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();
  const subIdList = form.getFieldValue('sourceTargeting') || [];
  const [formValues, setFormValues] = useState([]);
  const formValuesObj = JSON.stringify({ ...formValues });

  const sourceCallback = useCallback(
    (items: string[]) => {
      const updatedItemCount = items.length;
      if (!equals(itemCount, updatedItemCount)) {
        itemCount = updatedItemCount;
        dispatch(sourceChangeAction(itemCount ? String(itemCount) : t('None')));
      }
    },
    [dispatch, t],
  );

  useEffect(() => {
    setFormValues(subIdList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(subIdList)]);

  useEffect(() => {
    const listener = (customEvent: any) => {
      setFormValues(customEvent.detail.subIdList);
    };
    document.addEventListener('changeBlackWhiteLists', listener, true);
    return () => document.removeEventListener('changeBlackWhiteLists', listener, true);
  }, []);

  useEffect(() => {
    sourceCallback(formValues.filter(isNotEmpty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCallback, formValuesObj]);

  return (
    <>
      <Form.Item name="sourceTargetingMode">
        <Radio.Group>
          <RadioWrapper value={'blacklist'}>
            <b>{t('Blacklist')}</b> <i>{t('(the sources will be blocked)')}</i>
          </RadioWrapper>
          <RadioWrapper value={'whitelist'}>
            <b>{t('Whitelist')}</b> <i>{t('(only the sources from this list)')}</i>
          </RadioWrapper>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="sourceTargeting">
        <TargetingTextArea onChangeCallback={sourceCallback} />
      </Form.Item>
    </>
  );
};
