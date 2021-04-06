import { Tree } from 'antd';
import styled from 'styled-components';

export const StyledTree = styled(Tree)`
  &.ant-tree {
    .ant-tree-treenode {
      width: 100%;
    }
    .ant-tree-node-content-wrapper {
      flex-grow: 1;
      &.ant-tree-node-selected {
        background: none;
        span span {
          background-color: #bae7ff;
          display: inline-block;
          width: auto;
          margin-left: -4px;
          padding: 0 4px;
          border-radius: 3px;
        }
      }
    }
    .ant-tree-title,
    .ant-tree-title > span {
      position: relative;
      display: block;
      width: 100%;
      user-select: none;
    }
    .ant-tree-title img {
      width: 16px;
      position: absolute;
      left: -24px;
      top: 6px;
    }
  }
`;