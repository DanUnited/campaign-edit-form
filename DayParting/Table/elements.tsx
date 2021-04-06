import styled, { css } from 'styled-components';
import { hoursColumnMap } from './entities';

const activeStyle = `background: #4b7cf3;`;
const activeHoverStyle = `background: #7ea4fb;`;
const notActiveHoverStyle = `background: #d1dbf5;`;
const notActiveReadonlyHoverStyle = `background: #ebedf0;`;

const squareBaseStyles = css<any>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  position: relative;
  display: inline-block;
  width: 28px;
  height: 28px;
  border: ${({ readonly }) => (readonly ? 2 : 1)}px solid #fff;
  font-size: 13px;
  vertical-align: bottom;
  box-sizing: content-box;
`;

export const ScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;
export const Table = styled<any>('div')`
  width: ${({ readonly }) => (readonly ? 800 : 750)}px;
  line-height: 18px;
  font-size: 0;
  margin: 0 -2px;
  user-select: none;

  .dayParting-rowTitleDummy {
    ${squareBaseStyles}
    cursor: default;
    width: 26px;
  }
  .dayParting-rowTitle {
    ${squareBaseStyles}
    width: 26px;
  }
  .dayParting-rowTitle:hover ~ .-active {
    ${({ readonly }) => (readonly ? activeStyle : activeHoverStyle)}
  }
  .dayParting-rowTitle:hover ~ :not(.-active) {
    ${({ readonly }) => (readonly ? notActiveReadonlyHoverStyle : notActiveHoverStyle)}
  }

  .dayParting-colTitle {
    ${squareBaseStyles}
    height: ${({ readonly }) => (readonly ? 16 : 24)}px;
    text-align: center;
  }

  .dayParting-square {
    ${squareBaseStyles}
    background: #ebedf0;
  }
  .dayParting-square.-active {
    ${activeStyle}
  }

  ${({ readonly }) =>
    hoursColumnMap.map(
      (hour) => `
      .dayParting-colTitle:nth-child(${hour + 2}):hover ~ .dayParting-row > .-active:nth-child(${hour + 2}) {
        ${readonly ? activeStyle : activeHoverStyle}
      }
      .dayParting-colTitle:nth-child(${hour + 2}):hover ~ .dayParting-row > :not(.-active):nth-child(${hour + 2}) {
        ${readonly ? notActiveReadonlyHoverStyle : notActiveHoverStyle}
      }`,
    )}

  .dayParting-square.-active:hover {
    ${({ readonly }) => (readonly ? activeStyle : activeHoverStyle)}
  }
  .dayParting-square:not(.-active):hover {
    ${({ readonly }) => (readonly ? notActiveReadonlyHoverStyle : notActiveHoverStyle)}
  }
`;
