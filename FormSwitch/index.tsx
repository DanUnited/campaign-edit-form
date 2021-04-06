import React from 'react';
import { Switch } from 'antd';
import i18n from 'i18next';
import styled from 'styled-components';

const FormSwitchContainer = styled<any>('label')`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
`;

const FormSwitchSwitch = styled(Switch)`
  flex-shrink: 0;
  flex-grow: 0;
`;

const FormSwitchText = styled.span`
  margin-left: 10px;
`;

const FormSwitchListItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 250px;
`;

interface IProps {
  value?: boolean;
  onChange?: (_: boolean) => void;
  children?: any;
  disabled?: boolean;
}

export const FormSwitch = ({ value, onChange, children, disabled, ...props }: IProps) => (
    disabled ? (
      <FormSwitchListItem>
        <span>{children}</span>
        <strong>{value ? i18n.t('On') : i18n.t('Off')}</strong>
      </FormSwitchListItem>
    ) : (
      <FormSwitchContainer>
        <FormSwitchSwitch
          checkedChildren={i18n.t('On')}
          unCheckedChildren={i18n.t('Off')}
          checked={value}
          onChange={onChange}
          {...props}
        />
        <FormSwitchText>{children}</FormSwitchText>
      </FormSwitchContainer>
    )
);
