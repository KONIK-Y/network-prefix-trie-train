import { ipv4AddressToBits, checkOverlaps } from '../src/ipv4-utils';
import { Trie } from '../src/trie';


describe('detect overlaps in IPv4 address ranges', () => {
    it('should insert prefixes without overlaps', () => {
        const ranges = [
            { address: '192.168.0.0', prefixLength: 16 },
            { address: '10.0.0.0', prefixLength: 8 },
            { address: '172.16.0.0', prefixLength: 12 },
        ];

        const prefixInfos = checkOverlaps(ranges);

        prefixInfos.forEach((info) => {
            expect(info.overlap).toBe(false);
            expect(info.errorMessage).toBeUndefined();
        });
    });

    it('should detect overlaps and throw errors', () => {
        const ranges = [
            { address: '192.168.0.0', prefixLength: 16 },
            { address: '192.168.0.0', prefixLength: 16 },
            { address: '192.168.1.0', prefixLength: 24 },
            { address: '192.168.0.0', prefixLength: 15 },
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


describe('IPv4 Address tp Bits Conversion', () => {
    it('should convert IPv4 address to bits correctly', () => {
        const address = '192.168.0.1';
        const bits = ipv4AddressToBits(address);

        expect(bits.length).toBe(32);

        const expectedBits = [
            1, 1, 0, 0, 0, 0, 0, 0,
            1, 0, 1, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 1,
        ];

        expect(bits).toEqual(expectedBits);
    });
});

describe('IPv4 search existing prefixes', () => {
    let trie: Trie;
    beforeEach(() => {
        trie = new Trie();
      });

  it('should find an existing prefix', () => {
    const ranges = [
      { address: '192.168.0.0', prefixLength: 24 },
      { address: '10.0.0.0', prefixLength: 16 },
      { address: '172.16.0.0', prefixLength: 12 }
    ];

    for (const { address, prefixLength } of ranges) {
      trie.insert(ipv4AddressToBits(address), prefixLength);
    }

    expect(trie.search(ipv4AddressToBits('192.168.0.0'), 24)).toBe(true);
    expect(trie.search(ipv4AddressToBits('10.0.0.0'), 16)).toBe(true);
    expect(trie.search(ipv4AddressToBits('172.16.0.0'), 12)).toBe(true);
  });

  it('should not find a non-existing prefix', () => {
    const ranges = [
      { address: '192.168.0.0', prefixLength: 24 },
      { address: '10.0.0.0', prefixLength: 16 },
      { address: '172.16.0.0', prefixLength: 16 }
    ];

    for (const { address, prefixLength } of ranges) {
      trie.insert(ipv4AddressToBits(address), prefixLength);
    }

    expect(trie.search(ipv4AddressToBits('192.169.1.0'), 24)).toBe(false);
    expect(trie.search(ipv4AddressToBits('10.1.0.0'), 16)).toBe(false);
    expect(trie.search(ipv4AddressToBits('172.17.0.0'), 16)).toBe(false);
  });

  it('should return false for a partially matching prefix', () => {
    trie.insert(ipv4AddressToBits('192.168.0.0'), 24);

    expect(trie.search(ipv4AddressToBits('192.168.0.1'), 32)).toBe(false);
  });

  it('should return false when trie is empty', () => {
    expect(trie.search(ipv4AddressToBits('192.168.0.0'), 24)).toBe(false);
  });
});
  