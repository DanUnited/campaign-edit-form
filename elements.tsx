import React from 'react';
import styled from 'styled-components';
import { Form, Radio, Select, Tooltip, TreeSelect, InputNumber } from 'antd';
import i18next from 'i18next';
import { archivedStatuses, CampaignStatuses, notArchivedStatuses } from 'modules/api-requests/campaigns/entities';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';

import { statusAdapter } from 'components/common/status';
import { SelectProps, RefSelectProps } from 'antd/es/select';
import { DataNode } from 'rc-tree-select/lib/interface';
import { RefTreeSelectProps, TreeSelectProps } from 'antd/lib/tree-select';

export const StyledForm = styled(Form)`
  .ant-form-item,
  .ant-form-item-with-help {
    margin-bottom: 14px;
  }
`;

const customFormTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ children, ...props }, ref) => (
  <h4 {...props} ref={ref}>
    {children}
  </h4>
));

export const FormTitle = styled(customFormTitle)`
  margin-bottom: 14px;
`;
export const FormItemNoContent = styled(Form.Item)`
  margin-bottom: 2px !important;
  & .ant-form-item-control-input {
    display: none;
  }
`;

export const SelectCampaignStatus = React.forwardRef<RefSelectProps, SelectProps<string>>((props, ref) => (
  <Select {...props} ref={ref}>
    {[...notArchivedStatuses, CampaignStatuses.ARCHIVED].map((status, key) =>
      <Select.Option value={status} key={key}>{statusAdapter(status)}</Select.Option>
    )}
  </Select>
));

const { SHOW_PARENT } = TreeSelect;
const treeData: DataNode[] = [{
  title: i18next.t('ACTIVE STATUS'),
  value: 'active',
  key: 'active',
  children: notArchivedStatuses.map((status) => ({
    title: statusAdapter(status),
    value: status,
    key: status,
  })),
}, {
  title: i18next.t('ARCHIVE STATUS'),
  value: 'archive',
  key: 'archive',
  children: archivedStatuses.map((status) => ({
    title: statusAdapter(status),
    value: status,
    key: status,
  })),
}];
export const TreeSelectCampaignStatus = React.forwardRef<RefTreeSelectProps, TreeSelectProps<string>>((props, ref) => (
  <TreeSelect
    {...props}
    treeData={treeData}
    showCheckedStrategy={SHOW_PARENT}
    treeCheckable={true}
    treeDefaultExpandAll
    dropdownClassName="dropdown-scroll-always-show"
    ref={ref}
  />
));

interface ITooltipTitleProps {
  title: string;
  hint: string;
  iconStyles?: any;
}

const InfoIcon = styled.span`
  opacity: 0.9;
  margin-left: 6px;
  font-size: 12px;
  cursor: pointer;
`;

export const TooltipTitle = ({ title, hint, iconStyles = {} }: ITooltipTitleProps) => {
  const breakpoints = useBreakpoint();
  const placement = breakpoints.xs ? 'top' : 'right';

  return (
    <>
      {title}
      <Tooltip title={hint} placement={placement}>
        <InfoIcon className="far fa-question-circle" style={iconStyles} />
      </Tooltip>
    </>
  );
}

export const RadioWrapper = styled(Radio)`
  white-space: normal !important;
`;

export const CampaignContentWrapper = styled.div`
  padding-top: 10px;
  margin-bottom: -8px;

  .ant-form-item-label {
    padding-bottom: 5px !important;
  }
`;

export const OneRowRadio = styled(Radio)`
  display: flex !important;
  padding-bottom: 8px !important;
  align-items: center;
`;

export const StyledInputNumber = styled(InputNumber)`
  margin-right: 10px !important;
`;

export const FieldBox = styled.div<any>`
  display: flex;
  flex-wrap: wrap;

  .ant-form-item {
    margin-right: ${(props) => (props['data-narrow'] ? 10 : 16)}px;
    flex-basis: 0;
    flex-wrap: nowrap !important;

    .ant-form-item-label,
    .ant-form-item-control-input {
      white-space: nowrap;
      flex-basis: auto !important;
    }
  }
`;
