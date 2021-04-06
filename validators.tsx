import i18n from 'i18next';
import { parse, parseUrl } from 'query-string';
import { DayNames, ICreative, IDayParting, ICampaignRuleEntity } from 'modules/api-requests/campaigns/entities';
import { Dictionaries } from 'models/dictionary/entities';
import { equals, isEmpty, values } from 'ramda';
import { isNotEmpty } from 'utils/ramda';
import { getMenuCollection } from './TargetingTabs/targetingContext/utils';

export const dayPartingValidator = (rule: any, value: IDayParting) => {
  const _isEmpty = Object.keys(value || {}).every((key) => value[key as DayNames].length === 0);
  return _isEmpty ? Promise.reject(i18n.t('Fill at least one hour')) : Promise.resolve();
};

export const targetingValidator = (rule: any, value: any) => {
  const menuCollection = value ? getMenuCollection(value) : {};
  const errorCollection = [];

  const incorrectTabs = Object.keys(menuCollection || {})
    .filter((key) => !menuCollection[key as Dictionaries] && !Boolean(value[key]?.customValidationError))
    .map((key) => i18n.t(key));

  Object.keys(menuCollection || {})
    .filter((key) => Boolean(value[key]?.customValidationError))
    .forEach((key) => {
      errorCollection.push(value[key]?.customValidationError);
    });

  if (incorrectTabs.length) {
    errorCollection.push(i18n.t(`Fill the following values: `) + incorrectTabs.join(', '));
  }

  return errorCollection.length ? Promise.reject(errorCollection) : Promise.resolve();
};

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '');
};

const urlPattern = /^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export const websiteURLValidator = (rule: any, value: string) => {
  if (!urlPattern.test(value)) {
    return Promise.reject(i18n.t('Incorrect target url.'));
  }
  const paramValues = Object.values(parse(escapeRegExp(value))) as string[];
  const correctParamReg = /^[A-Za-z0-9/\\_-]*/gi;
  const correctParamValuesReg = /[^A-Za-z0-9_-]+/gi;
  const alphaParamValuesReg = /^[^A-Za-z]+/gi;
  const { query } = parseUrl(value);

  if (isNotEmpty(query)) {
    const paramKeys = Object.keys(query);
    if (paramKeys.filter((param: string) => alphaParamValuesReg.test(param)).length > 0) {
      return Promise.reject(i18n.t('The first character of the parameter name must be a letter.'));
    }
    if (paramKeys.findIndex(isEmpty) >= 0) {
      return Promise.reject(i18n.t(`Empty parameter names aren't allowed.`));
    }
    if (paramKeys.filter((param: string) => correctParamValuesReg.test(param)).length > 0) {
      return Promise.reject(i18n.t('Parameter names allow only latin alphabet and numbers.'));
    }
  }

  let isValidParams = true;
  if (paramValues.length) {
    paramValues.forEach((param) => {
      if (param) {
        const matchedValue = param.match(correctParamReg);
        if (!equals(param, matchedValue && matchedValue[0])) {
          isValidParams = false;
        }
      }
    });
  }

  return !isValidParams
    ? Promise.reject(i18n.t('Special characters are not supported in the url parameters.'))
    : Promise.resolve();
};

export const correctBracketsValidator = (rule: any, value: string) => {
  const opening = {
    '[': ']',
    '{': '}',
    '(': ')',
    '<': '>',
  };

  let open = 0;
  let close = 0;
  let isCorrect = true;

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < (value ?? '').length; i++) {
    const c = value[i];
    if ((opening as any)[c]) {
      open++;
    } else {
      if (values(opening).includes(c)) {
        close++;
      }
    }

    if (open < close) {
      isCorrect = false;
    }
  }

  if (open !== close) {
    isCorrect = false;
  }

  return !isCorrect
    ? Promise.reject(i18n.t(`The number of opening and closing brackets does't match`))
    : Promise.resolve();
};

export const getTargetUrlMacrosValidator = (availableTags: string[]) => (rule: any, value: string) => {
  const tags = value.match(/(\[[^[\]]*])/g);
  const notAvailableTags = (tags || []).filter((tag) => !availableTags.includes(tag));

  if (notAvailableTags.length) {
    return Promise.reject(
      i18n.t('There is an invalid token in your url, {{tags}}. Check our list below.', {
        tags: notAvailableTags.join(', '),
        count: notAvailableTags.length,
      }),
    );
  }

  return Promise.resolve();
};

export const zoneIdsValidator = (rule: any, value: string[]) => {
  if (value && Object.values(value).find((item: string) => /([^\n0-9])+/.test(item))) {
    return Promise.reject(i18n.t('ZoneIds: Only positive numeric values are allowed'));
  }

  if (value && value.length && Object.values(value).find((item) => Number(item) < 1)) {
    return Promise.reject(i18n.t('One or more ZoneId items contain zero value'));
  }

  if (value && value.length && Object.values(value).find((item) => Number(item) > 2147483647)) {
    return Promise.reject(i18n.t('ZoneIds contain one or more too big number values'));
  }

  return Promise.resolve();
};

export const getDailyBudgetValidator = (max?: number) => (rule: any, value: string) => {
  const valueNumber = parseFloat(value);
  if (!isNaN(valueNumber) && max && valueNumber > max) {
    return Promise.reject(i18n.t('Please enter a value less than or equal to total budget'));
  }
  return Promise.resolve();
};

export const creativeTabValidator = (rule: any, value: ICreative) => {
  const rejectCondition =
    !value?.title || !value?.icon ||
    value.title.length > 128 || value?.description?.length > 256;
  return rejectCondition ? Promise.reject('') : Promise.resolve();
};

export const optimizationRuleValidator = (rule: any, value: ICampaignRuleEntity[]) => {
  return Array.isArray(value) && value.some(({ isEdit }) => isEdit) ? Promise.reject('') : Promise.resolve();
};
