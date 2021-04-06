import React from 'react';
import { Menu, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { Dictionaries } from 'models/dictionary/entities';
import { TabTag, TabTitle } from './elements';
import { useTargetingContext } from './targetingContext/targetingContext';
import { MenuInfo } from 'rc-menu/es/interface';
import { targetingMenuItemValueType } from './targetingContext/store';

export interface ITargetingMenuItem {
  title: string;
  defaultTag: string;
  valueLen?: number | null;
  allCount: number;
  hint?: string;
}

interface IProps {
  tab: Dictionaries;
  setTab: (tab: Dictionaries) => void;
}

function comparer<T extends [string, targetingMenuItemValueType]>(a: T, b: T): number {
  return a[1].sortBy - b[1].sortBy;
}

export const TargetingMenu = ({ tab, setTab }: IProps) => {
  const { t } = useTranslation();
  const { menuItems } = useTargetingContext();
  const onClick = (e: MenuInfo) => setTab(e.key as Dictionaries);

  return (
    <Menu className="vertical-menu" selectedKeys={[tab]} onClick={onClick}>
      {Object.entries(menuItems).sort(comparer).map(([key]) => {
        const { title, defaultTag, valueLen, allCount, hint } = menuItems[key as Dictionaries] as ITargetingMenuItem;
        const currentTag = (!valueLen && valueLen !== 0) || valueLen === allCount ? t(defaultTag) : valueLen;

        return (
          <Menu.Item key={key}>
            <TabTitle>
              <Tooltip title={hint} placement={'right'}>{t(title)}</Tooltip>
              <TabTag>{currentTag}</TabTag>
            </TabTitle>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};
