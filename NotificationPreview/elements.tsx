import { Button } from 'antd';
import styled, { css } from 'styled-components';

export const Title = styled.h2`
  font-size: 16px;
`;

export const PreviewContainer = styled.div<any>`
  margin-bottom: 14px;
  overflow: hidden;
  max-width: 353px;

  ${(props) =>
    props['data-column'] &&
    css`
      margin-top: 30px;
    `}
`;

export const DesktopPreviewContainer = styled.div`
  position: relative;
  justify-content: space-between;
  padding: 12px 12px 17px 17px;
  border-radius: 2px;
  background-color: #fefefe;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: height 0.3s ease-out;
  width: 100%;
  width: calc(100% - 4px);
  max-width: 353px;
  margin-bottom: 20px;
  margin-left: 2px;
`;

export const AndroidPreviewContainer = styled(DesktopPreviewContainer)`
  border-radius: 3px;
  padding: 0;
`;

export const HeaderContainer = styled.div`
  position: relative;
  display: flex;
  font-size: 12px;
  padding: 2px 0;
`;
export const AndroidHeaderContainer = styled(HeaderContainer)`
  background: #f5f5f5;
  padding: 4px 12px;
`;

export const HeaderTime = styled.span`
  margin-left: auto;
`;

export const ChromeIcon = styled.i`
  font-size: 13px;
  color: #636363;
  margin-right: 5px;
  padding-top: 2px;
`;
export const UpIcon = styled.i`
  display: inline-block;
  transform: translate(8px, 9px) rotate(45deg);
  border: 1px solid #636363;
  width: 7px;
  height: 7px;
  border-right: none;
  border-bottom: none;
`;
export const AndroidUpIcon = styled(UpIcon)`
  margin: 0 0 0 15px;
`;

export const ContentContainer = styled.div`
  position: relative;
  padding-right: 40px;
`;
export const AndroidContentContainer = styled(ContentContainer)`
  padding: 6px 50px 8px 12px;
`;

export const ContentTitle = styled.span`
  margin-bottom: 0;
  color: #353535;
  display: inline-block;
  overflow: hidden;
  width: 315px;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ContentMessage = styled.span`
  color: #757575;
  line-height: 16px;
  font-size: 12px;
  min-height: 16px;
  word-break: break-word;
`;

export const Flex = styled.div`
  display: flex;
`;

export const ImageContainer = styled.div`
  margin-top: 10px;
  img {
    width: 100%;
  }
`;

export const NotifyIconContainer = styled.div`
  width: 35px;
  height: 35px;
  position: absolute;
  right: 0;
  top: 20px;
  img {
    width: 100%;
  }
`;
export const AndroidNotifyIconContainer = styled(NotifyIconContainer)`
  right: 12px;
  top: 34px;
`;

export const TextP = styled.p<any>`
  font-size: 12px;
  margin-bottom: 21px;
`;

export const AndroidImageContainer = styled(ImageContainer)`
  padding: 0 12px 12px;
  margin-top: 0;
`;

export const ButtonWrapper = styled.div`
  display: flex;
`;

export const TranslateButton = styled(Button)`
  margin-left: 15px;
`;

export const TranslateImage = styled.img<any>`
  height: 100%;
  width: 100%;
  transition: filter 0.3s ${(props) => props.theme.transitions.cb};

  ${(props) =>
    (props['data-active'] || props['data-disabled']) &&
    css`
      filter: grayscale(1);
    `}
`;
