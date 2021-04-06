import styled, { css } from 'styled-components';
import { DraggerProps } from 'antd/es/upload';
import { Upload } from 'antd';

export const CropControlsContainer = styled.div`
  height: 97%;
  width: 97%;
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 26px;
  cursor: default;
  transition: opacity 266ms ease-out;
  opacity: 0;
  padding-left: inherit;
  padding-right: inherit;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: 4px;
  border-radius: 4px;
  &:hover {
    opacity: 1;
  }
  i {
    cursor: pointer;
    margin: 0 5px;
  }
`;

interface IDraggerProps extends DraggerProps {
  height: number;
  width: number;
}

export const DraggerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  ${(props: IDraggerProps) => css`
    max-height: ${props.height}px;
    max-width: ${props.width}px;
    padding-bottom: ${100 * props.height / props.width}%;
  `}
`;

export const StyledDragger = styled(Upload.Dragger)`
  &.ant-upload.ant-upload-drag {
    position: absolute;
    top: 0;
    left: 0;
    height: 100% !important;
    width: 100%;
    display: inline-flex;
    align-items: center;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 10px;
  }
`;

export const PlusIcon = styled.i`
  font-size: 30px;
  opacity: .75;
  margin-bottom: 1px;
`;
