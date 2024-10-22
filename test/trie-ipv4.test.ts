import { IPv4Trie, ipv4AddressToBits, checkOverlaps, PrefixInfo } from '../src/utils/trie-ipv4';


describe('IPv4Trie Class detect overlaps', () => {
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
            { address: '192.168.0.0', prefixLength: 16 }, // 同じプレフィックス
            { address: '192.168.1.0', prefixLength: 24 }, // 既存のプレフィックスに含まれる
            { address: '192.168.0.0', prefixLength: 15 }, // 既存のプレフィックスを包含する
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


describe('IPv4 Address Conversion', () => {
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