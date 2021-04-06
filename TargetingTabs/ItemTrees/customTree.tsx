import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { prop, sortBy } from 'ramda';

import usePrevious from 'utils/hooks/usePrevious';
import { StyledTree } from './elements';

import {
  carrierDictionaryToTreeItems,
  countryDictionaryToTreeItems,
  filterTreeItems,
  generateKeyDataMap,
  getOnDeepSelectCb,
  ITreeProps,
  selectionModeType,
} from './utils';
import {
  CarrierDictionary,
  ContinentCountryDictionary,
  ICarrierDictionaryItem,
  IContinentCountryDictionaryItem,
} from 'modules/api-requests/dictionary/entities';

export type CustomTreeItem = IContinentCountryDictionaryItem | ICarrierDictionaryItem;

export const CustomTree = ({
  filteredItems,
  onItemSelect,
  onItemSelectAll,
  selectedKeys,
  onTransferChange,
  direction,
  dataSource = [],
  fieldKeys = [],
  onFieldKeysChange,
  filterValue,
}: ITreeProps<CustomTreeItem[]>) => {
  const [selectionMode, setSelectionMode] = useState<selectionModeType>('single');
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);

  const prevFilterValue = usePrevious(filterValue, undefined);

  const onTransferChangeDirectionChange = useCallback((keys: string[] | null) => {
    if (onTransferChange && keys) {
      if (direction === 'left') {
        onTransferChange(fieldKeys.concat(keys));
      } else {
        onTransferChange(fieldKeys.filter((key) => keys.indexOf(key) < 0));
      }
    }
  }, [direction, fieldKeys, onTransferChange]);

  const treeItems = useMemo(() => {
    if (dataSource.length > 0) {
      const sortedDataSource = sortBy(prop('id'))(dataSource);
      const firstElement = sortedDataSource[0];
      const prefix = direction === 'left' ? 'pl' : 'pr';

      if ((firstElement as IContinentCountryDictionaryItem)?.countries) {
        return countryDictionaryToTreeItems(sortedDataSource as ContinentCountryDictionary, onTransferChangeDirectionChange, filteredItems, prefix);
      } else {
        return carrierDictionaryToTreeItems(sortedDataSource as CarrierDictionary, onTransferChangeDirectionChange, filteredItems, prefix);
      }
    }

    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.length, onTransferChangeDirectionChange, filteredItems]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const treeData = useMemo(() => filterTreeItems(treeItems, filteredItems), [treeItems.length, filteredItems.length]);
  const prevTreeData = usePrevious(treeData, []);

  const keyDataMap = useMemo(() => generateKeyDataMap(treeData), [treeData]);

  const onSelect = useCallback(
    getOnDeepSelectCb(onItemSelect, onItemSelectAll, selectedKeys, keyDataMap, selectionMode, setSelectionMode),
    [keyDataMap, selectionMode, selectedKeys, direction]
  );

  useEffect(() => {
    if (onFieldKeysChange) {
      onFieldKeysChange(fieldKeys, dataSource);
    }
  }, [onFieldKeysChange, fieldKeys, dataSource]);

  // expand countries if search value is changed
  useEffect(() => {
      if (filterValue !== prevFilterValue) {
        setExpandedKeys(((filterValue || '').length >= 1) && treeData.length <= 50
          ? treeData.map((item) => item.key)
          : []);
      }
    },
    [treeData, filterValue, prevFilterValue],
  );

  // expand right direction items after transfer
  useEffect(() => {
    const newKeysCollection: any[] = [];
    if (direction === 'right' && treeData.length !== prevTreeData.length) {
      treeData.forEach((item) => {
        if (!prevTreeData.find((i) => i.key === item.key) && (item?.children || [])?.length <= 50) {
          newKeysCollection.push(item.key);
        }
      })
      if (newKeysCollection.length > 0){
        setExpandedKeys(expandedKeys.concat(newKeysCollection));
      }
    }
  }, [fieldKeys, direction, expandedKeys, prevTreeData, treeData]);

  const onExpand = useCallback((keys: (string | number)[]) => {
    setExpandedKeys(keys);
  }, []);

  return (
    <StyledTree
      style={{ height: '200px', overflow: 'auto', userSelect: 'none' }}
      multiple
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      selectedKeys={selectedKeys}
      onSelect={onSelect}
      treeData={treeData}
    />
  );
};
