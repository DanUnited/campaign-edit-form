import React from 'react';
import styled from 'styled-components';
import { Select, Tag, Typography } from 'antd';

import { SelectProps, RefSelectProps } from 'antd/lib/select';
type CustomSelectProps = SelectProps<string>

const customSelect = React.forwardRef<RefSelectProps, CustomSelectProps>(({ children, ...props }: SelectProps<string>, ref) => {
  return (
    <Select {...props} ref={ref}>
      {children}
    </Select>
  );
});

export const TimeZoneSelect = styled(customSelect)`
  display: block;
  width: 300px !important;
  max-width: 100%;
  margin-bottom: 10px;
`;

export const QuickLinkContainer = styled.div`
  margin: 10px 0;
`;
export const QuickLink = styled(Tag)`
  [data-kit-theme="default"] &.ant-tag {
    cursor: pointer;
    margin-top: 4px;
  }
`;

export const IndentBlock = styled.div`
  margin-top: 8px;
  margin-left: 8px;
`;

export const DayPartingSwitcher = styled.div`
  display: inline-block;
  margin-top: 20px;
  cursor: pointer;
`;

export const DayPartingNote = styled(Typography.Paragraph)`
  font-style: italic;
  max-width: 500px;
`;
