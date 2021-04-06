import calcFinalSize from './calcFinalSize';

const minWidth = 150;
const minHeight = 100;
const maxWidth = 450;
const maxHeight = 300;

describe('test calcFinalSize', () => {
  test('size less then minimum', () => {
    const result = calcFinalSize(120, 80, minWidth, minHeight, maxWidth, maxHeight);
    expect(result).toEqual({width: 150, height: 100});
  });

  test('normal size', () => {
    const result = calcFinalSize(300, 200, minWidth, minHeight, maxWidth, maxHeight);
    expect(result).toEqual({width: 300, height: 200});
  });

  test('size more then maximum', () => {
    const result = calcFinalSize(1500, 1000, minWidth, minHeight, maxWidth, maxHeight);
    expect(result).toEqual({width: 450, height: 300});
  });

  test('height more then maximum height', () => {
    const result = calcFinalSize(400, 400, minWidth, minHeight, maxWidth, maxHeight);
    expect(result).toEqual({width: 300, height: 300});
  });

  test('width more then maximum width', () => {
    const result = calcFinalSize(500, 250, minWidth, minHeight, maxWidth, maxHeight);
    expect(result).toEqual({width: 450, height: 225});
  });
});
