import React, { ChangeEvent, Ref, useEffect, useRef, useState } from 'react';
import { Form, Input, Typography } from 'antd';
import i18next from 'i18next';

import memoizeOne from 'memoize-one';
import { TagsContainer, TagsItem } from './elements';
import { useTranslation } from 'react-i18next';
import { getTargetUrlMacrosValidator, websiteURLValidator, correctBracketsValidator } from '../validators';
import { useCombinedRefs } from 'utils/hooks/useCombineRefs';

import { FormInstance } from 'antd/es/form';

export const TagCollectionLabels = {
  '[clickid]': i18next.t('Unique ID used for conversion tracking'),
  '[zoneid]': i18next.t('Endpoint ID'),
  '[subid]': i18next.t('ID of the source the user came from'),
  '[country]': i18next.t('Country Code (2 letter country code like US, FR, DE, IT)'),
  '[campaignid]': i18next.t('Campaign ID in our system'),
  '[creativeid]': i18next.t('Creative ID in our system'),
  '[os]': i18next.t('Operating system name'),
  '[browser]': i18next.t('Browser name'),
  '[carrier]': i18next.t('Mobile carrier'),
  '[subscriberage]': i18next.t('How many days ago the subscription occurred'),
  '[bid]': i18next.t('Bid value'),
};
export const TagCollection = Object.keys(TagCollectionLabels);
const targetUrlMacrosValidator = getTargetUrlMacrosValidator(TagCollection);

export interface ITargetUrlInputFormItem {
  value?: string;
  onChange?: (val: string) => void;
  form: FormInstance;
}

export const TargetUrlInputFormItem = React.forwardRef(
  ({ value, onChange, form, ...rest }: ITargetUrlInputFormItem, ref: Ref<Input>) => {
    const { t } = useTranslation();
    const innerRef = useRef<Input>();
    const combinedRef = useCombinedRefs(ref, innerRef);
    const [validateMsg, setValidateMsg] = useState('');

    const onValidateEvent = () => form.validateFields(['url']);

    useEffect(() => {
      if (value) {
        targetUrlMacrosValidator(null, value)
          .then(() => setValidateMsg(''))
          .catch((errMsg: string) => setValidateMsg(errMsg));
      }
    }, [value, form]);

    const onChangeWrapper = (event: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value);
        form.setFields([{ name: 'url', value: event.target.value, errors: [] }]);
      }
    };

    const addTagToUrl = memoizeOne((strTag: any) => () => {
      if (innerRef.current) {
        const input = innerRef.current?.input;
        const selection = document.getSelection();

        if (input && onChange) {
          if (input.selectionStart || input.selectionStart === 0) {
            const startPos = input.selectionStart;
            const endPos = input.selectionEnd || startPos;

            onChange(input.value.substring(0, startPos)
              + strTag
              + input.value.substring(endPos, input.value.length),
            );

            if (selection && innerRef.current) {
              Promise.resolve().then(() => {
                const newPosition = startPos + strTag.length;
                innerRef.current?.focus();
                innerRef.current?.setSelectionRange(newPosition, newPosition);
              })
            }
          } else {
            onChange(input.value + strTag);
            innerRef.current?.focus();
          }
        }
      }
    });

    return (
      <>
        <Form.Item
          label={t('Target url')}
          validateFirst
          name="url"
          validateTrigger={['onBlur']}
          rules={[
            { required: true, message: t('Please fill the field'), whitespace: true },
            { max: 512, message: t('Target url is too long') },
            { validator: websiteURLValidator },
            { validator: correctBracketsValidator },
          ]}
        >
          <>
            <Input
              value={value}
              onChange={onChangeWrapper}
              onBlur={onValidateEvent}
              defaultValue={'http://'}
              {...rest}
              ref={combinedRef}
            />
            {validateMsg && <Typography.Text type="warning">{validateMsg}</Typography.Text>}
          </>
        </Form.Item>
        <TagsContainer>
          {TagCollection.map((strTag: string) => (
            <TagsItem key={strTag} onClick={addTagToUrl(strTag)} title={(TagCollectionLabels as any)[strTag]}>
              {strTag}
            </TagsItem>
          ))}
        </TagsContainer>
      </>
    );
  },
);
