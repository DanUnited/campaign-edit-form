import React, { useCallback } from 'react';

import { MainContainer, SideContainer, TwoColumnContainer } from 'components/layout';
import FormCampaign from './form';
import UserEditButtons from '../view/userEditButtons';
import AdminEditButtons from '../../admin-role/campaigns/view/adminEditButtons';

import { IAdminCampaign } from 'modules/api-requests/campaigns/entities';
import { ICampaignFormProps } from 'containers/pages/user-role/campaigns/single';

const CampaignsLayoutForm: React.FC<ICampaignFormProps> = ({
  id,
  campaign,
  isAdmin,
  ...rest
}) => {
  const FormComponent = useCallback(() => (
      <FormCampaign id={id} campaign={campaign} isAdmin={isAdmin} {...rest} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(campaign), isAdmin, id]);

  if (id === -1) {
    return <FormComponent />;
  }

  return (
    <TwoColumnContainer>
      <MainContainer>
        <FormComponent />
      </MainContainer>
      <SideContainer>
        {isAdmin
          ? (<AdminEditButtons
            id={id}
            status={campaign.status}
            userId={(campaign as IAdminCampaign).userId}
            isEditPage={true}
          />)
          : (<UserEditButtons
            id={id}
            status={campaign.status}
            isEditPage={true}
          />)}
      </SideContainer>
    </TwoColumnContainer>
  );
};

export default CampaignsLayoutForm;
