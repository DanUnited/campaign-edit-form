import React from 'react';
import styled from 'styled-components';
import { Tag, Transfer } from 'antd';

import { VerticalMenuWrapper } from 'components/common/elements';
import { MediaSizes } from 'components/common/hoc/mobile/entities';
import { LARGE_VIEWPORT, SMALL_VIEWPORT } from 'modules/themes/config';

import { TagProps } from 'antd/es/tag';

const customTag = (props: TagProps) => {
  return <Tag color="blue" {...props} />;
};

export const TabTag = styled(customTag)`
  margin-left: 10px;
  pointer-events: none;
`;
export const TabTitle = styled.span`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const TransferContainer = styled.div`
  width: 100%;
  overflow: hidden;
  @media (min-width: ${LARGE_VIEWPORT}px) {
    padding-right: 10px;
  }
`;

export const TransferHintText = styled.div`
  color: ${(props) => props.theme.colors.gray7};
  margin: 10px 0;
  text-align: center;
  max-width: 620px;
`;

export const TransferColumns = styled.div`
  display: block;
  margin: 0 -20px;
  @media (max-width: 1365px) {
    display: none;
  }
`;

export const TransferColumn = styled.div`
  display: inline-block;
  width: 50%;
  max-width: 328px;
  padding: 0 20px;
  text-align: center;
`;

const customTransfer = (props: any) => (
  <Transfer
    listStyle={{
      height: 300,
    }}
    {...props}
  />
);

export const StyledTransfer = styled(customTransfer)`
  margin-top: 10px;
  flex-wrap: wrap;
  @media (min-width: 1365px) {
    flex-wrap: nowrap;
  }

  .ant-transfer-list {
    min-width: 150px;
    margin-bottom: 15px;
    width: 100%;
    @media (min-width: ${MediaSizes.MOBILE_WIDTH}px) {
      width: 45%;
      flex: 1 1 45%;
    }
    @media (min-width: ${MediaSizes.TABLET_WIDTH}px) {
      width: 100%;
      flex: 0 0 100%;
      max-width: 290px;
    }
    @media (min-width: 1365px) {
      width: 45%;
      flex: 1 1 45%;
    }
  }

  .ant-transfer-operation {
    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
    flex: 1 1 100%;
    margin-bottom: 10px;
    max-width: 280px;
    button {
      margin: 0 4px;
    }
    @media (max-width: ${SMALL_VIEWPORT}px) {
      max-width: none;
    }
    @media (min-width: 1365px) {
      display: inline-block;
      flex: none;
    }
  }

  /* чтобы при переносе строки Transfer'а строка не дергался */
  .ant-tree-treenode.ant-tree-treenode-switcher-open ~ .ant-tree-treenode > .ant-tree-switcher {
    margin-left: 24px;
  }
  .ant-tree-treenode.ant-tree-treenode-switcher-open > .ant-tree-switcher,
  .ant-tree-treenode.ant-tree-treenode-switcher-close > .ant-tree-switcher,
  .ant-tree-treenode.ant-tree-treenode-switcher-open ~ .ant-tree-treenode > .ant-tree-indent ~ .ant-tree-switcher {
    margin-left: 0 !important;
  }
`;

export const TargetingWrapper = styled(VerticalMenuWrapper)`
  .ant-transfer-list {
    border-color: #d9d9d9;
  }
  .ant-form-item-has-error & .ant-select:not(.ant-select-borderless) .ant-select-selector {
    border-color: #d9d9d9 !important;
  }
  .ant-form-item-has-error & .ant-select:not(.ant-select-borderless).ant-select-open .ant-select-selector,
  .ant-form-item-has-error & .ant-select:not(.ant-select-borderless).ant-select-focused .ant-select-selector {
    border-color: #d9d9d9 !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;
