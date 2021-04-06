import React from 'react';
import { Form, Radio } from 'antd';
import styled, { css } from 'styled-components';

import { FormItemProps } from 'antd/es/form/FormItem';
import { RadioGroupProps } from 'antd/es/radio/interface';
import { RadioButtonProps } from 'antd/es/radio/radioButton';

import { MOBILE_VIEWPORT, SMALL_VIEWPORT } from 'modules/themes/config';

type StyledType = { column: boolean };

export const FormItem = styled<any>(({ column, ...rest }: FormItemProps & StyledType) => <Form.Item {...rest} />)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    [data-kit-theme='default'] &.ant-form-item {
      align-items: flex-start;
    }
  }

  ${({ column }) =>
    column &&
    css`
      [data-kit-theme='default'] &.ant-form-item {
        order: 1;
        margin-left: 24px;
      }
    `}
`;

const radioGroupCss = css`
  [data-kit-theme='default'] &.ant-radio-group {
    display: flex;
    flex-direction: column;
  }
`;

// todo: no need an additional props, use just a className
export const RadioGroup = styled<any>(React.forwardRef(({ column, ...rest }: RadioGroupProps & StyledType, ref: any) => (
  <Radio.Group {...rest} ref={ref} />
)))`
  ${({ column }) =>
    column
      ? radioGroupCss
      : css`
          @media (max-width: ${SMALL_VIEWPORT}px) {
            [data-kit-theme='default'] &.ant-radio-group {
              display: flex;
              flex-wrap: wrap;
            }
          }
        `}

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    ${radioGroupCss}
  }
`;

const radioButtonCss = css`
  [data-kit-theme='default'] .ant-form & {
    border-width: 1px;

    :not(:last-child) {
      border-bottom: none;
    }
  }
`;

export const RadioButton = styled<any>(({ column, ...rest }: RadioButtonProps & StyledType) => (
  <Radio.Button {...(rest as RadioGroupProps)} />
))`
  ${({ column }) =>
    column
      ? radioButtonCss
      : css`
          @media (max-width: ${SMALL_VIEWPORT}px) {
            [data-kit-theme='default'] .ant-form & {
              flex-grow: 1;
              flex-basis: 50%;
              border-width: 1px;
            }
          }
        `}

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    ${radioButtonCss}
  }

  .ant-radio-button + span {
    white-space: nowrap;
  }
`;
