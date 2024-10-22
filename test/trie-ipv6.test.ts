import { IPv6Trie, ipv6AddressToBits, checkOverlaps, expandIPv6Address } from '../src/utils/trie-ipv6';


describe('IPv6Trie Class detect overlaps', () => {
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
            { address: '2001:db8::', prefixLength: 32 }, // 同じプレフィックス
            { address: '2001:db8:1::', prefixLength: 48 }, // 既存のプレフィックスに含まれる
            { address: '2001:db8::', prefixLength: 16 }, // 既存のプレフィックスを包含する
        ];

        const prefixInfos = checkOverlaps(ranges);

        expect(prefixInfos[0].overlap).toBe(false);
        expect(prefixInfos[0].errorMessage).toBeUndefined();

        expect(prefixInfos[1].overlap).toBe(true);
        expect(prefixInfos[1].errorMessage).toBe('重複エラー: 同じプレフィックスが既に存在します。');

        expect(prefixInfos[2].overlap).toBe(true);
        expect(prefixInfos[2].errorMessage).toBe('重複エラー: 指定されたプレフィックスは既存のプレフィックスに含まれています。');

        expect(prefixInfos[3].overlap).toBe(true);
        expect(prefixInfos[3].errorMessage).toBe('重複エラー: 指定されたプレフィックスは既存のプレフィックスを包含しています。');
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
        1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,
        ...Array(16 * 3).fill(0),
        0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,0,0,0,1,0,0,0,1,1,
        0,1,0,0,0,1,0,1,0,1,1,0,0,1,1,1,
        1,0,0,0,1,0,0,1,0,0,0,0,1,0,1,0
    ];
    expect(bits).toEqual(expectedBits);
    });
});

describe('Expand IPv6 Address', () => {
    it('should correctly expand compressed IPv6 address', () => {
      const compressed = '2001:db8::1';
      const expanded = expandIPv6Address(compressed);
      const expected = '2001:0db8:0000:0000:0000:0000:0000:0001';
  
      expect(expanded).toBe(expected);
    });
  
    it('should return the same address if already expanded', () => {
      const expanded = '2001:0db8:0000:0000:0000:0000:0000:0001';
      const result = expandIPv6Address(expanded);
  
      expect(result).toBe(expanded);
    });

    it('should correctly expand another compressed IPv6 address', () => {
        const compressed = 'fe80::1ff:fe23:4567:890a';
        const expanded = expandIPv6Address(compressed);
        const expected = 'fe80:0000:0000:0000:01ff:fe23:4567:890a';
    
        expect(expanded).toBe(expected);
      });  
  });