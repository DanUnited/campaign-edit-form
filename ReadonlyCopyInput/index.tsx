import React from 'react';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getOnCopyCallback } from 'utils';

const Container = styled.div`
  display: flex;

  .ant-input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .ant-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    margin-left: -1px;
  }
`;

export const ReadonlyCopyInput = ({ value }: {value: string}) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Input
        disabled={true}
        value={value}
      />
      <Button onClick={getOnCopyCallback(value)}>{t('Copy')}</Button>
    </Container>
  );
};
