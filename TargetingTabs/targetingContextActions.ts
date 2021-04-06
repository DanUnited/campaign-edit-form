import { Dictionaries } from 'models/dictionary/entities';
import { ConnectionTypes } from 'modules/api-requests/dictionary/entities';
import { CONNECTION_CHANGE, DATA_LEN_CHANGE, TARGETING_CHANGE } from './targetingContextReducers';

export const onDataLenChange = (dispatch: any, dataLength: {[name: string]: number}) =>
  dispatch({ type: DATA_LEN_CHANGE, payload: dataLength });

export const onTargetingChange = (dispatch: any, name: Dictionaries, value?: string[] | null) =>
  dispatch({ type: CONNECTION_CHANGE, payload: { name, value } });

export const onConnectionTypeChange = (dispatch: any, value: ConnectionTypes) =>
  dispatch({ type: TARGETING_CHANGE, payload: value });
