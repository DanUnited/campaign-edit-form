import { Form, Row } from 'antd';
import styled from 'styled-components';
import { EXTRA_LARGE_VIEWPORT } from 'modules/themes/config';
import { EmojiInput } from 'components/common/forms/input/emojiInput';

export const CreativeFormRow = styled.div`
  display: flex;
  justify-content: stretch;
  flex-wrap: wrap;
  margin: 0 -20px;
`;

export const CreativeFormCol = styled.div`
  flex-grow: 1;
  max-width: 100%;
  padding: 0 20px;

  @media (min-width: ${EXTRA_LARGE_VIEWPORT + 1}px) {
    padding-right: 10%;
  }
`;

export const CreativeImagesRow = styled(Row)`
  max-width: 800px;
`;

export const StyledEmojiInput = styled(EmojiInput)`
  max-width: 800px;
`;

export const CreativeFormPreview = styled.div`
  flex-shrink: 0;
  width: 380px;
  max-width: 100%;
  padding: 0 20px;
`;

export const CreativeFormTabItem = styled(Form.Item)`
  margin: 0 !important;
  & .ant-form-item-explain {
    display: none;
  }
`;

export const PlusIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  opacity: .6;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 5px;
    width: 2px;
    background: currentColor;
  }
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 5px;
    height: 2px;
    background: currentColor;
  }
`;

export const CreativeTabsWrapper = styled.div`
  .ant-tabs-nav .ant-tabs-tab {
    padding: 0 4px 0 10px !important;
  }
  .ant-tabs-nav-list {
    will-change: transform;
  }
`;
