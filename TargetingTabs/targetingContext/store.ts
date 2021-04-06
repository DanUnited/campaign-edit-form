import i18n from 'i18next';
import { equals } from 'ramda';

import { Dictionaries } from 'models/dictionary/entities';
import { ConnectionTypes } from 'modules/api-requests/dictionary/entities';
import { ValueOf } from 'containers/routing/utils';

export enum ActionTypes {
  DICTIONARY_LEN_CHANGE,
  VALUE_LEN_CHANGE,
  CONNECTION_CHANGE,
  AGE_CHANGE,
  SOURCE_CHANGE,
  ZONE_CHANGE,
  TRAFFIC_TYPE_CHANGE,
  SET_VALIDATION_MESSAGE,
}

export type targetingMenuItemValueType = {
  title: string,
  defaultTag: 'All' | 'None' | 'Wi-Fi/Wired' | 'Mobile',
  customValidationError?: string,
  allCount: number,
  valueLen: boolean | number,
  hint?: string;
  sortBy: number;
};

export type targetingInitialStateType = Record<ValueOf<typeof Dictionaries> | string, targetingMenuItemValueType>;

export const initialState: targetingInitialStateType = {
  [Dictionaries.COUNTRY]: {
    title: i18n.t('Countries'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 1,
  },
  [Dictionaries.CARRIER]: {
    title: i18n.t('Carriers'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 2,
  },
  [Dictionaries.DEVICE]: {
    title: i18n.t('Device types'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 3,
  },
  [Dictionaries.OS]: {
    title: i18n.t('Operating systems'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 4,
  },
  [Dictionaries.BROWSER]: {
    title: i18n.t('Browsers'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 5,
  },
  [Dictionaries.LANGUAGE]: {
    title: i18n.t('Browser languages'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 6,
  },
  age: {
    title: i18n.t('Subscribers Age'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    hint: i18n.t('Number of subscription days'),
    sortBy: 7,
  },
  trafficType: {
    title: i18n.t('Traffic Type'),
    defaultTag: 'All',
    allCount: 0,
    valueLen: false,
    sortBy: 8,
  },
  zone: {
    title: i18n.t('ZoneIds'),
    defaultTag: 'None',
    allCount: 0,
    valueLen: false,
    sortBy: 9,
  },
  source: {
    title: i18n.t('SubIds'),
    defaultTag: 'None',
    allCount: 0,
    valueLen: false,
    hint: i18n.t('Endpoint ID'),
    sortBy: 10,
  },
};

const getTagFromConnectionType = (type: ConnectionTypes) => {
  switch (type) {
    case ConnectionTypes.ONLY_WI_FI_OR_WIRED:
      return 'Wi-Fi/Wired';
    case ConnectionTypes.ONLY_MOBILE:
      return 'Mobile';
    default:
      return 'All';
  }
};

export const reducer = (state: targetingInitialStateType, action: any): targetingInitialStateType => {
  switch (action.type) {
    case ActionTypes.DICTIONARY_LEN_CHANGE:
      if (state[action.dictionary].allCount === action.value) {
        return state;
      }
      return { ...state, [action.dictionary]: { ...state[action.dictionary], allCount: action.value } };
    case ActionTypes.SET_VALIDATION_MESSAGE:
      if (state[action.dictionary].customValidationError === action.value) {
        return state;
      }
      return { ...state, [action.dictionary]: { ...state[action.dictionary], customValidationError: action.value } };
    case ActionTypes.VALUE_LEN_CHANGE:
      if (state[action.dictionary].valueLen === action.value) {
        return state;
      }
      return { ...state, [action.dictionary]: { ...state[action.dictionary], valueLen: action.value } };
    case ActionTypes.CONNECTION_CHANGE:
      const defaultTag = getTagFromConnectionType(action.value);
      if (state[Dictionaries.CARRIER].defaultTag === defaultTag) {
        return state;
      }

      return {
        ...state,
        [Dictionaries.CARRIER]: {
          ...state[Dictionaries.CARRIER],
          valueLen: equals(action.value, ConnectionTypes.ALL)
            ? false
            : state[Dictionaries.CARRIER].valueLen,
          defaultTag,
        },
      };
    case ActionTypes.AGE_CHANGE: {
      return {
        ...state, age: {
          ...state.age,
          defaultTag: action.value,
        },
      };
    }
    case ActionTypes.SOURCE_CHANGE: {
      return {
        ...state, source: {
          ...state.source,
          defaultTag: action.value,
        },
      };
    }
    case ActionTypes.ZONE_CHANGE: {
      return {
        ...state, zone: {
          ...state.zone,
          defaultTag: action.value,
        },
      };
    }
    case ActionTypes.TRAFFIC_TYPE_CHANGE: {
      return {
        ...state,
        trafficType: {
          ...state.trafficType,
          defaultTag: action.value,
        },
      };
    }
    default:
      return state;
  }
};

export const dictionaryLenChange = (dictionaryName: Dictionaries, length: number) => ({
  type: ActionTypes.DICTIONARY_LEN_CHANGE,
  dictionary: dictionaryName,
  value: length,
});

export const targetingValueChange = (dictionaryName: Dictionaries, value: any) => ({
  type: ActionTypes.VALUE_LEN_CHANGE,
  dictionary: dictionaryName,
  value: Boolean(value) && value.length,
});

export const setValidationError = (dictionaryName: Dictionaries, value?: string) => ({
  type: ActionTypes.SET_VALIDATION_MESSAGE,
  dictionary: dictionaryName,
  value,
});

export const connectionChange = (value: ConnectionTypes) => ({
  type: ActionTypes.CONNECTION_CHANGE,
  value,
});

export const ageChange = (value: string) => ({
  type: ActionTypes.AGE_CHANGE,
  value,
});

export const sourceChangeAction = (value: string) => ({
  type: ActionTypes.SOURCE_CHANGE,
  value,
});

export const zoneChangeAction = (value: string) => ({
  type: ActionTypes.ZONE_CHANGE,
  value,
});

export const trafficTypeChangeAction = (value: string) => ({
  type: ActionTypes.TRAFFIC_TYPE_CHANGE,
  value,
});