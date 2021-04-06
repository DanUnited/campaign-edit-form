import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, notification, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { isNil, path } from 'ramda';
import i18n from 'i18next';

import {
  CampaignRuleConditionAttributes,
  CampaignRuleConditionOperator,
  CampaignRuleConditionOperatorEnum,
  getConditionAttributeTitle,
  ICampaignRuleEntity,
} from 'modules/api-requests/campaigns/entities';
import useRequest, { RequestStatusEnum } from 'utils/hooks/useRequest';
import {
  createCampaignRuleRequest,
  removeCampaignRuleRequest,
  updateCampaignRuleRequest,
} from 'modules/api-requests/campaigns/single';
import { Connector, RuleRow, ViewRuleRow } from './elements';
import { getValueForDaysTitle, RuleDateInput } from './RuleDateInput';
import { ThresholdInput } from './ThresholdInput';
import { IError, ISuccess } from 'modules/api-client/entities';
import { InputNumberProps } from 'antd/es/input-number';

const { Option } = Select;
const { Text } = Typography;

interface IRuleForm {
  value: ICampaignRuleEntity;
  index: number;
  onSave?: (rule: ICampaignRuleEntity, index: number) => void;
  onRemove?: (rule: ICampaignRuleEntity, index: number) => void;
  onEdit?: (isEdit: boolean, index: number) => void;
  mode: 'view' | 'edit';
  isAdmin?: boolean;
}

export const RuleForm = ({ value, index, onRemove = () => () => void 0, onSave, onEdit, isAdmin, mode }: IRuleForm) => {
  const { t } = useTranslation();
  const [
    ruleId,
    campaignId,
    valueForDays,
    conditionAttribute,
    conditionOperator,
    thresholdValue,
    isEdit,
    isNew,
  ] = [
    value.id,
    value.campaignId,
    value.aggregatedAttributeValueForLastDays,
    path<CampaignRuleConditionAttributes>(['conditions', 0, 'conditionAttribute'], value),
    path(['conditions', 0, 'conditionOperator'], value),
    path(['conditions', 0, 'thresholdValue'], value),
    path(['isEdit'], value),
    path(['isNew'], value),
  ];
  const isSaveDisabled = !conditionAttribute || !conditionOperator || isNil(thresholdValue);
  const applyChangesRequest = ruleId ? updateCampaignRuleRequest(isAdmin) : createCampaignRuleRequest(isAdmin);
  const [saveStatus, response, runSaveRequest] =
    useRequest<ICampaignRuleEntity[], ICampaignRuleEntity[]>(applyChangesRequest, [value], { runImmediately: false });
  const [removeStatus, , removeRequest] = useRequest(
    removeCampaignRuleRequest(isAdmin),
    { ids: [ruleId || -1] },
    { runImmediately: false, callback: () => onRemove(value, index) },
  );
  const [wasSentRequest, setWasSentRequest] = useState(false);
  const isLoading = saveStatus === RequestStatusEnum.LOADING;
  const isError = saveStatus === RequestStatusEnum.ERROR;
  const isSuccess = saveStatus === RequestStatusEnum.SUCCESS;
  const isRemoving = removeStatus === RequestStatusEnum.LOADING;
  const isEditMode = mode === 'edit';

  const onSaveRule = useCallback(() => {
    if (campaignId > 0) {
      runSaveRequest();
      setWasSentRequest(true);
    } else {
      if (onSave) {
        onSave({ ...value, isEdit: false }, index);
      }
    }
  }, [campaignId, runSaveRequest, onSave, index, value]);

  // just a trigger to show edit form
  const onEditRule = useCallback((editState: boolean, i: number) => () => {
    if (onEdit) {
      onEdit(editState, i);
    }
  }, [onEdit]);

  const onRemoveRule = useCallback((rule: ICampaignRuleEntity, _index: number) => () => {
    if (onRemove) {
      Boolean(ruleId)
        ? removeRequest()
        : onRemove(rule, _index);
    }
  }, [ruleId, onRemove, removeRequest]);

  // it isn't used at other components, can be placed in an external module later
  const thresholdValueProps: Omit<InputNumberProps, 'onChange'> = useMemo(() => {
    switch (conditionAttribute) {
      case CampaignRuleConditionAttributes.CPM: // $
        return ({
          step: 0.001,
          precision: 3,
        });
      case CampaignRuleConditionAttributes.CTR: // %
        return ({
          step: 0.01,
          precision: 2,
        });
      default:
        return {};
    }
  }, [conditionAttribute]);

  useEffect(() => {
    if (wasSentRequest && isSuccess) {
      if (onSave) {
        onSave({
          ...(response as ISuccess<ICampaignRuleEntity[]>).data[0],
          isEdit: false,
        }, index);
      }

      notification.success({
        message: i18n.t('A new rule was successfully added'),
        placement: 'topRight',
      });
    }
  }, [isSuccess, response, wasSentRequest, onSave, index]);

  useEffect(() => {
    if (wasSentRequest && isError) {
      notification.error({
        message: i18n.t('A new rule was successfully added'),
        description: (response as IError).message,
        placement: 'topRight',
      });
    }
  }, [isError, response, wasSentRequest]);

  return <>
    {
      (isEdit && isAdmin) ? (
          <RuleRow gutter={[8, 8]} justify={'space-between'} className={'edit'}>
            <Col>
              <Form.Item name={['rules', index, 'conditions', 0, 'id']} noStyle>
                <input type={'hidden'} />
              </Form.Item>
              <Form.Item name={['rules', index, 'conditions', 0, 'conditionAttribute']} noStyle>
                <Select placeholder={t('Type')} style={{ width: 120 }}>
                  {
                    Object.values(CampaignRuleConditionAttributes).map(attr => (
                      <Option value={attr} key={attr}>{getConditionAttributeTitle(attr)}</Option>))
                  }
                </Select>
              </Form.Item>
              <Connector>is</Connector>
              <Form.Item name={['rules', index, 'conditions', 0, 'conditionOperator']} noStyle>
                <Select placeholder={t('Conditions')} style={{ width: 120 }}>
                  {
                    Object.values(CampaignRuleConditionOperatorEnum).map(attr => (
                      <Option value={attr}
                              key={attr}>{CampaignRuleConditionOperator.enum(attr).value.operationName}</Option>))
                  }
                </Select>
              </Form.Item>
              <Form.Item name={['rules', index, 'conditions', 0, 'thresholdValue']} noStyle>
                <ThresholdInput {...thresholdValueProps} />
              </Form.Item>
              <Connector>within</Connector>
              <Form.Item name={['rules', index, 'aggregatedAttributeValueForLastDays']} noStyle>
                <RuleDateInput />
              </Form.Item>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Button disabled={isSaveDisabled} onClick={onSaveRule} loading={isLoading}>
                <i className="fas fa-check" />
              </Button>
              {!isNew
                ? (
                  <>
                    <Button loading={isLoading} onClick={onEditRule(false, index)}>
                      <i className="fas fa-times" />
                    </Button>
                  </>
                )
                : (
                  <Button onClick={onRemoveRule(value, index)} loading={isLoading || isRemoving}>
                    <i className="fas fa-trash" />
                  </Button>
                )
              }
            </Col>
          </RuleRow>
        )
        : (
          <RuleRow gutter={[8, 8]} justify={'space-between'}>
            <Col>
              <ViewRuleRow>
                <Text strong>{`${conditionAttribute}`}</Text> is <Text strong>
                {String(conditionOperator)}</Text> {conditionOperator === CampaignRuleConditionOperatorEnum.EQUAL ? t('to') : t('than')}
                <Text strong> {String(thresholdValue)}</Text>
                {t(' within ')}<Text strong> {getValueForDaysTitle(valueForDays)}</Text>
              </ViewRuleRow>
            </Col>
            {(isEditMode && isAdmin) && (
              <Col style={{ textAlign: 'right' }}>
                <Button loading={isLoading} onClick={onEditRule(true, index)}>
                  <i className="fas fa-pen" />
                </Button>
                <Button onClick={onRemoveRule(value, index)} loading={isLoading}>
                  <i className="fas fa-trash" />
                </Button>
              </Col>
            )}
          </RuleRow>
        )
    }
  </>;
};
