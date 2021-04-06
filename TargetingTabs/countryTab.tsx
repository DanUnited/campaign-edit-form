import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Dictionaries } from 'models/dictionary/entities';
import { countryDictionaryToTransferItems } from 'modules/api-requests/dictionary/entities';
import { continentCountryDataSelector } from 'models/dictionary/selectors';
import { TargetingTabContent } from './targetingTabContent';
import { CustomTree } from './ItemTrees/customTree';

import { FormInstance } from 'antd/lib/form';

interface ICountryTabProps {
  hidden: boolean;
  value?: string[];
  onChange?: (_: string[] | null) => void;
  form: FormInstance;
}

export const CountryTab = ({ hidden, value, onChange, form }: ICountryTabProps) => {
  const { t } = useTranslation();
  const dataSource = useSelector(continentCountryDataSelector);

  return (
    <TargetingTabContent
      name={Dictionaries.COUNTRY}
      toTransferItems={countryDictionaryToTransferItems}
      dataSource={dataSource}
      columnName={'Countries'}
      hidden={hidden}
      value={value}
      onChange={onChange}
      form={form}
      transferProps={{
        locale: {
          itemUnit: t('country'),
          itemsUnit: t('countries'),
        },
      }}
    >
      {(listProps) => <CustomTree {...listProps} dataSource={dataSource} />}
    </TargetingTabContent>
  );
};
