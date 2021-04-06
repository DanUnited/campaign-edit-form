import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { isEmpty, propOr } from 'ramda';
import { Switch } from 'antd';

import { Loader } from 'components/common/loader';
import { dictionaryFilterOption } from 'components/common/forms/select/DictionarySelect';
import { getDictionaryDataSelector, getDictionaryIsLoadingSelector } from 'models/dictionary/selectors';
import { DefaultList } from './ItemTrees/defaultList';
import usePrevious from 'utils/hooks/usePrevious';

import { StyledTransfer, TransferColumn, TransferColumns, TransferContainer, TransferHintText } from './elements';
import { targetingValueChange } from './targetingContext/store';
import { useTargetingContext } from './targetingContext/targetingContext';
import { clearDictionaryAction } from 'models/dictionary/actions';
import { Dictionaries } from 'models/dictionary/entities';

import { IStore } from 'modules/store/types';
import { Dictionary } from 'modules/api-requests/dictionary/entities';
import { TransferDirection, TransferItem, TransferProps } from 'antd/es/transfer';
import { TransferListBodyProps } from 'antd/lib/transfer/ListBody';
import { FormInstance } from 'antd/lib/form';

interface ITargetingPlane {
  name: Dictionaries;
  data?: Dictionary;
  dataSource?: any;
  hidden?: boolean;
  resetOnHide?: boolean;
  isLoading?: boolean;
  onChange?: (data: string[] | null) => void;
  value?: string[];
  toTransferItems: (data: any) => TransferItem[];
  children?: (props: TransferListBodyProps<any>) => React.ReactNode;
  columnName: string;
  disableChecking?: boolean;
  form?: FormInstance;
  transferProps?: Omit<TransferProps<any>, 'dataSource' | 'listStyle'>;
}

interface ISelectLabelProps {
  selectedCount: number;
  totalCount: number;
}

const onTransferRender = propOr('', 'title');
const onTransferFilter = (inputValue: string, item: TransferItem) =>
  dictionaryFilterOption(inputValue, { children: item.title, value: item.key });
const getGroupKeys = (items: string[], prefix = 'p') =>
  items.filter((item) => item.indexOf(prefix) >= 0)
const getGroupItemsCount = (items: string[], prefix = 'p') => getGroupKeys(items, prefix).length

const TargetingTabContentComp = ({
  toTransferItems,
  isLoading,
  value,
  children,
  columnName,
  hidden,
  resetOnHide,
  name,
  data,
  dataSource,
  onChange,
  disableChecking,
  form,
  transferProps,
}: ITargetingPlane) => {
  const { t } = useTranslation();
  const { dispatch } = useTargetingContext();
  const globalDispatch = useDispatch();
  const [fieldKeys, setFieldKeys] = useState<string[]>([]);
  const [checked, setChecked] = useState(true);
  const [leftFilterValue, setLeftFilterValue] = useState('');
  const [rightFilterValue, setRightFilterValue] = useState('');
  const excludeItems = useRef({ left: 0, right: 0, total: 0 });
  const [transferItems, rightGroupItems] = useMemo(() => {
    const result = toTransferItems(dataSource || data);
    const rGroupItems = getGroupKeys(result.map((item) => `${item.key}`), 'pr');
    excludeItems.current.total = rGroupItems.length;
    return [result, rGroupItems];
  }, [data, dataSource, toTransferItems]);

  const onTransferChangeFunc = useCallback(
    (selectedKeys: string[] | null) => {
      setFieldKeys([...rightGroupItems, ...(selectedKeys || [])]);
      if (onChange) {
        onChange(selectedKeys?.filter((key) => key.indexOf('p') < 0) || null);
      }
    },
    [setFieldKeys, rightGroupItems, onChange],
  );

  // reset form when element becomes hidden (Carrier tab only)
  useEffect(() => {
    if (name === Dictionaries.CARRIER) {
      if (Boolean(disableChecking) && resetOnHide) {
        setChecked(true);
      } else {
        if (value && value.length > 0) {
          setChecked(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableChecking, onTransferChangeFunc, resetOnHide, value, name]);

  // countries tab only: reset carriers if we set all countries checkbox
  useEffect(() => {
    if (name === 'countries' && checked) {
      if (form?.getFieldValue('countryTargeting') !== undefined) {
        form.setFieldsValue({
          carrierTargeting: null,
        });
      }
      globalDispatch(clearDictionaryAction(Dictionaries.CARRIER));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, globalDispatch, name]);

  // synchronize form value with local state
  useEffect(() => {
    if (name === 'countries' && isEmpty(value)) {
      globalDispatch(clearDictionaryAction(Dictionaries.CARRIER));
    }

    if (!value) {
      setChecked(true);
    } else {
      const formKeys = value.map((val: number | string) => `${val}`);
      setFieldKeys([...rightGroupItems, ...formKeys]);
      setChecked(false);
    }

    dispatch(targetingValueChange(name, value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dispatch, name]);

  // if data changes Transfer doesn't send onChange event, so we have to filter selected keys manually
  const prevTransferItemsLen = usePrevious<number>(transferItems.length, 0);
  useEffect(() => {
    if (!isLoading && prevTransferItemsLen > transferItems.length) {
      const availableKeys = transferItems.map((item) => item.key);
      const newFieldKeys = fieldKeys.filter((key) => availableKeys.includes(key));
      if (newFieldKeys.length !== fieldKeys.length) {
        onTransferChangeFunc(checked ? null : newFieldKeys);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferItems.length, prevTransferItemsLen, isLoading]);

  const onSwitchChangeFunc = (val: boolean): void => {
    setChecked(val);

    setTimeout(() => {
      onTransferChangeFunc(val ? null : []);
    }, val ? 20 : 400);
  };

  const selectLabelsLeft = useCallback(({ selectedCount, totalCount }: ISelectLabelProps) =>
    `${selectedCount - excludeItems.current.left}/${totalCount - excludeItems.current.total}`, [excludeItems]);
  const selectLabelsRight = useCallback(({ selectedCount, totalCount }: ISelectLabelProps) =>
    `${selectedCount - excludeItems.current.right}/${totalCount - excludeItems.current.total}`, [excludeItems]);

  const onSelectCallback = useCallback((leftItems: string[], rightItems: string[]) => {
    excludeItems.current.left = getGroupItemsCount(leftItems);
    excludeItems.current.right = getGroupItemsCount(rightItems);
  }, [excludeItems]);

  const onSearch = (direction: TransferDirection, val: string) => {
    direction === 'left'
      ? setLeftFilterValue(val)
      : setRightFilterValue(val);
  };

  if (hidden) {
    return <React.Fragment />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Switch
        defaultChecked
        checkedChildren={t('All ' + columnName)}
        unCheckedChildren={t('Custom')}
        checked={checked}
        onChange={onSwitchChangeFunc}
        disabled={disableChecking}
      />
      {!checked && (
        <TransferContainer>
          <TransferHintText>Please add the targeted {columnName} to the column on the right side.</TransferHintText>
          <TransferColumns>
            <TransferColumn>Excluded {columnName}</TransferColumn>
            <TransferColumn>Selected {columnName}</TransferColumn>
          </TransferColumns>
          <StyledTransfer
            {...transferProps}
            dataSource={transferItems}
            targetKeys={fieldKeys}
            render={onTransferRender}
            onChange={onTransferChangeFunc}
            filterOption={onTransferFilter}
            onSearch={onSearch}
            selectAllLabels={[selectLabelsLeft, selectLabelsRight]}
            onSelectChange={onSelectCallback}
            showSearch
          >
            {(p: TransferListBodyProps<any>) =>
              children ? (
                children({
                  ...p,
                  // @ts-ignore
                  onTransferChange: onTransferChangeFunc,
                  fieldKeys,
                  filterValue: p.direction === 'left' ? leftFilterValue : rightFilterValue,
                })
              ) : (
                // @ts-ignore
                <DefaultList {...p} onTransferChange={onTransferChangeFunc} fieldKeys={fieldKeys} />
              )
            }
          </StyledTransfer>
        </TransferContainer>
      )}
    </div>
  );
};

export const mapStateToProps = (state: IStore, props: ITargetingPlane) => ({
  data: getDictionaryDataSelector(props.name)(state),
  isLoading: getDictionaryIsLoadingSelector(props.name)(state),
});

export const TargetingTabContent = connect(mapStateToProps, null)(TargetingTabContentComp);
