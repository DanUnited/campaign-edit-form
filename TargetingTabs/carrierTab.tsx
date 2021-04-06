import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Typography } from 'antd';
import memoizeOne from 'memoize-one';
import { useTranslation } from 'react-i18next';
import { equals, intersection, isEmpty, isNil } from 'ramda';

import { getDictionaryDataSelector } from 'models/dictionary/selectors';
import { dictionaryAction } from 'models/dictionary/actions';
import { useTargetingContext } from './targetingContext/targetingContext';
import { TargetingTabContent } from './targetingTabContent';
import { CustomTree, CustomTreeItem } from './ItemTrees/customTree';
import { connectionChange, targetingValueChange } from './targetingContext/store';
import { PureFormItem } from 'components/common/forms/elements';
import { Dictionaries } from 'models/dictionary/entities';
import usePrevious from 'utils/hooks/usePrevious';

import {
  carrierDictionaryToTransferItems,
  ConnectionTypes,
  CarrierDictionary,
  ICarrierDictionaryItem,
} from 'modules/api-requests/dictionary/entities';
import { IStore } from 'modules/store/types';
import { FormInstance } from 'antd/es/form';

interface IProps {
  fetchCarrierDictionary: (countryIds: string[]) => void;
  carriersDataSource: CarrierDictionary;
  form: FormInstance;
  validateStatus?: 'success' | 'warning' | 'error';
}

interface IConnectionSelectProps {
  value?: ConnectionTypes;
  onChange?: (_: ConnectionTypes) => void;
  setIsCarriersHidden: (_: boolean) => void;
  form: FormInstance;
}

type EqualityFn = (newArgs: string[], lastArgs: CustomTreeItem[]) => string[];
const memoized = (fn: EqualityFn) => memoizeOne(fn, equals);

const ConnectionSelect = ({ value, form, onChange = () => void 0, setIsCarriersHidden }: IConnectionSelectProps) => {
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();

  useEffect(() => {
    dispatch(connectionChange(value || ConnectionTypes.ALL));
    setIsCarriersHidden(value !== ConnectionTypes.ONLY_MOBILE);

    if (form?.getFieldValue('countryTargeting') !== undefined) {
      if (value && [ConnectionTypes.ALL, ConnectionTypes.ONLY_WI_FI_OR_WIRED].includes(value)) {
        form.setFieldsValue({
          carrierTargeting: null,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Select style={{ width: 170, marginBottom: '10px' }} value={value} onChange={onChange}>
      <Select.Option value={ConnectionTypes.ALL}>{t('All')}</Select.Option>
      <Select.Option value={ConnectionTypes.ONLY_MOBILE}>{t('Only Mobile (3G)')}</Select.Option>
      <Select.Option value={ConnectionTypes.ONLY_WI_FI_OR_WIRED}>{t('Only Wi-Fi/Wired')}</Select.Option>
    </Select>
  );
};

const memoizedCountryWithoutSetCarrier = memoized((fields: string[], dataSource: CustomTreeItem[]): string[] => {
  const countryCollection: string[] = [];
  (dataSource as ICarrierDictionaryItem[]).forEach((source) => {
    if (
      intersection(
        source.carriers.map((carrier) => String(carrier.id)),
        fields,
      ).length === 0
    ) {
      countryCollection.push(source.name);
    }
  });

  return countryCollection;
});

const CarrierTargetingTabComp = ({ fetchCarrierDictionary, carriersDataSource, form, validateStatus }: IProps) => {
  const { t } = useTranslation();
  const { countryIds } = useTargetingContext();
  const formCountryIdsValue = form.getFieldValue('countryTargeting');
  const formCarrierIdsValue = form.getFieldValue('carrierTargeting');
  const [isCarriersHidden, setIsCarriersHidden] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const disableAllCarriers = isNil(carriersDataSource) || isEmpty(carriersDataSource);
  const { dispatch } = useTargetingContext();
  const prevCountries = usePrevious(countryIds, undefined);

  useEffect(() => {
    if (countryIds) {
      fetchCarrierDictionary(countryIds);
      if (formCarrierIdsValue && !formCarrierIdsValue.length && !prevCountries?.length) {
        dispatch(targetingValueChange(Dictionaries.CARRIER, undefined));
      }
    } else {
      if (formCountryIdsValue !== undefined) {
        onFieldKeysChange([], []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(countryIds || []).toString(), fetchCarrierDictionary, prevCountries]);

  const onFieldKeysChange = (fields: string[], dataSource: CustomTreeItem[]) => {
    const countryCollection: string[] = memoizedCountryWithoutSetCarrier(fields, dataSource);

    if (countryCollection.length > 0) {
      setValidationMsg(t(`You haven't set carriers for the following countries: ` + countryCollection.join(', ')));
    } else {
      setValidationMsg('');
    }
  };

  useEffect(() => {
    if (isCarriersHidden || formCarrierIdsValue === null) {
      setValidationMsg('');
    }
  }, [isCarriersHidden, formCarrierIdsValue]);

  return (
    <>
      <Form.Item name="connectionType" noStyle>
        <ConnectionSelect setIsCarriersHidden={setIsCarriersHidden} form={form} />
      </Form.Item>
      <PureFormItem name="carrierTargeting" validateStatus={validateStatus}>
        <TargetingTabContent
          name={Dictionaries.CARRIER}
          toTransferItems={carrierDictionaryToTransferItems}
          dataSource={carriersDataSource}
          columnName={'Carriers'}
          hidden={isCarriersHidden}
          disableChecking={disableAllCarriers}
          resetOnHide
          transferProps={{
            locale: {
              itemUnit: t('carrier'),
              itemsUnit: t('carriers'),
            },
          }}
        >
          {(listProps) => (
            <CustomTree {...listProps} dataSource={carriersDataSource} onFieldKeysChange={onFieldKeysChange} />
          )}
        </TargetingTabContent>
      </PureFormItem>
      {validationMsg && (
        <Typography.Text type="warning" style={{ display: 'block' }}>
          {validationMsg}
        </Typography.Text>
      )}
    </>
  );
};

export const mapStateToProps = (state: IStore) => ({
  carriersDataSource: getDictionaryDataSelector(Dictionaries.CARRIER)(state) as CarrierDictionary,
});

export const mapDispatchToProps = (dispatch: any) => ({
  fetchCarrierDictionary: (countryIds: string[]) => dispatch(dictionaryAction(Dictionaries.CARRIER, { countryIds })),
});

export const CarrierTab = connect(mapStateToProps, mapDispatchToProps)(CarrierTargetingTabComp);
