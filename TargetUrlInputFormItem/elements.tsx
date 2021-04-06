import styled from 'styled-components';
import { Tag } from 'antd';

export const TagsContainer = styled.div`
  margin-top: -10px;
  margin-bottom: -2px;
`;

export const TagsItem = styled(Tag)`
  margin-top: 2px !important;
  margin-bottom: 2px !important;

  &:hover{
    background: #f3f3f7;
    cursor: pointer;
  }
`;
