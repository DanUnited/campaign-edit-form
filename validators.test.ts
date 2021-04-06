import { range } from 'ramda';
import { DayNames, IDayParting } from 'modules/api-requests/campaigns/entities';
import { Dictionaries } from 'models/dictionary/entities';
import { mapObject } from 'utils';
import {
  dayPartingValidator,
  escapeRegExp,
  getTargetUrlMacrosValidator,
  websiteURLValidator,
  targetingValidator,
  correctBracketsValidator,
  getDailyBudgetValidator,
  creativeTabValidator,
} from './validators';
import { initialState, targetingInitialStateType } from './TargetingTabs/targetingContext/store';

// should be inline functions
jest.mock('i18next', () => require('utils/test').i18nextMock());

describe('test campaign validators', () => {
  describe('dayPartingValidator', () => {
    const emptyDayParting = mapObject(DayNames, () => []) as any as IDayParting;
    const fillDayParting = mapObject(DayNames, () => range(0, 24)) as any as IDayParting;
    it('should resolve for empty table', async () => {
      expect.assertions(1);
      await expect(dayPartingValidator(null, emptyDayParting)).rejects.not.toBeUndefined();
    });
    it('should resolve for filled table', async () => {
      expect.assertions(1);
      await expect(dayPartingValidator(null, fillDayParting)).resolves.toBeUndefined();
    });
  });

  describe('targetingValidator', () => {
    const incorrect: targetingInitialStateType = {
      [Dictionaries.COUNTRY]: {
        ...initialState[Dictionaries.COUNTRY],
        allCount: 100,
      },
      [Dictionaries.LANGUAGE]: {
        ...initialState[Dictionaries.LANGUAGE],
        allCount: 100,
      },
      [Dictionaries.OS]: {
        ...initialState[Dictionaries.OS],
        allCount: 100,
        valueLen: 0,
      }
    }

    const correct: targetingInitialStateType = {
      [Dictionaries.COUNTRY]: {
        ...initialState[Dictionaries.COUNTRY],
        allCount: 100,
      },
      [Dictionaries.LANGUAGE]: {
        ...initialState[Dictionaries.LANGUAGE],
        allCount: 100,
      },
    }

    it('should reject for at least one false value', async () => {
      expect.assertions(1);
      await expect(targetingValidator(null, incorrect as any)).rejects.toContain(`Fill the following values: ${Dictionaries.OS}`);
    });

    it('should resolve for true values', async () => {
      expect.assertions(1);
      await expect(targetingValidator(null, correct as any)).resolves.toBeUndefined();
    });
  });

  it('escapeRegExp', () => {
    expect(escapeRegExp('.*+?$^{}()|[some text].*+\\')).toBe('some text');
  });

  describe('getTargetUrlMacrosValidator', () => {
    const validator = getTargetUrlMacrosValidator(['[url]']);

    it('should reject for invalid token', async () => {
      expect.assertions(1);
      await expect(validator(null, '[url][some][some2]')).rejects.toContain('[some], [some2]');
    });

    it('should reject for incorrect url', async () => {
      expect.assertions(1);
      await expect(websiteURLValidator(null, 'https://some text')).rejects.toEqual('Incorrect target url.');
    });

    it('should reject for invalid characters', async () => {
      expect.assertions(1);
      await expect(websiteURLValidator(null, 'https://кф-2.ru?param=кв')).rejects.toContain('Special characters');
    });

    it('should resolve for correct url', async () => {
      expect.assertions(1);
      await expect(validator(null, 'https://кф-2.ru?param=ru')).resolves.toBeUndefined();
    });

    it('should resolve for url and params with dash', async () => {
      expect.assertions(1);
      await expect(websiteURLValidator(null, 'http://pepe-dance.com?q=[zoneid]&g=-5[country]')).resolves.toBeUndefined();
    });

    it('should reject for incorrect brackets in url', async () => {
      expect.assertions(1);
      await expect(correctBracketsValidator(null, 'http://pepedance.com?q=[zoneid]]'))
      .rejects
      .toEqual('The number of opening and closing brackets does\'t match');
    });
  });

  describe('getDailyBudgetValidator', () => {
    const validator = getDailyBudgetValidator(50);

    test('should reject when value is greater then maximum', async () => {
      expect.assertions(1);
      await expect(validator(null, '120')).rejects.toContain('total budget');
    });
    test('should resolve when value is empty', async () => {
      expect.assertions(1);
      await expect(validator(null, '')).resolves.toBeUndefined();
    });
    test('should resolve when maximum is empty', async () => {
      expect.assertions(1);
      await expect(getDailyBudgetValidator(undefined)(null, '20')).resolves.toBeUndefined();
    });
  });

  describe('creativeTabValidator', () => {
    it('should resolve for filled creative', async () => {
      expect.assertions(1);
      await expect(creativeTabValidator(null, { title: 'some', icon: '188some3' } as any)).resolves.toBeUndefined();
    });

    it('should reject if title unfilled', async () => {
      expect.assertions(1);
      await expect(creativeTabValidator(null, { icon: '188some3' } as any)).rejects.toBe('');
    });

    it('should reject if icon unfilled', async () => {
      expect.assertions(1);
      await expect(creativeTabValidator(null, { title: 'some' } as any)).rejects.toBe('');
    });
  });
});
