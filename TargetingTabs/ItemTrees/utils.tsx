import React from 'react';
import { last, slice } from 'ramda';

import { mapObject } from 'utils';
import { Flag } from 'components/common/flags/flag';

import { TransferItem } from 'antd/es/transfer';
import {
  CarrierDictionary,
  ContinentCountryDictionary,
  Dictionary,
  ICarrierDictionaryItem,
  IContinentCountryDictionaryItem,
  IDictionaryItem,
} from 'modules/api-requests/dictionary/entities';
import { TreeNodeNormal } from 'antd/es/tree/Tree';
import { TransferListBodyProps } from 'antd/lib/transfer/ListBody';

export interface ITreeProps<T> extends Omit<TransferListBodyProps<T>, 'dataSource'> {
  dataSource: T;
  onTransferChange?: onTransferChangeFunc;
  fieldKeys?: string[];
  onFieldKeysChange?: (fieldKeys: string[], dataSource: T) => void;
  filterValue?: string;
}

export type onTransferChangeFunc = (selectedKeys: string[] | null) => void;
export type keyDataMapType = { [key in string]: string[] };
export type selectionModeType = 'single' | 'multiple';

export const dictionaryToLeafItems = (data: Dictionary, onTransferChange: onTransferChangeFunc) => {
  const isCountry = Object.keys(data[0] ?? {}).includes('continentId');

  return (data || []).map((item: IDictionaryItem) => {
    const id = String(item.id);
    const idLower = id.toLowerCase();
    const onDoubleClick = () => onTransferChange([id]);

    return {
      key: `${item.id}`,
      title: (
        <div onDoubleClick={onDoubleClick}>
          {isCountry && idLower !== 'a2' && <Flag code={idLower} />}
          <span>{item.name}</span>
        </div>
      ),
      isLeaf: true,
      selectable: true,
    };
  });
};

export const onTreeItemDoubleClickProcessor = (
  onTransferChange: onTransferChangeFunc,
  item: ICarrierDictionaryItem | IContinentCountryDictionaryItem,
  filteredItems: TransferItem[],
) => {
  const mappedObject = ((item as any).carriers) ? (item as ICarrierDictionaryItem).carriers : (item as IContinentCountryDictionaryItem).countries;

  return () => onTransferChange(
    mappedObject
      .filter((carrier) => filteredItems.find((fItem) => fItem.key === String(carrier.id)))
      .map((carrier) => String(carrier.id)),
  );
};

export const carrierDictionaryToTreeItems = (
  data: CarrierDictionary,
  onTransferChange: onTransferChangeFunc,
  filteredItems: TransferItem[],
  prefix: string,
): TreeNodeNormal[] =>
  (data || []).map((item: ICarrierDictionaryItem) => ({
    key: `${prefix}${item.id}`,
    title: (
      <div onDoubleClick={onTreeItemDoubleClickProcessor(onTransferChange, item, filteredItems)}>
        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
      </div>
    ),
    selectable: true,
    children: dictionaryToLeafItems(item.carriers, onTransferChange),
  }));

export const countryDictionaryToTreeItems = (
  data: ContinentCountryDictionary,
  onTransferChange: onTransferChangeFunc,
  filteredItems: TransferItem[],
  prefix: string,
): TreeNodeNormal[] =>
  (data || []).map((item: IContinentCountryDictionaryItem) => ({
      key: `${prefix}${item.id}`,
      title: (
        <div onDoubleClick={onTreeItemDoubleClickProcessor(onTransferChange, item, filteredItems)}>
          <span style={{ fontWeight: 'bold' }}>{item.name}</span>
        </div>
      ),
      selectable: true,
      children: dictionaryToLeafItems(item.countries, onTransferChange),
    }),
  ).sort((a, b) => a.key.localeCompare(b.key));

export const filterTreeItems = (treeItems: TreeNodeNormal[], filteredItems: TransferItem[]) => {
  const filteredIds = filteredItems.map((item) => item.key);
  const filteredData: TreeNodeNormal[] = [];
  treeItems.forEach((item) => {
    const filteredChildren = (item.children || []).filter((childItem) => filteredIds.includes(String(childItem.key)));
    if (filteredChildren.length) {
      filteredData.push({
        ...item,
        children: filteredChildren,
      });
    }
  });

  return filteredData;
  // eslint-disable-next-line react-hooks/exhaustive-deps
};

export const generateKeyDataMap = (treeData: TreeNodeNormal[]) => {
  const prepared: keyDataMapType = {};
  treeData.forEach((parent) => {
    prepared[parent.key] = (parent.children || []).map((item) => `${item.key}`);
  });
  return prepared;
};

export const isKeyChecked = (selectedKeys: string[], eventKey: string) => selectedKeys.indexOf(eventKey) !== -1;
export const isKeysChecked = (selectedKeys: string[], eventKeys: string[]) =>
  new Set([...selectedKeys, ...eventKeys]).size === selectedKeys.length;

export const getOnSelectSelect = (
  value: string,
  onItemSelect: (key: string, check: boolean) => void,
  onItemSelectAll: (key: string[], check: boolean) => void,
  selectedKeys: string[],
  dataSource: TransferItem[],
  selectionMode: selectionModeType = 'single',
  changeSelectionMode: (mode: selectionModeType) => any,
) =>
  (event: React.MouseEvent<HTMLOptionElement>) => {
    const compareFunc = (a: string, b: string) => b.localeCompare(a);
    const allKeys = dataSource.map((key) => String(key.key)).sort(compareFunc);

    if (event.shiftKey && selectedKeys.length > 0) {
      const newKeys = getDataMapRangeFromPathKey(
        allKeys,
        getStartElement(selectedKeys, selectionMode),
        value,
      );
      if (selectionMode === 'single') {
        changeSelectionMode('multiple');
      }

      onItemSelectAll(newKeys, true);
      onItemSelectAll(selectedKeys.filter((key) => newKeys.indexOf(key) < 0), false);
    } else {
      if (selectionMode === 'multiple') {
        changeSelectionMode('single');
      }

      const isChecked = isKeyChecked(selectedKeys, value)
      if (event.ctrlKey || event.metaKey) {
        onItemSelect(value, !isChecked);
      } else {
        onItemSelect(value, selectedKeys.length > 1 || !isChecked);
        onItemSelectAll(selectedKeys.filter((key) => key !== value), false);
      }
    }

    event.preventDefault();
  };

export const getDataMapRangeFromValue = (keyDataMap: keyDataMapType, firstEl: string, secondEl: string): string[] => {
  let path: string | null = null;
  let firstIndex = 0;
  let secondIndex = 0;
  mapObject(keyDataMap, (value: string[], key: string | number) => {
    // ищем по второму главному элементу
    if (value.indexOf(secondEl) >= 0) {
      path = String(key);
      secondIndex = value.indexOf(secondEl);
      if (value.indexOf(firstEl) >= 0) {
        firstIndex = value.indexOf(firstEl);
      }
    }
  });

  if (!path) {
    return [secondEl];
  }

  return slice(Math.min(firstIndex, secondIndex), Math.max(firstIndex, secondIndex) + 1)(keyDataMap[path]);
};

export const getDataMapRangeFromPathKey = (keyDataMap: string[], firstEl: string, secondEl: string): string[] => {
  const firstIndex = keyDataMap.indexOf(firstEl) >= 0
    ? keyDataMap.indexOf(firstEl)
    : 0;

  const secondIndex = keyDataMap.indexOf(secondEl);

  return slice(Math.min(firstIndex, secondIndex), Math.max(firstIndex, secondIndex) + 1)(keyDataMap);
};

export const getStartElement = (arr: string[] = [], selectionMode: selectionModeType = 'single'): string => {
  return selectionMode === 'multiple' && arr.length > 0
    ? arr[0] as string
    : last(arr) as string;
};

export const getOnDeepSelectCb = (
  onItemSelect: (key: string, check: boolean) => void,
  onItemSelectAll: (key: string[], check: boolean) => void,
  selectedKeys: string[],
  keyDataMap: keyDataMapType,
  selectionMode: selectionModeType = 'single',
  changeSelectionMode: (mode: selectionModeType) => any,
) => (_: any, e: any) => {
  const eventKey = e.node.key || '';
  const excludedKeys: string[] = [];
  const keyDataMapKeys = Object.keys(keyDataMap).sort();

  let trueKeys: string[] = [];
  let falseKeys: string[] = [];
  if ((e?.nativeEvent?.shiftKey && selectedKeys.length > 0)) {
    if (selectionMode === 'single') {
      changeSelectionMode('multiple');
    }
    // first element of selection is the last one in selectedKeys
    const startElement = getStartElement(selectedKeys, 'multiple');

    const firstPathElement = startElement && startElement.indexOf('p') < 0
      ? keyDataMapKeys.filter(key => keyDataMap[key]?.indexOf(startElement) >= 0)[0]
      : startElement;

    const secondPathElement = eventKey.indexOf('p') < 0
      ? keyDataMapKeys.filter(key => keyDataMap[key]?.indexOf(eventKey) >= 0)[0]
      : eventKey;

    if (firstPathElement !== startElement) {
      const startIndex = keyDataMapKeys.indexOf(firstPathElement);
      const secondIndex = keyDataMapKeys.indexOf(secondPathElement);

      if (secondIndex > startIndex) {
        excludedKeys.push(...keyDataMap[firstPathElement]?.slice(0, keyDataMap[firstPathElement].indexOf(selectedKeys[0])));
        if (secondPathElement !== eventKey) {
          excludedKeys.push(...keyDataMap[secondPathElement]?.slice(keyDataMap[secondPathElement].indexOf(eventKey) + 1, keyDataMap[secondPathElement].length));
        }
      }

      if (secondIndex < startIndex) {
        excludedKeys.push(...keyDataMap[firstPathElement]?.slice(keyDataMap[firstPathElement].indexOf(selectedKeys[0]) + 1, keyDataMap[firstPathElement].length));
        if (secondPathElement !== eventKey) {
          excludedKeys.push(...keyDataMap[secondPathElement]?.slice(0, keyDataMap[secondPathElement].indexOf(eventKey)));
        }
      }
    } else if (secondPathElement !== eventKey) {
      excludedKeys.push(...keyDataMap[secondPathElement]?.slice(keyDataMap[secondPathElement].indexOf(eventKey) + 1))
    }

    const newKeys = getDataMapRangeFromPathKey(keyDataMapKeys, firstPathElement, secondPathElement);
    const keySum: string[] = [];

    newKeys.forEach((key) => {
      const addKeys = keyDataMap[key].filter(item => excludedKeys.indexOf(item) < 0) || [];
      if (secondPathElement === eventKey && secondPathElement === firstPathElement) {
        keySum.push(key, ...addKeys);
      } else if (
        (secondPathElement !== eventKey && key === secondPathElement) ||
        (firstPathElement !== startElement && key === firstPathElement)
      ) {
        keySum.push(...addKeys);
      } else {
        keySum.push(key, ...addKeys);
      }
    });

    trueKeys = keySum;
    if (!keyDataMap[eventKey] && newKeys.length === 1) { // selection inside one path
      trueKeys = getDataMapRangeFromValue(keyDataMap, getStartElement(selectedKeys, 'multiple'), eventKey);
    }
    falseKeys = selectedKeys.filter((key) => trueKeys.indexOf(key) < 0);
  } else { // without shift Key
    if (selectionMode === 'multiple') {
      changeSelectionMode('single');
    }

    const isChecked = isKeyChecked(selectedKeys, eventKey);
    let isRealNotChecked;
    if (keyDataMap[eventKey]) {
      trueKeys = [eventKey, ...keyDataMap[eventKey]];
      const isParentChecked = isChecked || isKeysChecked(selectedKeys, keyDataMap[eventKey]);
      const groupSelectedKeys = selectedKeys.filter((key) => Boolean(keyDataMap[key]));
      isRealNotChecked = (!e?.nativeEvent?.ctrlKey && !e?.nativeEvent?.metaKey && groupSelectedKeys.length > 1) || !isParentChecked;
    } else {
      trueKeys = [eventKey];
      isRealNotChecked = (!e?.nativeEvent?.ctrlKey && !e?.nativeEvent?.metaKey && selectedKeys.length > 1) || !isChecked;
    }
    if (!isRealNotChecked) { // если мы снимаем флаг, то меняем массивы
      falseKeys = trueKeys;
      trueKeys = [];
    }
    if (!e?.nativeEvent?.ctrlKey && !e?.nativeEvent?.metaKey) {
      const falseSet = new Set(falseKeys);
      selectedKeys
        .filter((key) => trueKeys.indexOf(key) < 0)
        .forEach((key) => falseSet.add(key));
      falseKeys = [...falseSet.keys()];
    }
  }
  const resultTrueKeys = new Set(selectedKeys);
  falseKeys.forEach((key) => resultTrueKeys.delete(key)); // selectedKeys - falseKeys
  trueKeys.forEach((key) => resultTrueKeys.add(key)); // resultTrueKeys + trueKeys
  const resultFalseKeys = new Set(selectedKeys);
  resultTrueKeys.forEach((key) => resultFalseKeys.delete(key)); // selectedKeys - resultTrueKeys

  onItemSelectAll([...resultTrueKeys.keys()], true);
  onItemSelectAll([...resultFalseKeys.keys()], false);
};
