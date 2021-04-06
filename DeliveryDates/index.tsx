import React, { useCallback, useEffect, useState } from 'react';
import { Form, Checkbox, Row, Col, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { FormInstance } from 'antd/es/form/Form';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import moment from 'moment';

import { DateFormat } from 'components/common/entities';
import { DeliveryDatesNote } from './elements';
import { TooltipTitle } from '../elements';

interface IProps {
  form: FormInstance;
}

type DateStateType = moment.Moment | null;

export const DeliveryDates = ({ form }: IProps) => {
  const { t } = useTranslation();
  const [formStartDate, setFormStartDate] = useState<DateStateType>(form.getFieldValue('startDate'));
  const [formEndDate, setFormEndDate] = useState<DateStateType>(form.getFieldValue('endDate'));
  const [deliveryDatesVisible, setDeliveryDatesVisible] = useState<boolean>(false);

  const onDeliveryDatesVisibleChecked = useCallback(
    (e: CheckboxChangeEvent) => {
      setDeliveryDatesVisible(e.target.checked);
      if (!e.target.checked) {
        form.setFieldsValue({ startDate: null, endDate: null });
      }
    },
    [form],
  );

  const disabledStartDate = useCallback(
    (startValue: DateStateType): boolean => {
      if (!startValue || !formEndDate) {
        return false;
      }
      return startValue.valueOf() > formEndDate.valueOf();
    },
    [formEndDate],
  );

  const disabledEndDate = useCallback(
    (endValue: DateStateType) => {
      if (!endValue || !formStartDate) {
        return false;
      }
      return endValue.valueOf() <= formStartDate.valueOf();
    },
    [formStartDate],
  );

  const onChangeStartDate = useCallback(
    (previousDate: DateStateType, date: string) => {
      const startDate = Boolean(date) ? moment.utc(date) : null;
      form.setFieldsValue({ startDate });
      setFormStartDate(startDate);
    },
    [form],
  );

  const onChangeEndDate = useCallback(
    (previousDate: DateStateType, date: string) => {
      const endDate = Boolean(date) ? moment.utc(date) : null;
      form.setFieldsValue({ endDate });
      setFormEndDate(endDate);
    },
    [form],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // values from form come later, need to sync
    if (formStartDate !== form.getFieldValue('startDate')) {
      setFormStartDate(form.getFieldValue('startDate'));
    }

    if (formEndDate !== form.getFieldValue('endDate')) {
      setFormEndDate(form.getFieldValue('endDate'));
    }
  });

  useEffect(() => {
    if (formStartDate || formEndDate) {
      setDeliveryDatesVisible(true);
    }
  }, [formStartDate, formEndDate]);

  return (
    <>
      <Checkbox
        style={{ marginBottom: '14px' }}
        checked={deliveryDatesVisible}
        onChange={onDeliveryDatesVisibleChecked}
      >
        <TooltipTitle
          title={t('Set campaign running period (by UTC)')}
          hint={t('Set the Start Date or End Date, if you want to specify a campaign running period.')}
        />
      </Checkbox>
      <Row gutter={16}>
        <Col xs={24}>
          <DeliveryDatesNote>
            {t(
              'Note: you can specify one date or both. The empty Start Date means - campaign starts immediately, the empty End Date - campaign ends only when you stop it.',
            )}
          </DeliveryDatesNote>
        </Col>

        <Col xs={24} sm={12} md={10} lg={7} xl={6} style={{ display: deliveryDatesVisible ? 'flex' : 'none' }}>
          <Form.Item label={t('Start date')} name="startDate">
            <DatePicker
              disabledDate={disabledStartDate}
              format={DateFormat}
              placeholder="Start"
              suffixIcon={<i className="far fa-calendar sm" />}
              onChange={onChangeStartDate}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={10} lg={7} xl={6} style={{ display: deliveryDatesVisible ? 'flex' : 'none' }}>
          <Form.Item label={t('End date')} name="endDate">
            <DatePicker
              disabledDate={disabledEndDate}
              format={DateFormat}
              placeholder="End"
              suffixIcon={<i className="far fa-calendar sm" />}
              onChange={onChangeEndDate}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
