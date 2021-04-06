import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInstance } from 'antd/es/form';
import { Form } from 'antd';

import usePrevious from 'utils/hooks/usePrevious';
import { getMinMaxValidator } from 'utils/form';
import { BudgetHidingInput } from '../BudgetHidingInput';
import { TooltipTitle, FieldBox } from '../elements';
import { getDailyBudgetValidator } from '../validators';
import { BidInput } from '../BidInput';

interface IProps {
  form: FormInstance;
}

export const BudgetForm = ({ form }: IProps) => {
  const { t } = useTranslation();
  const [total, setTotal] = useState<number>();
  const prevTotal = usePrevious(total, undefined);

  const onChange = (value: string | number | undefined, onBlur?: boolean) => {
    setTotal(Number(value));
    if (onBlur || value === undefined) {
      form.validateFields(['dailyBudget', 'budget']);
    }
  };

  const initializeTotal = useCallback(
    (val: string | number | undefined) => {
      if (!prevTotal) {
        setTotal(val === undefined ? undefined : Number(val));
      }
    },
    [prevTotal],
  );

  return (
    <FieldBox>
      <Form.Item
        label={<TooltipTitle title={t('Bid')} hint={t('CPC (Cost Per Click)')} />}
        name="cpc"
        validateTrigger={['onBlur', 'onChange']}
        rules={[
          { required: true, message: t('Please input Bid') },
          { validator: getMinMaxValidator(0.001, 1e7), validateTrigger: 'onBlur' },
        ]}
      >
        <BidInput />
      </Form.Item>

      <Form.Item
        label={
          <TooltipTitle
            title={t('Daily Budget')}
            hint={t(
              'Maximum daily spend cap on each campaign. WARNING: Daily budget may be exceeded due to the nature of Push Ads.',
            )}
          />
        }
        name="dailyBudget"
        validateFirst
        validateTrigger={['onBlur', 'onChange']}
        rules={[
          { validator: getMinMaxValidator(20, 1e7), validateTrigger: 'onBlur' },
          { validator: getDailyBudgetValidator(total), validateTrigger: 'onBlur' },
        ]}
      >
        <BudgetHidingInput />
      </Form.Item>

      <Form.Item
        label={t('Total Budget')}
        name="budget"
        validateFirst
        validateTrigger={['onBlur', 'onChange']}
        rules={[{ validator: getMinMaxValidator(20, 1e7), validateTrigger: 'onBlur' }]}
      >
        <BudgetHidingInput onChange={onChange} useOnChange={initializeTotal} />
      </Form.Item>
    </FieldBox>
  );
};
