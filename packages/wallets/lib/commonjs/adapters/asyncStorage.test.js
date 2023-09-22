"use strict";

var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _parsers = require("../parsers");
var _storage = require("../storage");
var _asyncStorage2 = require("./asyncStorage");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable @typescript-eslint/no-shadow */

describe('prefixed storage', () => {
  beforeEach(() => _asyncStorage.default.clear());
  it('getAllKeys, setItem, getItem, removeItem, clear', async () => {
    const storage = _storage.rootStorage;
    await storage.getAllKeys().then(keys => expect(keys).toEqual([]));
    await storage.setItem('item1', item1);
    expect(await storage.getItem('item1')).toEqual(item1);
    await storage.setItem('item2', item2);
    expect(await storage.getItem('item2')).toEqual(item2);
    expect(await storage.getItem('does not exist')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2']);
    await storage.removeItem('item1');
    expect(await storage.getItem('item1')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item2']);
    await storage.clear();
    expect(await storage.getAllKeys()).toEqual([]);
  });
  it('getAllKeys, setItem, getItem, removeItem, clear, with prefix', async () => {
    const storage = _storage.rootStorage.join('prefix/');
    expect(await storage.getAllKeys()).toEqual([]);
    await storage.setItem('item1', item1);
    expect(await storage.getItem('item1')).toEqual(item1);
    await storage.setItem('item2', item2);
    expect(await storage.getItem('item2')).toEqual(item2);
    expect(await storage.getItem('does not exist')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2']);
    await storage.removeItem('item1');
    expect(await storage.getItem('item1')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item2']);
    await storage.clear();
    expect(await storage.getAllKeys()).toEqual([]);
  });
  it('getAllKeys, multiSet, multiGet, multiRemove', async () => {
    const storage = _storage.rootStorage.join('prefix/');
    await storage.multiSet([['item1', item1], ['item2', item2]]);
    const keys = await storage.getAllKeys();
    expect(keys).toEqual(['item1', 'item2']);
    const items1 = await storage.multiGet(['item1', 'item2']);
    expect(items1).toEqual([['item1', {
      a: 123,
      b: 234
    }], ['item2', {
      c: 123,
      d: 234
    }]]);
    await storage.multiRemove(['item1', 'item2']);
    const items2 = await storage.multiGet(['item1', 'item2']);
    expect(items2).toEqual([['item1', null], ['item2', null]]);
    await storage.getAllKeys().then(keys => expect(keys).toEqual([]));
  });
  it('getAllKeys', async () => {
    const storage1 = _storage.rootStorage.join('prefix/1/');
    expect(await storage1.getAllKeys()).toEqual([]);
    await storage1.setItem('key1', item1);
    await storage1.setItem('key2', item2);
    expect(await storage1.getAllKeys()).toEqual(['key1', 'key2']);
    const storage2 = _storage.rootStorage.join('prefix/2/3/');
    expect(await storage2.getAllKeys()).toEqual([]);
    await storage2.setItem('key1', item1);
    await storage2.setItem('key2', item2);
    expect(await storage2.getAllKeys()).toEqual(['key1', 'key2']);
    const storage = _storage.rootStorage.join('prefix/');
    expect(await storage.getAllKeys()).toEqual([]);
    await storage.setItem('key1', item1);
    await storage.setItem('key2', item2);
    expect(await storage.getAllKeys()).toEqual(['key1', 'key2']);
  });
  it('join', async () => {
    const root = _storage.rootStorage.join('/');
    await root.setItem('key1', item1);
    await root.setItem('key2', item2);
    expect(await root.getAllKeys()).toEqual(['key1', 'key2']);
    const storage = root.join('dir/');
    expect(await storage.getAllKeys()).toEqual([]);
    await storage.setItem('item1', item1);
    expect(await storage.getItem('item1')).toEqual(item1);
    await storage.setItem('item2', item2);
    expect(await storage.getItem('item2')).toEqual(item2);
    expect(await storage.getItem('does not exist')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2']);
    await storage.removeItem('item1');
    expect(await storage.getItem('item1')).toEqual(null);
    expect(await storage.getAllKeys()).toEqual(['item2']);
    await storage.clear();
    expect(await storage.getAllKeys()).toEqual([]);
  });
  describe('stringify/parse', () => {
    it('getItem, setItem', async () => {
      const storage = _storage.rootStorage;
      const item = 'text';
      const storedItem = 'item123';
      await storage.setItem('item', item, data => {
        expect(data).toBe(item);
        return storedItem;
      }); // overrides JSON.stringify

      const parsedResult = await storage.getItem('item', data => {
        expect(data).toBe(storedItem);
        return item;
      }); // overrides JSON.parse

      expect(parsedResult).toBe(item);
    });
    it('multiGet, multiSet', async () => {
      const storage = _storage.rootStorage;
      const item1 = 'item1';
      const storedItem1 = `${item1}-modified`;
      const item2 = 'item2';
      const storedItem2 = `${item2}-modified`;
      const tuples = [['item1', item1], ['item2', item2]];
      await storage.multiSet(tuples, data => {
        expect([item1, item2]).toContain(data);
        return `${data}-modified`;
      }); // overrides JSON.stringify

      const parsedResult = await storage.multiGet(['item1', 'item2'], data => {
        expect([storedItem1, storedItem2]).toContain(data);
        return data === null || data === void 0 ? void 0 : data.slice(0, 5);
      }); // overrides JSON.parse

      expect(parsedResult).toEqual(tuples);
    });
  });
  it('clears sub-storage', async () => {
    const storage1 = _storage.rootStorage.join('1/');
    const storage2 = storage1.join('2/');
    const storage3 = storage2.join('3/');
    await _storage.rootStorage.setItem('a', '000');
    await _storage.rootStorage.setItem('1', '000');
    await storage1.setItem('b', 111);
    await storage2.setItem('c', 222);
    await storage3.setItem('d', 333);
    expect(await snapshot()).toEqual({
      // folder named "1"
      '/1/2/3/d': 333,
      '/1/2/c': 222,
      '/1/b': 111,
      // file named "1"
      '/1': '000',
      '/a': '000'
    });
    expect(await storage1.getAllKeys()).toEqual(['b']);
    await storage1.clear();
    expect(await snapshot()).toEqual({
      '/a': '000',
      '/1': '000'
    });
  });
  it('removeFolder', async () => {
    const storage1 = _storage.rootStorage.join('1/');
    const storage2 = storage1.join('2/');
    const storage3 = storage2.join('3/');
    await _storage.rootStorage.setItem('a', '000');
    await _storage.rootStorage.setItem('1', '000');
    await storage1.setItem('b', 111);
    await storage2.setItem('c', 222);
    await storage3.setItem('d', 333);
    expect(await snapshot()).toEqual({
      // folder named "1"
      '/1/2/3/d': 333,
      '/1/2/c': 222,
      '/1/b': 111,
      // root folder
      '/1': '000',
      '/a': '000'
    });
    await storage2.removeFolder('3/');
    expect(await snapshot()).toEqual({
      '/1/2/c': 222,
      '/1/b': 111,
      '/1': '000',
      '/a': '000'
    });
    await _storage.rootStorage.removeFolder('1/');
    expect(await snapshot()).toEqual({
      '/1': '000',
      '/a': '000'
    });
  });
});
describe('multi storage', () => {
  beforeEach(() => _asyncStorage.default.clear());
  it('save, read, keys, remove providing the serializers', async () => {
    const storage = (0, _asyncStorage2.mountMultiStorage)(options);
    await storage.save([item3, item4]);
    const readItems = await storage.read();
    expect(readItems).toEqual([['1', item3], ['2', item4]]);
    const keys = await storage.keys();
    expect(keys).toEqual(['1', '2']);
    await storage.remove();
    const emptyKeys = await storage.keys();
    expect(emptyKeys).toEqual([]);
  });
  it('save, read, keys, remove default serializers / key as extractor', async () => {
    const storage = (0, _asyncStorage2.mountMultiStorage)({
      storage: _storage.rootStorage.join('multiStorage/'),
      dataFolder: 'dataFolder/',
      keyExtractor: 'id'
    });
    await storage.save([item3, item4]);
    const readItems = await storage.read();
    expect(readItems).toEqual([['1', item3], ['2', item4]]);
    const keys = await storage.keys();
    expect(keys).toEqual(['1', '2']);
    await storage.remove();
    const emptyKeys = await storage.keys();
    expect(emptyKeys).toEqual([]);
  });
});
const options = {
  storage: _storage.rootStorage.join('multiStorage/'),
  dataFolder: 'dataFolder/',
  keyExtractor: item => item.id,
  serializer: JSON.stringify,
  deserializer: data => JSON.parse(data)
};
const item1 = {
  a: 123,
  b: 234
};
const item2 = {
  c: 123,
  d: 234
};
const item3 = {
  id: 1,
  a: 123,
  b: 234
};
const item4 = {
  id: '2',
  c: 123,
  d: 234
};
const snapshot = async () => {
  const keys = await _asyncStorage.default.getAllKeys();
  const entries = await _asyncStorage.default.multiGet(keys).then(entries => entries.map(_ref => {
    let [key, value] = _ref;
    return [key, (0, _parsers.parseSafe)(value)];
  }));
  return Object.fromEntries(entries);
};
//# sourceMappingURL=asyncStorage.test.js.map