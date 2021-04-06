import React, { useEffect, useState, useContext, useReducer, createContext, ReactNode, useMemo } from 'react';
import { connect } from 'react-redux';
import { equals } from 'ramda';

import { getDictionaryDataSelector } from 'models/dictionary/selectors';
import { dictionaryAction } from 'models/dictionary/actions';
import { dictionaryLenChange, initialState, reducer, targetingInitialStateType } from './store';
import { Dictionaries } from 'models/dictionary/entities';

import { IStore } from 'modules/store/types';
import { CarrierDictionary, Dictionary } from 'modules/api-requests/dictionary/entities';
import { getMenuCollection, menuCollectionType } from './utils';

export interface ITargetingContext {
  menuItems: targetingInitialStateType;
  dispatch: (action: any) => void;
  countryIds?: string[] | null | undefined;
  setCountryIds: (value: string[] | null | undefined) => void;
  menuCollection: menuCollectionType;
}

const TargetingContext = createContext<ITargetingContext | null>(null);
export const useTargetingContext = (): ITargetingContext => {
  const context = useContext(TargetingContext);
  if (!context) {
    throw new Error('Missing TargetingContextProvider in its parent.');
  }
  return context;
};

interface ITargetingContextProviderCompProps {
  fetchStaticDictionaries: () => void;
  dataLength: {[name: string]: number};
  children?: ReactNode;
  onChange?: (_: menuCollectionType) => void;
  value?: menuCollectionType;
}

const TargetingContextProviderComp = ({
  dataLength,
  fetchStaticDictionaries,
  children,
  onChange = () => void 0,
  value,
}: ITargetingContextProviderCompProps) => {
  const [menuItems, dispatch] = useReducer(reducer, initialState);
  const [countryIds, setCountryIds] = useState<string[] | undefined | null>(undefined);

  useEffect(() => {
    Object.keys(dataLength).forEach((key) => {
      dispatch(dictionaryLenChange(key as any, dataLength[key]));
    });
  }, [dataLength]);

  // prepare value for validation
  const dependencies = useMemo(() =>
      Object.keys(menuItems).map((key) => (menuItems as any)[key].valueLen),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(menuItems)],
  );

  const menuCollection = useMemo(() => getMenuCollection(menuItems), [menuItems])

  useEffect(() => {
    if (!equals(menuCollection, value)) {
      onChange(menuCollection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies.toString()]);

  const context = {
    menuItems,
    dispatch,
    countryIds,
    setCountryIds,
    menuCollection,
  };

  useEffect(() => {
    fetchStaticDictionaries();
  }, [fetchStaticDictionaries]);

  return <TargetingContext.Provider value={context}>{children}</TargetingContext.Provider>;
};

const getDataLen = (data: Dictionary) => (data || []).length;
const getCarriersDataLen = (data: CarrierDictionary) => (data || []).reduce(
  (result, next) => result + next.carriers.length, 0,
);
export const mapStateToProps = (state: IStore) => ({
  dataLength: {
    [Dictionaries.COUNTRY]: getDataLen(getDictionaryDataSelector(Dictionaries.COUNTRY)(state) as Dictionary),
    [Dictionaries.CARRIER]: getCarriersDataLen(
      getDictionaryDataSelector(Dictionaries.CARRIER)(state) as CarrierDictionary,
    ),
    [Dictionaries.DEVICE]: getDataLen(getDictionaryDataSelector(Dictionaries.DEVICE)(state) as Dictionary),
    [Dictionaries.OS]: getDataLen(getDictionaryDataSelector(Dictionaries.OS)(state) as Dictionary),
    [Dictionaries.BROWSER]: getDataLen(getDictionaryDataSelector(Dictionaries.BROWSER)(state) as Dictionary),
    [Dictionaries.LANGUAGE]: getDataLen(getDictionaryDataSelector(Dictionaries.LANGUAGE)(state) as Dictionary),
  },
});

export const mapDispatchToProps = (dispatch: any) => ({
  fetchStaticDictionaries: () => {
    dispatch(dictionaryAction(Dictionaries.CONTINENT));
    dispatch(dictionaryAction(Dictionaries.COUNTRY));
    dispatch(dictionaryAction(Dictionaries.DEVICE));
    dispatch(dictionaryAction(Dictionaries.OS));
    dispatch(dictionaryAction(Dictionaries.BROWSER));
    dispatch(dictionaryAction(Dictionaries.LANGUAGE));
  },
});

export const TargetingContextProvider = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TargetingContextProviderComp);
