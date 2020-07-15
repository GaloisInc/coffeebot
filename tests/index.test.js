const {
  deserializeEmails,
  mapRowDataToPairData,
  randomUniquePairing,
  serializeEmails,
  uniqify,
} = require('../src/coffeebot');

describe('Coffeebot', () => {

  describe('serializeEmails', () => {

    it('should always sort lexicographically', () => {
      expect(serializeEmails(['zzz@gmail.com', 'mmm@hotmail.com', 'aaa@gmail.com'])).toEqual('aaa@gmail.com,mmm@hotmail.com,zzz@gmail.com');
    });

    it('should handle an empty list', () => {
      expect(serializeEmails([])).toEqual('');
    });
  });

  describe('deserializeEmails', () => {

    it('should always sort lexicographically', () => {
      expect(deserializeEmails('zzz@gmail.com,mmm@hotmail.com,aaa@gmail.com')).toEqual(['aaa@gmail.com', 'mmm@hotmail.com', 'zzz@gmail.com']);
    });

    it('should be able to deserialize an empty string', () => {
      expect(deserializeEmails('')).toEqual([]);
    });
  });

  describe('uniqify', () => {
    
    it('should de-duplicate a given list of strings', () => {

      expect(uniqify(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
    
    it('should de-duplicate a given list of numbers', () => {

      expect(uniqify([1, 2, 1])).toEqual([1, 2]);
    });

    it('should handle empty list', () => {
      expect(uniqify([])).toEqual([]);
    });
  });

  describe('mapRowDataToPairData', () => {

    it('should correctly build an object out of valid row data', () => {
      expect(mapRowDataToPairData([
        'TEST_NAME',
        'TEST@EMAIL.COM',
        'TEST_TZ',
        10,
        'TEST, TOPICS',
      ])).toEqual({
        cadence: 10,
        email: 'TEST@EMAIL.COM',
        name: 'TEST_NAME',
        timezone: 'TEST_TZ',
        topics: 'TEST, TOPICS',
      });
    });

    it('should map to expected defaults', () => {
      expect(mapRowDataToPairData([])).toEqual({
        cadence: 1,
        email: undefined,
        name: undefined,
        timezone: 'UNKNOWN',
        topics: '',
      });
    });
  });

  describe('randomUniquePairing', () => {

    beforeEach(() => {
      // NOTE: This is brittle, but testing collisions means we need different values
      jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.8)
        .mockReturnValue(0.5);
    });
  
    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should handle no-data case', () => {
      expect(randomUniquePairing(new Set([]), [])).toEqual([]);
    });

    it('should just pair particpants if no previous pairing data', () => {
      const PREV_PAIRINGS = new Set([]);
      const PARTICIPANTS = [
        { name: 'foo', email: 'foo@gmail.com', timezone: 'TZ', cadence: 1, topics: 'foo, bar' },
        { name: 'bar', email: 'bar@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bam, baz' },
        { name: 'bam', email: 'bam@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bip, boo' },
        { name: 'baz', email: 'baz@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bif, baz' },
      ]

      expect(randomUniquePairing(PREV_PAIRINGS, PARTICIPANTS)).toEqual([
        ['bar@gmail.com', 'foo@gmail.com'],
        ['bam@gmail.com', 'baz@gmail.com'],
      ]);
    });

    it('should avoid previous pairing', () => {
      const PREV_PAIRINGS = new Set(['bam@gmail.com,foo@gmail.com']);
      const PARTICIPANTS = [
        { name: 'foo', email: 'foo@gmail.com', timezone: 'TZ', cadence: 1, topics: 'foo, bar' },
        { name: 'bar', email: 'bar@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bam, baz' },
        { name: 'bam', email: 'bam@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bip, boo' },
        { name: 'baz', email: 'baz@gmail.com', timezone: 'TZ', cadence: 1, topics: 'bif, baz' },
      ]

      expect(randomUniquePairing(PREV_PAIRINGS, PARTICIPANTS)).toEqual(
        expect.not.arrayContaining(['bam@gmail.com', 'foo@gmail.com'])
      );
    });
  });
});
