import { Dictionaries } from 'models/dictionary/entities';
import { ConnectionTypes } from 'modules/api-requests/dictionary/entities';

export const COUNTRY_IDS_CHANGE = 'COUNTRY_IDS_CHANGE';
export const TARGETING_CHANGE = 'TARGETING_CHANGE';
export const CONNECTION_CHANGE = 'CONNECTION_CHANGE';
export const DATA_LEN_CHANGE = 'CONNECTION_CHANGE';

const getTagFromConnectionType = (type: ConnectionTypes) => {
  switch (type) {
    case ConnectionTypes.ONLY_WI_FI_OR_WIRED:
      return 'Wi-Fi/Wired';
    case ConnectionTypes.ONLY_MOBILE:
      return 'Mobile';
    default:
      return 'None';
  }
}

export const targetingReducer = (state: any, action: any) => {

  switch (action.type) {
    case COUNTRY_IDS_CHANGE:
      return {count: state.count + 1};
    case TARGETING_CHANGE:
      const { name, value } = action.payload;
      return {
        ...state,
        [name]: {
          ...(state as any)[name],
          valueLen: value && value.length,
        }
      };
    case CONNECTION_CHANGE:
      return {
        ...state,
        [Dictionaries.CARRIER]: {
          ...state[Dictionaries.CARRIER],
          defaultTag: getTagFromConnectionType(action.payload),
        }
      };
    case DATA_LEN_CHANGE:
      const newItems: any = {};
      Object.keys(state).forEach((key) => {
        newItems[key] = {
          ...state[key],
          allCount: action.payload[key],
        }
      });
      return newItems;
    default:
      throw new Error('There is no such action');
  }
}
