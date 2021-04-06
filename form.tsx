import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button, Form, Input, Radio, Select } from 'antd';
import { always, lensPath, path, set, is, pick, filter, equals } from 'ramda';

import { Title } from 'components/common/elements';
import { ViewMode } from 'components/common/entities';
import { UserSelect } from 'components/common/forms/select';
import { FormLabel } from 'components/common/forms/elements';
import { statusAdapter } from 'components/common/status';
import {
  clearErrors as clearFormErrors,
  dataToFormValues,
  getMinMaxValidator,
  getOnFailScrollToField,
  setErrors,
} from 'utils/form';
import { isNotEmpty } from 'utils/ramda';
import { debounce } from 'utils/debounce';
import { getDictionaryDataSelector, getDictionaryIsLoadingSelector } from 'models/dictionary/selectors';
import { getUserFromMapById } from 'models/users/redux/selectors';
import { dictionaryAction } from 'models/dictionary/actions';
import { isLoadingCampaigns } from 'models/campaigns/redux/selectors';
import {
  CampaignContentWrapper,
  FormItemNoContent,
  FormTitle,
  OneRowRadio,
  StyledForm,
  TooltipTitle,
  StyledInputNumber,
  FieldBox,
} from './elements';
import { TargetingTabs } from './TargetingTabs';
import { BudgetForm } from './BudgetForm';
import { CreativeTabsForm } from './CreativeTabsForm';
import { TargetUrlInputFormItem } from './TargetUrlInputFormItem';
import { convertCheckboxArrayToDayParting, DayParting, hourCheckboxesInitialState } from './DayParting';
import { TimeZoneSelect } from './DayParting/elements';
import { DeliveryDates } from './DeliveryDates';
import { CampaignRules } from './Rules';
import { dayPartingValidator, optimizationRuleValidator } from './validators';
import { FormText } from 'components/common/forms/text';
import { initialState as targetingInitState } from './TargetingTabs/targetingContext/store';
import { getMenuCollection } from './TargetingTabs/targetingContext/utils';
import { optimalRatesAction } from 'models/optimalRates';
import { UserStatus, userDeletedStatuses, ICurrentUser } from 'modules/api-requests/currentUser/entities';
import { setCreativeTypesAvailable } from 'models/campaigns';
import { path as campaignListRoutePath } from 'containers/pages/admin-role/campaigns/list';
import { getFilters } from 'models/meta';

import {
  isCampaignEditable,
  isCampaignRunning,
  isCampaignPaused,
  CampaignUpdateModeType,
  CampaignStatuses,
  ICampaign,
  TrafficType,
} from 'modules/api-requests/campaigns/entities';
import { IBlockNavigationHOCProps, withBlockNavigation } from 'components/common/hoc/withBlockNavigation';
import { IStore } from 'modules/store/types';
import { Dictionaries } from 'models/dictionary/entities';
import { ConnectionTypes, TimezoneDictionary } from 'modules/api-requests/dictionary/entities';
import { IOptimalRatesRequest } from 'modules/api-requests/optimalRates/entities';
import { ICampaignFormProps } from 'containers/pages/user-role/campaigns/single';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

type fetchOptimalRatesType = (values: ICampaign) => void;

interface IProps extends ICampaignFormProps, IBlockNavigationHOCProps {
  isTimezonesLoading?: boolean;
  fetchTimezones?: () => void;
  timezones?: TimezoneDictionary;
  isLoading: boolean;
  fetchOptimalRates: fetchOptimalRatesType;
  campaignAdvertiser?: ICurrentUser;
}

type DateStateType = moment.Moment | null;
const toUTCFormat = (val: DateStateType): string | null => {
  if (val) {
    return moment.utc(val).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
  } else {
    return val;
  }
};

const sensitiveFields = ['url'];

const targetingFields = [
  'countryTargeting',
  'carrierTargeting',
  'deviceTargeting',
  'osTargeting',
  'browserTargeting',
  'languageTargeting',
];
const filterOptimalRatesData = pick([
  'countryTargeting',
  'carrierTargeting',
  'connectionType',
  'osTargeting',
  'deviceTargeting',
  'browserTargeting',
  'languageTargeting',
  'minAge',
  'maxAge',
  'trafficType',
]);
const optimalRatesAdapter = (data: ICampaign): IOptimalRatesRequest =>
  filter((v) => Boolean(v), filterOptimalRatesData(data));

const targetingComparison = (prevVal: any, curVal: any) => !equals(prevVal.targeting, curVal.targeting);

const CampaignsDetailForm: React.FC<IProps> = ({
  handleSubmit,
  id,
  campaign,
  campaignAdvertiser,
  clearCampaign,
  mode,
  uploadRequest,
  getResourceRequest,
  clearErrors,
  errorFields,
  fetchTimezones,
  isTimezonesLoading,
  timezones = [],
  isAdmin,
  startBlockingNavigation,
  setBlockNavigation,
  onValuesChange,
  isLoading,
  fetchOptimalRates,
  isFormTouched,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { resetFields } = form;
  const hasActiveStatus = Boolean(
    campaign.status &&
      (isCampaignRunning(campaign.status) ||
        isCampaignPaused(campaign.status) ||
        (isAdmin && campaign.status !== CampaignStatuses.DRAFT)),
  );

  const canSendToModeration = isCampaignEditable(campaign.status) || !campaign.status;
  const canSaveAsDraft = canSendToModeration || hasActiveStatus;
  const [canSaveWithoutModerate, setCanSaveWithoutModerate] = useState<boolean>(hasActiveStatus);
  const canSwitchCreativeType = campaignAdvertiser?.status === UserStatus.ENABLED;
  const campaignListFilters = useSelector(getFilters(campaignListRoutePath));
  const userId = isAdmin ? path(['userId'], campaignListFilters) : undefined;

  const submit = useCallback(
    (formValues: any, campaignMode?: CampaignUpdateModeType) => {
      formValues.startDate = toUTCFormat(formValues.startDate);
      formValues.endDate = toUTCFormat(formValues.endDate);

      delete formValues.targeting;

      setBlockNavigation(false);
      handleSubmit(formValues, mode, campaignMode);
    },
    [setBlockNavigation, handleSubmit, mode],
  );

  const onSubmit = useCallback(
    (values: any) => {
      submit(values, canSaveWithoutModerate ? undefined : 'activate');
    },
    [canSaveWithoutModerate, submit],
  );

  const onFinishFailed = useCallback(
    (formValues: ValidateErrorEntity) => {
      // manual switch to error creative tab
      const creativeIndex = path([0, 'name', 1], formValues.errorFields);
      if (is(Number, creativeIndex)) {
        const creativeEvent = new CustomEvent('changedCreativeTabIndex', {
          detail: {
            tabIndex: creativeIndex,
          },
        });
        document.dispatchEvent(creativeEvent);
        if (String(formValues.errorFields[0].errors).trim().length === 0) {
          formValues.errorFields.shift(); // remove tab fake element
        }
      }

      Promise.resolve().then(() => {
        getOnFailScrollToField(form)(formValues);
      });
    },
    [form],
  );

  const onDraftSave = useCallback(() => {
    form
      .validateFields()
      .then((values: any) => {
        submit(values, 'draft');
      })
      .catch(onFinishFailed);
  }, [form, onFinishFailed, submit]);

  useEffect(() => {
    const listener = (customEvent: any) => {
      form.setFieldsValue({
        sourceTargeting: customEvent.detail.subIdList,
        sourceTargetingMode: customEvent.detail.subIdListMode,
        zoneIdList: customEvent.detail.zoneIdList,
        zoneIdListMode: customEvent.detail.zoneIdListMode,
      });
    };
    document.addEventListener('changeBlackWhiteLists', listener, true);
    return () => document.removeEventListener('changeBlackWhiteLists', listener, true);
  }, [form]);

  // load timezones and campaign
  useEffect(() => {
    if (!isTimezonesLoading && (!timezones || !timezones.length) && fetchTimezones) {
      fetchTimezones();
    }
  }, [fetchTimezones, timezones, isTimezonesLoading]);

  useEffect(() => {
    if (isNotEmpty(errorFields)) {
      setErrors(form, errorFields);
      setBlockNavigation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(errorFields)]);

  // reset fields when campaign page is change
  useEffect(() => {
    if (mode === ViewMode.view || (campaign && id !== campaign.id)) {
      clearCampaign();
      resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id, clearCampaign, resetFields]);

  useEffect(() => {
    if (errorFields) {
      clearFormErrors(form, errorFields, clearErrors);
    }
    if (campaign) {
      startBlockingNavigation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(campaign)]);

  useEffect(() => {
    const formIsTouchedEvent = new CustomEvent('campaignFormIsTouched', { detail: { formIsTouched: true } });
    document.dispatchEvent(formIsTouchedEvent);
  }, [isFormTouched]);

  // setup form values from campaign data
  const fields = useMemo(() => {
    if (campaign && ((mode === ViewMode.view && campaign.id !== -1) || id !== campaign.id)) {
      return [];
    }

    const props = dataToFormValues(campaign, ['remaining', 'isEditable', 'user']);
    if (isAdmin) {
      fetchOptimalRates(campaign);
    }

    if (campaign) {
      if (campaign.startDate !== null) {
        props.push({ name: 'startDate', value: moment.utc(campaign.startDate) });
      }

      if (campaign.endDate !== null) {
        props.push({ name: 'endDate', value: moment.utc(campaign.endDate) });
      }

      targetingFields.forEach((key) => {
        const value = (campaign as any)[key];
        props.push({ name: key, value: value && value.length > 0 ? value : null });
      });
    }

    Promise.resolve().then(() => dispatch(setCreativeTypesAvailable(campaign)));
    return props;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getMode = (vMode: ViewMode): string => {
    switch (vMode) {
      case ViewMode.copy: {
        return t('Copy');
      }
      case ViewMode.edit: {
        return t('Edit');
      }
      default:
        return t('Create');
    }
  };

  const debouncedFetchOptimalRates: fetchOptimalRatesType = useCallback(debounce(fetchOptimalRates, 2000), [
    fetchOptimalRates,
  ]);

  const onValuesChangeFunc = useCallback(
    (changeValues: any, values: any) => {
      const changedFieldName = Object.keys(changeValues)[0];
      const errorFieldNames = Object.keys(errorFields);
      if (errorFieldNames.includes(changedFieldName)) {
        clearFormErrors(form, changeValues, clearErrors);
      }

      if (changeValues.creatives) {
        const creativeSensitiveFields = ['title', 'description', 'icon', 'image'];
        changeValues.creatives.forEach((creative: any, index: number) => {
          const sensitive = creativeSensitiveFields.includes(Object.keys(creative).find(always(true)) || '');
          if (sensitive) {
            form.setFieldsValue({
              creatives: set(lensPath([index, 'canSave']), false, form.getFieldValue('creatives')),
            });
          }
        });
      }

      if (!isAdmin && canSaveWithoutModerate && sensitiveFields.includes(changedFieldName)) {
        setCanSaveWithoutModerate(false);
      }

      if (!changeValues?.errorContainer) {
        onValuesChange();
      }

      if (isAdmin && isNotEmpty(filterOptimalRatesData(changeValues))) {
        debouncedFetchOptimalRates(values);
      }

      if (changeValues.creatives) {
        dispatch(setCreativeTypesAvailable(changeValues));
      }
    },
    [
      canSaveWithoutModerate,
      clearErrors,
      debouncedFetchOptimalRates,
      errorFields,
      form,
      isAdmin,
      onValuesChange,
      dispatch,
    ],
  );

  return (
    <>
      {isAdmin && (
        <Title>
          {getMode(mode)} {t('campaign')}
        </Title>
      )}
      {!isAdmin && (
        <Title style={{ marginBottom: '1.5rem' }}>
          {getMode(mode)} {t('campaign')}
        </Title>
      )}

      <StyledForm
        name="login_form"
        layout="vertical"
        scrollToFirstError
        form={form}
        onFinish={onSubmit}
        onFinishFailed={onFinishFailed}
        initialValues={{
          userId,
          sourceTargetingMode: 'blacklist',
          zoneIdListMode: 'blacklist',
          frequency: 1,
          duration: 24,
          mainstreamClean: true,
          adultSoft: true,
          mainstreamAggressive: true,
          adultExplicit: true,
          connectionType: ConnectionTypes.ALL,
          creatives: [{}],
          rules: [],
          dayPartingTimezone: momentTimezone.tz.guess(),
          targeting: getMenuCollection(targetingInitState),
          dayParting: convertCheckboxArrayToDayParting(hourCheckboxesInitialState),
        }}
        fields={fields}
        onValuesChange={onValuesChangeFunc}
      >
        <Form.Item name="id" noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name="status" noStyle>
          <Input hidden />
        </Form.Item>

        {isAdmin && (
          <Form.Item
            style={{ width: '150px' }}
            label="Select advertiser"
            name="userId"
            rules={[{ required: true, message: t('Please select the advertiser') }]}
          >
            <UserSelect
              disabled={mode === ViewMode.edit}
              placeholder={t('Advertisers')}
              allowClear={false}
              exclude={mode === ViewMode.edit ? [] : userDeletedStatuses}
            />
          </Form.Item>
        )}

        <div className="card">
          <div className="card-body">
            <FormTitle>{t('Campaign Information')}</FormTitle>
            {mode === ViewMode.edit && <FormLabel label={t('ID: ') + campaign.id} />}
            {mode === ViewMode.edit && (
              <Form.Item label={t('Status:')} name="status" noStyle>
                <FormText
                  prefixText={'Campaign status: '}
                  props={{
                    style: {
                      marginBottom: 5,
                      display: 'block',
                    },
                  }}
                  renderFunc={statusAdapter}
                />
              </Form.Item>
            )}
            <Form.Item
              label={t('Campaign name')}
              name="name"
              rules={[
                { required: true, message: t('Please input campaign name!'), whitespace: true },
                { max: 256, message: t('Too much letters') },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="url">
              <TargetUrlInputFormItem form={form} />
            </Form.Item>
            <CampaignContentWrapper>
              <Form.Item
                name="campaignBehaviourType"
                label={<TooltipTitle title={t('Landing Page Content')} hint={t('Select your landing page content')} />}
                rules={[{ required: true, message: t('Please input landing page content') }]}
              >
                <Radio.Group>
                  <OneRowRadio value={TrafficType.MAINSTREAM}>Mainstream</OneRowRadio>
                  <OneRowRadio value={TrafficType.ADULT}>Adult</OneRowRadio>
                </Radio.Group>
              </Form.Item>
            </CampaignContentWrapper>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <FormTitle>{t('Campaign Creatives')}</FormTitle>

            <FormItemNoContent
              name="creatives"
              rules={[{ required: true, message: t('Please add at least one creative') }]}
            >
              <span />
            </FormItemNoContent>
            <CreativeTabsForm
              uploadRequest={uploadRequest}
              getResourceRequest={getResourceRequest}
              form={form}
              canSwitchCreativeType={canSwitchCreativeType}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <FormTitle style={{ marginBottom: '16px' }}>{t('Campaign Budgeting')}</FormTitle>
            <BudgetForm form={form} />
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <FormTitle>{t('Campaign Targeting')}</FormTitle>
            <Form.Item shouldUpdate={targetingComparison}>
              {() => (
                <Form.Item name="targeting">
                  <TargetingTabs form={form} />
                </Form.Item>
              )}
            </Form.Item>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <FormTitle>{t('Campaign Delivery')}</FormTitle>
            <FormLabel label={t('Frequency / Capping')} />
            <FieldBox data-narrow={true}>
              <Form.Item>{t('One visitor will see each campaign')}</Form.Item>
              <Form.Item>
                <Form.Item
                  name="frequency"
                  noStyle
                  rules={[
                    { required: true, message: t('Please input Frequency Times field') },
                    { validator: getMinMaxValidator(1, 20) },
                  ]}
                >
                  <StyledInputNumber precision={0} min={0} />
                </Form.Item>
                {t('times per')}
              </Form.Item>
              <Form.Item>
                <Form.Item
                  name="duration"
                  noStyle
                  rules={[
                    { required: true, message: t('Please input Frequency Hours field') },
                    { validator: getMinMaxValidator(1, 48) },
                  ]}
                >
                  <StyledInputNumber precision={0} min={0} />
                </Form.Item>
                {t('hours')}
              </Form.Item>
            </FieldBox>

            <Form.Item
              style={{ marginBottom: 0 }}
              label={t('Select timezone')}
              name="dayPartingTimezone"
              rules={[{ required: true, message: t('Please input timezone') }]}
            >
              <TimeZoneSelect showSearch placeholder={t('Choose time zone')}>
                {timezones.map((item: { id: string; offset: string }) => (
                  <Select.Option key={item.id} value={item.id}>{`${item.id} (${item.offset})`}</Select.Option>
                ))}
              </TimeZoneSelect>
            </Form.Item>
            <Form.Item name="dayParting" rules={[{ validator: dayPartingValidator }]}>
              <DayParting />
            </Form.Item>

            <DeliveryDates form={form} />
          </div>
        </div>

        {isAdmin && (
          <div className="card">
            <div className="card-body">
              <Form.Item
                name="rules"
                rules={[{ validator: optimizationRuleValidator, message: t('Please save or remove unfinished rules') }]}
              >
                <CampaignRules campaignId={campaign.id} isAdmin={isAdmin} form={form} />
              </Form.Item>
            </div>
          </div>
        )}

        {canSaveWithoutModerate ? (
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              {t('Save')}
            </Button>
          </Form.Item>
        ) : (
          <Form.Item>
            <Button
              style={{ marginRight: '10px' }}
              type="primary"
              htmlType="submit"
              disabled={!canSendToModeration || isLoading}
            >
              {t('Send to moderation')}
            </Button>
            <Button onClick={onDraftSave} disabled={!canSaveAsDraft || isLoading}>
              {t('Save as draft')}
            </Button>
          </Form.Item>
        )}
      </StyledForm>
    </>
  );
};

export const mapStateToProps = (state: IStore, { campaign }: ICampaignFormProps) => ({
  campaignAdvertiser: getUserFromMapById(campaign.userId as number)(state),
  isLoading: isLoadingCampaigns(state),
  isTimezonesLoading: getDictionaryIsLoadingSelector(Dictionaries.TIMEZONES)(state),
  timezones: getDictionaryDataSelector(Dictionaries.TIMEZONES)(state) as TimezoneDictionary,
});

export const mapDispatchToProps = (dispatch: any) => ({
  fetchTimezones: () => dispatch(dictionaryAction(Dictionaries.TIMEZONES)),
  fetchOptimalRates: (values: ICampaign) => dispatch(optimalRatesAction(optimalRatesAdapter(values))),
});

const CampaignsDetailConnected = connect(mapStateToProps, mapDispatchToProps)(CampaignsDetailForm);

export default withBlockNavigation(CampaignsDetailConnected);
