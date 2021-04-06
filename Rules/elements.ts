import styled from 'styled-components';
import { Row } from 'antd';

export const Connector = styled.span`
  margin: 0 4px;
`;

export const RuleRow = styled(Row)`
  border-radius: 4px;
  margin-bottom: 16px !important;
  border: 1px solid #ebeff4;

  &.edit {
    background: #f2f4f8;
    border-color: transparent;

    .ant-form-item-has-error & {
      border-color: #f5222e !important;

      [data-kit-theme="default"] & .ant-input-number,
      [data-kit-theme="default"] & .ant-select .ant-select-selector {
        border-color: #e4e9f0 !important;
      }
    }
  }

  .ant-col > button {
    margin-left: 4px;
  }
  .ant-col > * {
    margin-bottom: 4px;
  }
`;

export const ViewRuleRow = styled.span`
  line-height: 2.3em;
  margin-left: 8px;
`;
