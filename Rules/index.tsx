import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useForceUpdate from 'antd/es/_util/hooks/useForceUpdate';
import { Col, Row, Empty } from 'antd';
import { omit } from 'ramda';

import campaignRulesSelectors from 'models/campaignRules/selectors';
import { AddButton } from 'components/common/elements';
import { FormTitle } from '../elements';
import { RuleForm } from './form';

import { FormInstance } from 'antd/es/form';
import { ICampaignRuleEntity } from 'modules/api-requests/campaigns/entities';

interface ICampaignRules {
  campaignId?: number;
  isAdmin?: boolean;
  form: FormInstance;
  value?: ICampaignRuleEntity[];
  mode?: 'view' | 'edit';
}

interface ILocalRule extends Omit<ICampaignRuleEntity, 'conditions'> {
  conditions: any[],
  isEdit?: boolean;
  isNew?: boolean;
}

export const CampaignRules = ({ campaignId = -1, isAdmin, form, value = [], mode = 'edit' }: ICampaignRules) => {
  const { t } = useTranslation();
  const rules = useSelector(campaignRulesSelectors.getData);
  const [localRules, setLocalRules] = useState<ILocalRule[]>([]);
  const forceUpdate = useForceUpdate();
  const isEditMode = mode === 'edit';

  const addRuleAction = useCallback(() => {
    const newRuleEntity: ILocalRule = {
      campaignId,
      conditions: [{ logicalOperator: 'AND' }],
      campaignRuleActionsEnum: ['ADD_ZONE_ID_TO_BLACKLIST'],
      aggregatedAttributeValueForLastDays: 7,
      isEdit: true,
      isNew: true,
    };

    form.setFieldsValue({
      rules: (form.getFieldValue('rules') || []).concat(newRuleEntity),
    });

    setLocalRules(localRules.concat(newRuleEntity))
  }, [form, campaignId, localRules]);

  const removeRuleAction = useCallback(
    (rule: ICampaignRuleEntity, index: number) => {
      const currentRules = form.getFieldValue('rules');
      currentRules.splice(index, 1);
      localRules.splice(index, 1);

      form.setFieldsValue({ rules: currentRules });
      form.validateFields(['rules']);
      setLocalRules(localRules)

      forceUpdate();
    },
    [form, forceUpdate, localRules],
  );

  const saveRuleAction = useCallback(
    (rule: ICampaignRuleEntity, index: number) => {
      const currentRules = form.getFieldValue('rules');
      if (index >= 0 && rule) {
        currentRules[index] = omit(['isNew'], rule);
        form.setFieldsValue({ rules: currentRules });
        form.validateFields(['rules']);
        localRules[index] = currentRules[index];
        setLocalRules(localRules)

        forceUpdate();
      }
    },
    [form, forceUpdate, localRules],
  );

  const editRuleAction = useCallback(
    (isEdit: boolean, index: number) => {
      const currentRules = form.getFieldValue('rules');
      currentRules[index] = {
        ...localRules[index], // restore from cache value
        isEdit,
      };
      form.setFieldsValue({ rules: currentRules });

      if (!isEdit) {
        form.validateFields(['rules']);
      }

      forceUpdate();
    },
    [form, forceUpdate, localRules],
  );

  useEffect(() => {
    if (rules) {
      form.setFieldsValue({ rules });
      setLocalRules(rules);
      forceUpdate();
    }
  }, [rules, form, forceUpdate]);

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: 7 }}>
        <Col>
          <FormTitle>{t('Optimization rules')}</FormTitle>
        </Col>
        {isEditMode && isAdmin && (
          <Col>
            <AddButton style={{ minWidth: 0 }} onClick={addRuleAction}>
              <i className="fas fa-plus sm mr-2" />
              {t('Add rule')}
            </AddButton>
          </Col>
        )}
      </Row>
      <Row>
        <Col span={24}>
          {(value || []).length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: 160, margin: 0 }} />
          )}
          {(value || []).map((item, index) => (
            <RuleForm
              key={item.id || index}
              value={item}
              index={index}
              onRemove={removeRuleAction}
              onEdit={editRuleAction}
              onSave={saveRuleAction}
              isAdmin={isAdmin}
              mode={mode}
            />
          ))}
        </Col>
      </Row>
    </>
  );
};
