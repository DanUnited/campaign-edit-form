import React, { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Popover, Spin } from 'antd';

import { isAdminRole } from 'models/currentUser';
import { renderDummy } from 'components/common/tables/columns';
import { budgetFormatter, budgetParser } from '../BudgetHidingInput';
import { BidOptimalHighlighted, BidOptimalRow } from './elements';
import { BlurNumberInput } from 'components/common/forms/input/blurNumberInput';
import selectors from 'models/optimalRates/selectors';

import { InputNumberProps } from 'antd/es/input-number';
import { IOptimalRatesResponse } from 'modules/api-requests/optimalRates/entities';

export const BidInput = React.forwardRef(({ value, onChange, ...props }: InputNumberProps, ref: Ref<InputNumberProps>) => {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminRole);

  const optimalRates = useSelector(selectors.getData) as IOptimalRatesResponse;
  const isLoading = useSelector(selectors.isLoading) as boolean;

  const content = (
    <Spin spinning={isLoading}>
      <BidOptimalRow>{t('Recommended')} <BidOptimalHighlighted>{optimalRates?.recommended ?? renderDummy()}</BidOptimalHighlighted></BidOptimalRow>
      <BidOptimalRow>{t('Maximum')} <span>{optimalRates?.maximum ?? renderDummy()}</span></BidOptimalRow>
    </Spin>
  );

  const input = (
    <BlurNumberInput
      {...props}
      value={value}
      onChange={onChange}
      formatter={budgetFormatter}
      parser={budgetParser}
      precision={3}
      min={0.001}
      max={10000000}
      step={0.001}
      ref={ref}
    />
  );

  if (isAdmin) {
    return (
      <Popover content={content} title={t('Optimal Rates')} trigger="focus">
        {input}
      </Popover>
    );
  }

  return input;
});
