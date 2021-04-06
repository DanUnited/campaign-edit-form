import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dictionaries } from 'models/dictionary/entities';
import { dictionaryToTransferItems } from 'modules/api-requests/dictionary/entities';

import { PureFormItem } from 'components/common/forms/elements';
import { TargetingTabContent } from './targetingTabContent';
import { TargetingMenu } from './targetingMenu';
import { TargetingWrapper } from './elements';
import { TargetingContextProvider, useTargetingContext } from './targetingContext/targetingContext';
import { CarrierTab } from './carrierTab';
import { targetingValidator } from '../validators';
import { TrafficTypeTab } from './trafficTypeTab';
import { CountryTab } from './countryTab';
import { AgeTab } from './ageTab';
import { SubIdsTab } from './subIdsTab';
import { ZoneTab } from './zoneTab';

import { FormInstance } from 'antd/es/form';
import { menuCollectionType, useTargetingValidationStatus } from './targetingContext/utils';

interface IProps {
  onChange?: (_: menuCollectionType) => void;
  form: FormInstance;
  value?: menuCollectionType;
}

export const TargetingTabsComp: React.FC<IProps> = ({ form }: IProps) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(Dictionaries.COUNTRY);
  const { setCountryIds } = useTargetingContext();
  const countryIds = form.getFieldValue('countryTargeting') as string[] | null | undefined;

  useEffect(() => {
    if (countryIds !== undefined) {
      setCountryIds(countryIds || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(countryIds || []).toString()]);

  const getValidationStatus = useTargetingValidationStatus();
  const getCacheValidStatus = useCallback(
    (name: string, isWarning?: boolean) => getValidationStatus(name, isWarning),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab]);
  const getActualValidationStatus = useCallback((name: string, isWarning?: boolean) => {
    return getValidationStatus(name, isWarning) !== 'success'
      ? getCacheValidStatus(name, isWarning)
      : 'success';
  }, [getValidationStatus, getCacheValidStatus]);

  return (
    <TargetingWrapper>
      <TargetingMenu tab={tab} setTab={setTab} />
      <div style={{ flex: 1 }}>
        <PureFormItem name="countryTargeting" validateStatus={getActualValidationStatus(Dictionaries.COUNTRY)}>
          <CountryTab hidden={tab !== Dictionaries.COUNTRY} form={form} />
        </PureFormItem>
        <div hidden={tab !== Dictionaries.CARRIER}>
          <CarrierTab form={form} validateStatus={getActualValidationStatus(Dictionaries.CARRIER, true)} />
        </div>
        <PureFormItem name="deviceTargeting" validateStatus={getActualValidationStatus(Dictionaries.DEVICE)}>
          <TargetingTabContent
            name={Dictionaries.DEVICE}
            toTransferItems={dictionaryToTransferItems}
            columnName={'Types'}
            hidden={tab !== Dictionaries.DEVICE}
            transferProps={{
              locale: {
                itemUnit: t('device'),
                itemsUnit: t('devices'),
              },
            }}
          />
        </PureFormItem>
        <PureFormItem name="osTargeting" validateStatus={getActualValidationStatus(Dictionaries.OS)}>
          <TargetingTabContent
            name={Dictionaries.OS}
            toTransferItems={dictionaryToTransferItems}
            columnName={'Systems'}
            hidden={tab !== Dictionaries.OS}
            transferProps={{
              locale: {
                itemUnit: t('system'),
                itemsUnit: t('systems'),
              },
            }}
          />
        </PureFormItem>
        <PureFormItem name="browserTargeting" validateStatus={getActualValidationStatus(Dictionaries.BROWSER)}>
          <TargetingTabContent
            name={Dictionaries.BROWSER}
            toTransferItems={dictionaryToTransferItems}
            columnName={'Browsers'}
            hidden={tab !== Dictionaries.BROWSER}
            transferProps={{
              locale: {
                itemUnit: t('browser'),
                itemsUnit: t('browsers'),
              },
            }}
          />
        </PureFormItem>
        <PureFormItem name="languageTargeting" validateStatus={getActualValidationStatus(Dictionaries.LANGUAGE)}>
          <TargetingTabContent
            name={Dictionaries.LANGUAGE}
            toTransferItems={dictionaryToTransferItems}
            columnName={'Languages'}
            hidden={tab !== Dictionaries.LANGUAGE}
            transferProps={{
              locale: {
                itemUnit: t('language'),
                itemsUnit: t('languages'),
              },
            }}
          />
        </PureFormItem>
        <div hidden={(tab as string) !== 'age'}>
          <AgeTab form={form} />
        </div>
        <div hidden={(tab as string) !== 'source'}>
          <SubIdsTab form={form} />
        </div>
        <div hidden={(tab as string) !== 'zone'}>
          <ZoneTab form={form} />
        </div>
        <div hidden={(tab as string) !== 'trafficType'}>
          <TrafficTypeTab />
        </div>
      </div>
    </TargetingWrapper>
  );
};

const ErrorContainer = ({ onChange }: any) => {
  const { menuItems } = useTargetingContext();
  useEffect(() => {
    if (onChange) {
      onChange(menuItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  return (
    <></>
  );
};

export const TargetingTabs: React.FC<IProps> = React.memo(({ form }: IProps) => (
  <TargetingContextProvider>
    <TargetingTabsComp form={form} />
    <PureFormItem rules={[{ validator: targetingValidator }]} name={'errorContainer'}>
      <ErrorContainer />
    </PureFormItem>
  </TargetingContextProvider>
));
