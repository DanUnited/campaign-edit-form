import { equals } from 'ramda';

import { useTargetingContext } from './targetingContext';
import { useCallback } from 'react';
import usePrevious from 'utils/hooks/usePrevious';

import { targetingInitialStateType } from './store';
export type menuCollectionType = Record<keyof targetingInitialStateType, boolean>

export const getMenuCollection = (menuItems: targetingInitialStateType): menuCollectionType => {
  const menuCollection: menuCollectionType = {};

  Object.keys(menuItems).forEach((key) => {
    const menuItem = (menuItems)[key];
    menuCollection[key] = (menuItem.valueLen !== 0 || menuItem.allCount === 0) && !Boolean(menuItem.customValidationError);
  });

  return menuCollection;
};

export const useTargetingValidationStatus = () => {
  const { menuCollection, menuItems } = useTargetingContext();
  const prevMenuItems = usePrevious(menuItems, menuItems);

  return useCallback((name: string, isWarning?: boolean) => {
      const actualVal = menuItems[name]?.valueLen;
      const prevVal = prevMenuItems[name]?.valueLen;
      if (!equals(actualVal, prevVal)) {
        if (actualVal === 0 && !prevVal) {
          return 'success';
        }
      }

      return !menuCollection[name]
        ? isWarning ? 'warning' : 'error'
        : 'success';
    }, [menuCollection, prevMenuItems, menuItems],
  );
};
