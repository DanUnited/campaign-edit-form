import React, { Ref, useCallback, useState } from 'react';
import styled from 'styled-components';
import { always } from 'ramda';

import {
  getOnSelectSelect,
  ITreeProps,
  selectionModeType,
} from './utils';
import { TransferItem } from 'antd/es/transfer';

export const CustomSelect = styled.select`
  width: 100%;
  height: 200px !important;
  border: none;
  &:focus {
    border: none;
    box-shadow: none;
    outline: none;
  }
  option {
    font-size: 13px;
    padding: 4px 10px 4px 10px;
  }
`;

const compareFunc = (a: TransferItem, b: TransferItem) => b?.key?.localeCompare(String(a?.key)) || 0;

export const DefaultList = React.forwardRef((props: ITreeProps<TransferItem[]>, ref: Ref<HTMLSelectElement>) => {
  const { filteredItems, onItemSelect, onItemSelectAll, selectedKeys, dataSource, onTransferChange, direction, fieldKeys = [] } = props;
  const [selectionMode, setSelectionMode] = useState<selectionModeType>('single');

  const onTransferChangeDirectionChange = useCallback((keys: string[] | null) => () => {
    if (onTransferChange && keys) {
      if (direction === 'left') {
        onTransferChange(fieldKeys.concat(keys));
      } else {
        onTransferChange(fieldKeys.filter((key) => keys.indexOf(key) < 0));
      }
    }
  }, [direction, fieldKeys, onTransferChange]);

  const onMouseDown = (value: string) => getOnSelectSelect(value, onItemSelect, onItemSelectAll, selectedKeys, dataSource, selectionMode, setSelectionMode);
  const onChange = always(void 0); // to avoid console error, onChange event happens into mouseDownEvent

  return (
    <CustomSelect
      multiple
      onChange={onChange}
      size={13}
      value={selectedKeys}
      ref={ref}
    >
      {
        filteredItems.length > 0 && filteredItems
        .sort(compareFunc)
        .map((item: TransferItem) => {
          return <option
            value={item?.key}
            key={item.key}
            onChange={onChange}
            onMouseDown={onMouseDown(String(item?.key))}
            onDoubleClick={onTransferChangeDirectionChange([String(item?.key)])}
          >
            {item?.title}
          </option>;
        })
      }
    </CustomSelect>
  );
});
