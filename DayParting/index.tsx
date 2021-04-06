import React, { Ref, useCallback, useEffect, useState } from 'react';
import { equals } from 'ramda';
import { useTranslation } from 'react-i18next';
import { Switch } from 'antd';

import { DayNames, IDayParting } from 'modules/api-requests/campaigns/entities';
import { dayPartingInitState } from 'models/campaigns/redux/reducers';

import { DayPartingNote, DayPartingSwitcher, IndentBlock, QuickLink, QuickLinkContainer } from './elements';
import { DayPartingTable } from './Table/DayPartingTable';
import { hoursColumnMap } from './Table/entities';
import { TooltipTitle } from '../elements';

export interface IDayPartingProps {
  onChange?: (data: IDayParting) => void;
  value?: IDayParting;
  readonly?: boolean;
}

const daysMap = Object.values(DayNames);
export const convertDayPartingToCheckboxArray = (value: IDayParting): number[][] =>
  daysMap.map((dayName) => value[dayName].slice());

export const convertCheckboxArrayToDayParting = (value: number[][]): IDayParting => {
  const output: any = {};
  value.forEach((hours, index) => (output[daysMap[index]] = hours.slice()));
  return output;
};
export const isAnyTimeChecked = (checkboxes: number[][]) =>
  daysMap.every((day: DayNames, index: number) => equals(dayPartingInitState[day], checkboxes[index]));

export const hourCheckboxesInitialState: number[][] = convertDayPartingToCheckboxArray(dayPartingInitState);

export const DayParting: React.FC<IDayPartingProps> = React.forwardRef(
  ({ onChange = () => void 0, value, readonly, ...rest }: IDayPartingProps, ref: Ref<any>) => {
    const { t } = useTranslation();
    const [showDayParting, setShowDayParting] = useState(false);
    const [hourCheckboxes, setHourCheckboxes] = useState(hourCheckboxesInitialState);
    const updateValue = useCallback(
      (newValue) => {
        setHourCheckboxes(newValue);
        onChange(convertCheckboxArrayToDayParting(newValue));
      },
      [setHourCheckboxes, onChange],
    );

    useEffect(() => {
      const checkboxes = value ? convertDayPartingToCheckboxArray(value) : hourCheckboxesInitialState;
      if (!equals(checkboxes, hourCheckboxes)) {
        setHourCheckboxes(checkboxes);
      }
      if (!value) {
        updateValue(hourCheckboxesInitialState);
      }
      setShowDayParting(!isAnyTimeChecked(checkboxes));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const selectAll = () => {
      updateValue(hourCheckboxes.map(() => hoursColumnMap));
    };
    const selectWorkingDays = () => {
      updateValue(hourCheckboxes.map((_, index) => (index < 5 ? hoursColumnMap : [])));
    };
    const selectWorkingHours = () => {
      updateValue(hourCheckboxes.map((_, index) => (index < 5 ? hoursColumnMap.slice(8, 18) : [])));
    };
    const selectWeekend = () => {
      updateValue(hourCheckboxes.map((_, index) => (index > 4 ? hoursColumnMap : [])));
    };
    const clearAll = () => {
      updateValue(hourCheckboxes.map(() => []));
    };

    const isChecked = useCallback((dayIndex: number, hour: number) => hourCheckboxes[dayIndex].includes(hour), [
      hourCheckboxes,
    ]);

    const onHourClick = useCallback(
      (dayIndex, hour) => {
        let values = hourCheckboxes[dayIndex];

        values = !isChecked(dayIndex, hour) ? [...values, hour] : values.filter((h: number) => h !== hour);

        const result = hourCheckboxes.slice();
        result[dayIndex] = values;
        updateValue(result);
      },
      [hourCheckboxes, updateValue, isChecked],
    );

    const onRowClick = useCallback(
      (dayIndex) => {
        const values = hourCheckboxes[dayIndex].length === 24 ? [] : hoursColumnMap;
        const result = hourCheckboxes.slice();
        result[dayIndex] = values;
        updateValue(result);
      },
      [hourCheckboxes, updateValue],
    );

    const onColClick = useCallback(
      (hour) => {
        const result: number[][] = [];
        const isCheckedValue = hourCheckboxes.every((hours) => hours.includes(hour));
        if (isCheckedValue) {
          hourCheckboxes.forEach((hours) => {
            result.push(hours.filter((h: number) => h !== hour));
          });
        } else {
          hourCheckboxes.forEach((hours) => {
            result.push(hours.includes(hour) ? hours.slice() : [...hours, hour]);
          });
        }
        updateValue(result);
      },
      [hourCheckboxes, updateValue],
    );

    const toggleDayParting = () => {
      if (showDayParting) {
        selectAll();
      }
      setShowDayParting(!showDayParting);
    };

    return (
      <div {...rest} ref={ref}>
        {!readonly && (
          <>
            <DayPartingSwitcher onClick={toggleDayParting}>
              <Switch
                style={{ marginRight: '8px' }}
                defaultChecked
                checkedChildren={t('Custom')}
                unCheckedChildren={t('Anytime')}
                checked={showDayParting}
                onChange={toggleDayParting}
              />
              <TooltipTitle
                title={t('Set Day Parting')}
                hint={t('Set the Day Parting by campaign running hours during the week')}
              />
            </DayPartingSwitcher>
            {!showDayParting && (
              <DayPartingNote style={{ marginBottom: 0, marginTop: 14 }}>
                Note: you can specify campaign running hours and days. Anytime - campaign will be run around the clock
                during the week. Custom - campaign will be run on specified days and hours.
              </DayPartingNote>
            )}
            {showDayParting && (
              <QuickLinkContainer>
                <QuickLink onClick={selectAll}>
                  {t('All')}
                </QuickLink>
                <QuickLink onClick={selectWorkingDays}>
                  {t('Working Days')}
                </QuickLink>
                <QuickLink onClick={selectWorkingHours}>
                  {t('Working Hours')}
                </QuickLink>
                <QuickLink onClick={selectWeekend}>
                  {t('Weekend')}
                </QuickLink>
                <QuickLink onClick={clearAll}>
                  {t('Clear all')}
                </QuickLink>
              </QuickLinkContainer>
            )}
          </>
        )}

        {showDayParting && (
          <DayPartingTable
            isChecked={isChecked}
            onHourClick={onHourClick}
            onRowClick={onRowClick}
            onColClick={onColClick}
            readonly={readonly}
          />
        )}
        {readonly && showDayParting && (
          <IndentBlock>{t('Note: On blue colored values the campaign is set to RUN')}</IndentBlock>
        )}
      </div>
    );
  },
);
