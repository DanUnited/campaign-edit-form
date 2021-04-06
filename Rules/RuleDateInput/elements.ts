import styled from 'styled-components';
import { Radio, Menu } from 'antd';

export const InnerPickerBlock = styled.div`
  display: inline-block;
  position: relative;
  line-height: 30px;
  padding: 0 24px 0px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  .anticon {
    right: 8px;
    position: absolute;
    line-height: 36px;
    color: #d0d4d8;
    font-size: 12px;
  }
`;

export const StyledRadio = styled(Radio)`
  &.ant-radio-wrapper {
    display: block;
    height: 30px;
    lineHeight: 30px;
  }

  .ant-radio {
    vertical-align: middle;
  }
`

export const StyledMenuItem = styled(Menu.Item)`
  &.ant-dropdown-menu-item:hover {
    background: transparent;
  }
`