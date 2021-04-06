import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RadioChangeEvent } from 'antd/lib/radio/interface';

import { updateCreativeTypeAction } from 'models/campaigns';
import { isAdminRole } from 'models/currentUser';
import { CreativeType } from 'modules/api-requests/campaigns/entities';

import { FormItem, RadioGroup, RadioButton } from './elements';

export interface ICampaignContentFormProps {
  creativeId: number;
  creativeIndex: number;
  disabled?: boolean;
  column?: boolean;
}

export const CampaignContentForm = ({ creativeId, creativeIndex, disabled, column }: ICampaignContentFormProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminRole);
  if (!isAdmin) {
    return null;
  }

  const onChange = (e: RadioChangeEvent) => dispatch(updateCreativeTypeAction({ creativeId, type: e.target.value }));

  return (
    <FormItem name={[creativeIndex, 'contentBehaviourType']} label={t('Creative Type')} column={column}>
      <RadioGroup buttonStyle="solid" onChange={onChange} disabled={disabled} column={column}>
        <RadioButton column={column} value={CreativeType.MAINSTREAM_CLEAN}>
          Mainstream (Clean)
        </RadioButton>
        <RadioButton column={column} value={CreativeType.MAINSTREAM_AGGRESSIVE}>
          Mainstream (Aggressive)
        </RadioButton>
        <RadioButton column={column} value={CreativeType.ADULT_SOFT}>
          Adult (Soft)
        </RadioButton>
        <RadioButton column={column} value={CreativeType.ADULT_EXPLICIT}>
          Adult (Explicit)
        </RadioButton>
      </RadioGroup>
    </FormItem>
  );
};
