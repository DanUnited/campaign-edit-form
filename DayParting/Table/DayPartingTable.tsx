import React, { useCallback } from 'react';
import { ScrollWrapper, Table } from './elements';
import { dayNamesMap, hoursColumnMap } from './entities';

interface IProps {
  isChecked: (dayIndex: number, hour: number) => boolean;
  onHourClick: (dayIndex: number, hour: number) => void;
  onRowClick: (dayIndex: number) => void;
  onColClick: (hour: number) => void;
  readonly?: boolean;
}

interface ISquareProps extends Pick<IProps, 'isChecked' | 'onHourClick'> {
  dayIndex: number;
  hour: number;
}
const SquareElement = ({ isChecked, onHourClick, dayIndex, hour }: ISquareProps) => {
  const onClick = useCallback(() => onHourClick(dayIndex, hour), [onHourClick, dayIndex, hour]);
  return (
    <div
      className={'dayParting-square ' + (isChecked(dayIndex, hour) ? '-active' : '')}
      onClick={onClick}
      key={hour}
    />
  );
};

interface IRowTitleProps extends Pick<IProps, 'onRowClick'> {
  dayIndex: number;
  dayName: string;
}
const RowTitleElement = ({ onRowClick, dayIndex, dayName }: IRowTitleProps) => {
  const onClick = useCallback(() => onRowClick(dayIndex), [onRowClick, dayIndex]);
  return <div className="dayParting-rowTitle" onClick={onClick}>{dayName}</div>;
};

interface IColTitleProps extends Pick<IProps, 'onColClick'> {
  hour: number;
}
const ColTitleElement = ({ onColClick, hour }: IColTitleProps) => {
  const onClick = useCallback(() => onColClick(hour), [onColClick, hour]);
  return <div className="dayParting-colTitle" onClick={onClick}>{hour}<sup>00</sup></div>;
};

const dummyFunc = () => void 0;
export const DayPartingTable = ({ isChecked, onHourClick, onRowClick, onColClick, readonly }: IProps) => {
  const onHourClickFunc = readonly ? dummyFunc : onHourClick;
  const onRowClickFunc = readonly ? dummyFunc : onRowClick;
  const onColClickFunc = readonly ? dummyFunc : onColClick;

  return (
    <ScrollWrapper>
      <Table readonly={readonly}>
        <div className="dayParting-rowTitleDummy" />
        {hoursColumnMap.map((hour) => (
          <ColTitleElement onColClick={onColClickFunc} hour={hour} key={hour} />
        ))}
        {dayNamesMap.map((dayName, dayIndex) => (
          <div className="dayParting-row" key={dayName}>
            <RowTitleElement onRowClick={onRowClickFunc} dayIndex={dayIndex} dayName={dayName} />
            {hoursColumnMap.map((hour) =>
              <SquareElement
                isChecked={isChecked}
                onHourClick={onHourClickFunc}
                dayIndex={dayIndex}
                hour={hour}
                key={hour}
              />,
            )}
          </div>
        ))}
      </Table>
    </ScrollWrapper>
  );
};
