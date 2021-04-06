import {
  onTreeItemDoubleClickProcessor,
  carrierDictionaryToTreeItems,
  countryDictionaryToTreeItems,
  dictionaryToLeafItems,
  filterTreeItems,
  generateKeyDataMap,
  isKeyChecked,
  isKeysChecked,
  getDataMapRangeFromValue,
  getDataMapRangeFromPathKey,
  getStartElement,
  getOnSelectSelect, getOnDeepSelectCb,
} from './utils';

describe('test tree utils', () => {
  const mockFunction = jest.fn();
  const mapper = <T extends object>(item: T) => ({...item, title: undefined});

  test('dictionaryToLeafItems', () => {
    const result = dictionaryToLeafItems([{ id: 1, name: 'name1' }], mockFunction).map(mapper);

    expect([...result])
    .toMatchObject(
      [{ key: '1', isLeaf: true, selectable: true }],
    );
  });

  ['countries', 'carriers'].forEach((caseName) => {
    test(`onTreeItemDoubleClickProcessor ${caseName} case`, () => {
      const mockOnChange = jest.fn();
      const item = { id: 1, name: 'one', [caseName]: [{ id: 1 }, { id: 2 }, { id: 3 }] }
      const filterItems = [{ key: '1' }, { key: '4' }]
      const onClick = onTreeItemDoubleClickProcessor(mockOnChange, item as any, filterItems);
      onClick();
      expect(mockOnChange.mock.calls.length).toBe(1);
      expect(mockOnChange.mock.calls[0][0]).toEqual(['1']);
    });
  })

  test('carrierDictionaryToTreeItems', () => {
    const result = carrierDictionaryToTreeItems([{ id: 1, name: 'name1', carriers: [] }], mockFunction, [], 'p').map(mapper);
    expect(result).toEqual([{ key: 'p1', selectable: true, children: [] }]);
  });

  test('countryDictionaryToTreeItems', () => {
    const result = countryDictionaryToTreeItems([{ id: 1, name: 'name1', countries: [] }], mockFunction, [], 'p').map(mapper);
    expect(result).toEqual([{ key: 'p1', selectable: true, children: [] }]);
  });

  test('filterTreeItems', () => {
    const result = filterTreeItems(
      [{ key: 'p1', children: [{ key: '1' }, { key: '2' }, { key: '3' }] }],
      [{ key: '1' }, { key: '2' }],
    );
    expect(result).toEqual([{ key: 'p1', children: [{ key: '1' }, { key: '2' }] }]);
  });

  test('generateKeyDataMap', () => {
    const result = generateKeyDataMap([{ key: 'p1', children: [{ key: '1' }, { key: '2' }, { key: '3' }] }]);
    expect(result).toEqual({ p1: ['1', '2', '3'] });
  });

  describe('isKeyChecked', () => {
    test('should correct return true', () => {
      const result = isKeyChecked(['1', '2', '3'], '2');
      expect(result).toBeTruthy();
    });
    test('should correct return false', () => {
      const result = isKeyChecked(['1', '2', '3'], '6');
      expect(result).toBeFalsy();
    });
    test('should correct return true', () => {
      const result = isKeysChecked(['1', '2', '3'], ['1', '2', '3']);
      expect(result).toBeTruthy();
    });
    test('should correct return false', () => {
      const result = isKeysChecked(['1', '2'], ['1', '2', '3']);
      expect(result).toBeFalsy();
    });
  });

  describe('getDataMapRangeFromValue', () => {
    const keyDataMap = {
      p1: ['1', '2', '3', '4'],
      p2: ['10', '20', '30', '40'],
    };
    test('should return slice when direct order params', () => {
      expect(getDataMapRangeFromValue(keyDataMap, '1', '3')).toEqual(['1', '2', '3']);
    });
    test('should return slice when reverse order params', () => {
      expect(getDataMapRangeFromValue(keyDataMap, '3', '2')).toEqual(['2', '3']);
    });
  });

  describe('getDataMapRangeFromPathKey', () => {
    const keyDataMap = ['1', '2', '3', '4'];
    test('should return slice when direct order params', () => {
      expect(getDataMapRangeFromPathKey(keyDataMap, '1', '3')).toEqual(['1', '2', '3']);
    });
    test('should return slice when reverse order params', () => {
      expect(getDataMapRangeFromPathKey(keyDataMap, '3', '2')).toEqual(['2', '3']);
    });
  });

  describe('getStartElement', () => {
    test('should correct return first element when multiple', () => {
      expect(getStartElement(['1', '2', '3', '4'], 'multiple')).toBe('1');
    });
    test('should correct return last element when single', () => {
      expect(getStartElement(['1', '2', '3', '4'])).toBe('4');
    });
  });

  describe('getOnSelectSelect', () => {
    const mockOnItemSelect = jest.fn();
    const mockOnItemSelectAll = jest.fn();
    const selectedKeys = ['2', '3'];
    const dataSource = [{ key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }] as any;
    const preventDefault = jest.fn();
    beforeEach(() => {
      mockOnItemSelect.mockClear();
      mockOnItemSelectAll.mockClear();
    });

    test('should work when click in selected item', () => {
      const value = '3';
      const event = { preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        selectedKeys, dataSource, undefined, jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls[0]).toEqual([value, true]);
      expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2'], false]);
    });
    test('should work when click in single selected item', () => {
      const value = '3';
      const event = { preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        ['3'], dataSource, undefined, jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls[0]).toEqual(['3', false]);
      expect(mockOnItemSelectAll.mock.calls[0]).toEqual([[], false]);
    });
    test('should work when click in selected item + ctrl', () => {
      const value = '3';
      const event = { ctrlKey: true, preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        selectedKeys, dataSource, undefined, jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls[0]).toEqual([value, false]);
      expect(mockOnItemSelectAll.mock.calls.length).toBe(0);
    });
    test('should work when click in selected item + shift', () => {
      const value = '3';
      const event = { shiftKey: true, preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        ['2', '3', '4'], dataSource, 'multiple', jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls.length).toBe(0);
      expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['3', '2'], true]);
      expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['4'], false]);
    });
    test('should work when click in next item + shift', () => {
      const value = '4';
      const event = { shiftKey: true, preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        selectedKeys, dataSource, 'multiple', jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls.length).toBe(0);
      expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['4', '3', '2'], true]);
      expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
    });
    test('should work when click in prev item + shift', () => {
      const value = '1';
      const event = { shiftKey: true, preventDefault } as any;
      getOnSelectSelect(
        value, mockOnItemSelect, mockOnItemSelectAll,
        selectedKeys, dataSource, 'multiple', jest.fn(),
      )(event);
      expect(mockOnItemSelect.mock.calls.length).toBe(0);
      expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', '1'], true]);
      expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['3'], false]);
    });
  });

  describe('getOnDeepSelectCb', () => {
    const mockOnItemSelect = jest.fn();
    const mockOnItemSelectAll = jest.fn();
    const selectedKeys = ['2', '3'];
    const groupSelectedKeys = ['p2', '10', '20', '30', '40', 'p3', '100', '200', '300', '400'];
    const keyDataMap = {
      p1: ['1', '2', '3', '4'],
      p2: ['10', '20', '30', '40'],
      p3: ['100', '200', '300', '400'],
      p4: ['1000', '2000', '3000', '4000'],
    } as any;

    describe('clicks inside one group', () => {
      beforeEach(() => {
        mockOnItemSelect.mockClear();
        mockOnItemSelectAll.mockClear();
      });

      test('should work when click in selected item', () => {
        const event = { node: { key: '3' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          selectedKeys, keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['3'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['2'], false]);
      });
      test('should work when click in single selected item', () => {
        const event = { node: { key: '3' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['3'], keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([[], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['3'], false]);
      });
      test('should work when click in selected item + ctrl', () => {
        const event = { nativeEvent: { ctrlKey: true }, node: { key: '3' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          selectedKeys, keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['3'], false]);
      });
      test('should work when click in selected item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '3' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['2', '3', '4'], keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', '3'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['4'], false]);
      });
      test('should work when click in next item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '4' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          selectedKeys, keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', '3', '4'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
      });
      test('should work when click in prev item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '1' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          selectedKeys, keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', '1'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['3'], false]);
      });
    });

    describe('clicks in group level', () => {
      beforeEach(() => {
        mockOnItemSelect.mockClear();
        mockOnItemSelectAll.mockClear();
      });

      test('should work when click in selected item', () => {
        const event = { node: { key: 'p2' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          groupSelectedKeys, keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['p2', '10', '20', '30', '40'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p3', '100', '200', '300', '400'], false]);
      });
      test('should work when click in single selected item', () => {
        const event = { node: { key: 'p1' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['p1', '1', '2', '3', '4'], keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([[], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p1', '1', '2', '3', '4'], false]);
      });
      test('should work when click in selected item + ctrl', () => {
        const event = { nativeEvent: { ctrlKey: true }, node: { key: 'p2' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          groupSelectedKeys, keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['p3', '100', '200', '300', '400'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p2', '10', '20', '30', '40'], false]);
      });
      test('should work when click in selected item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: 'p3' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          [...groupSelectedKeys, 'p4', '1000', '2000', '3000', '4000'], keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([groupSelectedKeys, true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p4', '1000', '2000', '3000', '4000'], false]);
      });
      test('should work when click in next item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: 'p4' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          groupSelectedKeys, keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([[...groupSelectedKeys, 'p4', '1000', '2000', '3000', '4000'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
      });
      test('should work when click in prev item + shift', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: 'p1' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          groupSelectedKeys, keyDataMap, 'multiple', jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['p2', '10', '20', '30', '40', 'p1', '1', '2', '3', '4'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p3', '100', '200', '300', '400'], false]);
      });
    });

    describe('clicks between groups', () => {
      beforeEach(() => {
        mockOnItemSelect.mockClear();
        mockOnItemSelectAll.mockClear();
      });

      test('should work when shift click in next group', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '30' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          selectedKeys, keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', '3', '4', '10', '20', '30'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
      });

      test('should work when shift click in next group from group', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '30' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['p1', '1', '2', '3', '4'], keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['p1', '1', '2', '3', '4', '10', '20', '30'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
      });

      test('should work when shift click inside current group', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: '2' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['p1', '1', '2', '3', '4'], keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['1', '2'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([['p1', '3', '4'], false]);
      });

      test('should work when shift click from inside group to group item', () => {
        const event = { nativeEvent: { shiftKey: true }, node: { key: 'p1' } } as any;
        getOnDeepSelectCb(
          mockOnItemSelect, mockOnItemSelectAll,
          ['2'], keyDataMap, undefined, jest.fn(),
        )(undefined, event);
        expect(mockOnItemSelect.mock.calls.length).toBe(0);
        expect(mockOnItemSelectAll.mock.calls[0]).toEqual([['2', 'p1', '1', '3', '4'], true]);
        expect(mockOnItemSelectAll.mock.calls[1]).toEqual([[], false]);
      });
    });
  });
});
