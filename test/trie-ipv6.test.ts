import { ipv6AddressToBits, checkOverlaps, expandIPv6Address } from '../src/ipv6-utils';
import { Trie } from '../src/trie';


describe('detect overlaps in IPv6 address ranges', () => {
    it('should insert prefixes without overlaps', () => {
        const ranges = [
            { address: '2001:db8::', prefixLength: 32 },
            { address: '2001:db9::', prefixLength: 32 },
            { address: '2001:dba::', prefixLength: 32 },
        ];

        const prefixInfos = checkOverlaps(ranges);

        prefixInfos.forEach((info) => {
            expect(info.overlap).toBe(false);
            expect(info.errorMessage).toBeUndefined();
        });
    });

    it('should detect overlaps and throw errors', () => {
        const ranges = [
            { address: '2001:db8::', prefixLength: 32 },
            { address: '2001:db8::', prefixLength: 32 },
            { address: '2001:db8:1::', prefixLength: 48 },
            { address: '2001:db8::', prefixLength: 16 },
        ];

        const prefixInfos = checkOverlaps(ranges);

        expect(prefixInfos[0].overlap).toBe(false);
        expect(prefixInfos[0].errorMessage).toBeUndefined();

        expect(prefixInfos[1].overlap).toBe(true);
        expect(prefixInfos[1].errorMessage).toStrictEqual({type:'RangeError',message:'The same prefix already exists.'});

        expect(prefixInfos[2].overlap).toBe(true);
        expect(prefixInfos[2].errorMessage).toStrictEqual({type:'RangeError',message:'The specified prefix is included in an existing prefix.'});

        expect(prefixInfos[3].overlap).toBe(true);
        expect(prefixInfos[3].errorMessage).toStrictEqual({type:'RangeError',message:'The specified prefix contains an existing prefix.'});
    });
});

describe('IPv6 Address to Bits Conversion', () => {
  it('should correctly convert expanded IPv6 address to bits', () => {
    const address = '2001:0db8:0000:0000:0000:0000:0000:0001';
    const bits = ipv6AddressToBits(address);

    expect(bits.length).toBe(128);

    const expectedBits = [
        0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
        ...Array(16 * 5).fill(0),
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      ];

    expect(bits).toEqual(expectedBits);
  });

  it('should correctly convert compressed IPv6 address to bits', () => {
    const address = '2001:db8::1';
    const bits = ipv6AddressToBits(address);

    expect(bits.length).toBe(128);
    
    // 2001:db8::1 => 2001:0db8:0000:0000:0000:0000:0000:0001
    const expectedBits = [
        0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
        ...Array(16 * 5).fill(0),
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      ];

    expect(bits).toEqual(expectedBits);
  });
  it('should correctly convert another IPv6 address to bits', () => {
    const address = 'fe80::1ff:fe23:4567:890a';
    const bits = ipv6AddressToBits(address);

    expect(bits.length).toBe(128);

    const expectedBits = [
        1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
        ...Array(16 * 3).fill(0),
        0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1,
        0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1,
        1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0
    ];
    expect(bits).toEqual(expectedBits);
    });
});

describe('Expand IPv6 Address', () => {
    it('should correctly expand compressed and omitting zeros IPv6 address', () => {
      const compressed = '2001:db8::1';
      const expanded = expandIPv6Address(compressed);
      const expected = '2001:0db8:0000:0000:0000:0000:0000:0001';
  
      expect(expanded).toBe(expected);
    });

    it('should correctly expand IPv6 address with omitted zeros', () => {
      const compressed = '2001:db8::';
      const expanded = '2001:0db8:0000:0000:0000:0000:0000:0000';
      const result = expandIPv6Address(compressed);
      
      expect(result).toBe(expanded);
    });

    it('should correctly expand another compressed IPv6 address', () => {
        const compressed = 'fe80::1ff:fe23:4567:890a';
        const expanded = expandIPv6Address(compressed);
        const expected = 'fe80:0000:0000:0000:01ff:fe23:4567:890a';
    
        expect(expanded).toBe(expected);
      });  
  });

describe('Search existing prefixes in Trie', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  it('should find an existing prefix', () => {
    const ranges = [
      { address: '2001:db8::', prefixLength: 64 },
      { address: '2001:db9::', prefixLength: 64 },
      { address: '2001:dba::', prefixLength: 64 },
    ];

    for (const { address, prefixLength } of ranges) {
      trie.insert(ipv6AddressToBits(address), prefixLength);
    }

    expect(trie.search(ipv6AddressToBits('2001:db8::'), 64)).toBe(true);
    expect(trie.search(ipv6AddressToBits('2001:db9::'), 64)).toBe(true);
    expect(trie.search(ipv6AddressToBits('2001:dba::'), 64)).toBe(true);
  });

  it('should not find a non-existing prefix', () => {
    const ranges = [
      { address: '2001:db8::', prefixLength: 64 },
      { address: '2001:db9::', prefixLength: 64 },
      { address: '2001:dba::', prefixLength: 64 },
    ];

    for (const { address, prefixLength } of ranges) {
      trie.insert(ipv6AddressToBits(address), prefixLength);
    }

    expect(trie.search(ipv6AddressToBits('2001:db1::'), 64)).toBe(false);
    expect(trie.search(ipv6AddressToBits('2001:dbc::'), 64)).toBe(false);
    expect(trie.search(ipv6AddressToBits('2001:db7::'), 64)).toBe(false);
  });

  it('should return false for a partially matching prefix', () => {
    trie.insert(ipv6AddressToBits('2001:db8::'), 64);

    expect(trie.search(ipv6AddressToBits('2001:db8:1::'), 64)).toBe(false);
    expect(trie.search(ipv6AddressToBits('2001:db8::1'), 128)).toBe(false);
  });

  it('should return false when trie is empty', () => {
    expect(trie.search(ipv6AddressToBits('2001:db8::'), 64)).toBe(false);
    expect(trie.search(ipv6AddressToBits('::1'), 128)).toBe(false);
  });

  it('should handle prefixes with different lengths correctly', () => {
    const ranges = [
      { address: '2001:db8::', prefixLength: 48 },
      { address: '2001:db8:1::', prefixLength: 64 },
      { address: '2001:db8:2::', prefixLength: 96 }
    ];

    for (const { address, prefixLength } of ranges) {
      trie.insert(ipv6AddressToBits(address), prefixLength);
    }

    expect(trie.search(ipv6AddressToBits('2001:db8::'), 48)).toBe(true);
    expect(trie.search(ipv6AddressToBits('2001:db8:1::'), 64)).toBe(true);
    expect(trie.search(ipv6AddressToBits('2001:db8:2::'), 96)).toBe(true);
    expect(trie.search(ipv6AddressToBits('2001:db8:3::'), 96)).toBe(false);
  });
});