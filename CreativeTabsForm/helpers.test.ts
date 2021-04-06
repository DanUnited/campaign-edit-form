import { calcNewActiveIndex, cropNumber } from './index';

describe('cropNumber', () => {
  it('should work correct with only min value', () => {
    expect(cropNumber(-1, 0)).toBe(0);
    expect(cropNumber(10, 0)).toBe(10);
  });
  it('should work correct with min & max value', () => {
    expect(cropNumber(-1, 0, 40)).toBe(0);
    expect(cropNumber(10, 0, 40)).toBe(10);
    expect(cropNumber(50, 0, 40)).toBe(40);
  });
});

describe('calcNewActiveIndex', () => {
  it('should work correct when delete higher value', () => {
    expect(calcNewActiveIndex(5, 6, 10)).toBe(5);
    expect(calcNewActiveIndex(5, 11, 10)).toBe(5);
    expect(calcNewActiveIndex(0, 9, 10)).toBe(0);
  });
  it('should work correct when delete current value', () => {
    expect(calcNewActiveIndex(5, 5, 10)).toBe(4);
    expect(calcNewActiveIndex(11, 11, 10)).toBe(10);
    expect(calcNewActiveIndex(0, 0, 10)).toBe(0);
  });
  it('should work correct when delete lower value', () => {
    expect(calcNewActiveIndex(5, 3, 10)).toBe(4);
    expect(calcNewActiveIndex(11, 3, 10)).toBe(10);
  });
});
