import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Tabs } from 'antd';

import { tabBarExtraScrollContent } from 'components/common/tabs-scrollers';
import { ScrollingTabs } from 'components/common/tabs-scrollers/elements';
import { CreativeTabTitle } from 'components/common/creative-tab-title';
import { CreativeInternalForm } from './creativeInternalForm';

import { StoreValue } from 'rc-field-form/lib/interface';
import { ImageType, IUploadRequest, IUploadResponse } from 'modules/api-requests/resource/entities';
import { FormInstance } from 'antd/es/form';
import { creativeTabValidator } from '../validators';
import { CreativeFormTabItem, PlusIcon, CreativeTabsWrapper } from './elements';
import useShowScroll from 'utils/hooks/useShowScroll';

const { TabPane } = Tabs;

interface IProps {
  uploadRequest?: (data: IUploadRequest, type: ImageType) => Promise<IUploadResponse>;
  getResourceRequest: (imgId: string) => Promise<any>;
  form: FormInstance;
  canSwitchCreativeType: boolean;
}

interface FieldData {
  name: number;
  key: number;
  fieldKey: number;
}

type AddOperation = (defaultValue?: StoreValue) => void;
type RemoveOperation = (index: number) => void;
type MoveOperation = (from: number, to: number) => void;

interface Operation {
  add: AddOperation;
  remove: RemoveOperation;
  move: MoveOperation;
}

export const cropNumber = (value: number, min: number, max?: number) =>
  Math.max(max ? Math.min(value, max) : value, min);

export const calcNewActiveIndex = (activeKey: number, targetKey: number, maxKey: number): number =>
  cropNumber(activeKey - Number(activeKey >= targetKey), 0, maxKey);

export const CreativeTabsForm = ({ uploadRequest, getResourceRequest, form, canSwitchCreativeType }: IProps) => {
  const wrapperRef = useRef<HTMLDivElement>();
  const [showScroll] = useShowScroll(wrapperRef);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const add = useCallback(
    (fields: FieldData[], addCb: AddOperation) => {
      setActiveIndex(fields.length);
      addCb({
        id: null,
        title: '',
        description: '',
        icon: null,
        image: null,
        canSave: false,
      });
    },
    [setActiveIndex],
  );

  const remove = useCallback(
    (targetKey: number, fields: FieldData[], removeCb: RemoveOperation) => {
      const targetIndex = fields.findIndex(({ fieldKey }) => String(fieldKey) === String(targetKey));

      removeCb(targetIndex);

      Promise.resolve().then(() => {
        setActiveIndex(calcNewActiveIndex(activeIndex, targetIndex, fields.length - 2));
      });
    },
    [setActiveIndex, activeIndex],
  );

  const onEdit = useCallback(
    (fields: FieldData[], operation: Operation) => (targetKey: any, action: 'add' | 'remove') => {
      action === 'add' ? add(fields, operation.add) : remove(targetKey, fields, operation.remove);
    },
    [add, remove],
  );

  const copy = useCallback(
    (targetKey: number, fields: FieldData[], addCb: AddOperation) => {
      const targetIndex = fields.findIndex(({ fieldKey }) => String(fieldKey) === String(targetKey));
      const creative = form.getFieldValue('creatives')[targetIndex];

      addCb({
        id: null,
        title: creative.title,
        description: creative.description,
        icon: creative.icon,
        image: creative.image,
        canSave: false,
      });
      Promise.resolve().then(() => setActiveIndex(fields.length));
    },
    [form, setActiveIndex],
  );

  const getOnChange = (fields: FieldData[]) => (targetKey: FieldData['fieldKey']) => {
    const newIndex = fields.findIndex(({ fieldKey }: FieldData) => String(fieldKey) === String(targetKey));
    setActiveIndex(newIndex || 0);
  };

  useEffect(() => {
    const listener = (customEvent: any) => {
      Promise.resolve().then(() => {
        setActiveIndex(customEvent.detail.tabIndex);
      });
    };
    document.addEventListener('changedCreativeTabIndex', listener, true);
    return () => document.removeEventListener('changedCreativeTabIndex', listener, true);
  }, [setActiveIndex]);

  return (
    <Form.List name="creatives">
      {(fields, operation) => {
        const isLimitReached = fields.length >= 10;
        const activeKey = (fields[activeIndex] ? fields[activeIndex] : fields[0]).fieldKey;

        return (
          <CreativeTabsWrapper ref={wrapperRef as any}>
            <ScrollingTabs
              hideAdd={isLimitReached}
              type="editable-card"
              show={+showScroll}
              onEdit={onEdit(fields, operation)}
              onChange={getOnChange(fields)}
              activeKey={String(activeKey)}
              tabBarExtraContent={tabBarExtraScrollContent(wrapperRef)}
              addIcon={<PlusIcon />}
            >
              {fields.map((field, index) => {
                const onCopy = isLimitReached ? undefined : () => copy(field.fieldKey, fields, operation.add);
                const onDelete = fields.length < 2 ? undefined : () => remove(field.fieldKey, fields, operation.remove);

                return (
                  <TabPane
                    tab={
                      <CreativeFormTabItem {...field} rules={[{ validator: creativeTabValidator }]}>
                        <CreativeTabTitle onCopy={onCopy} onDelete={onDelete} />
                      </CreativeFormTabItem>
                    }
                    closable={false}
                    key={String(field.fieldKey)}
                  >
                    <Form.Item {...field} noStyle>
                      <CreativeInternalForm
                        form={form}
                        creativeIndex={index}
                        uploadRequest={uploadRequest}
                        getResourceRequest={getResourceRequest}
                        canSwitchCreativeType={canSwitchCreativeType}
                      />
                    </Form.Item>
                  </TabPane>
                );
              })}
            </ScrollingTabs>
          </CreativeTabsWrapper>
        );
      }}
    </Form.List>
  );
};
