import { Trie } from "./trie";
import { PrefixInfo } from "./types/types";

/**
 * Converts an IPv4 address string into an array of bits.
 *
 * @param address - The IPv4 address in dot-decimal notation (e.g., "192.168.0.1").
 * @returns An array of bits representing the IPv4 address. (e.g., [1, 1, 0, 0, 0, 0, 0, 0, ...])
 */
export function ipv4AddressToBits(address: string): number[] {
    const bits: number[] = [];
    const octets = address.split('.').map(Number);
    for (const octet of octets) {
        for (let i = 7; i >= 0; i--) {
            bits.push((octet >> i) & 1);
        }
    }
    return bits;
}

/**
 * Checks for overlapping IPv4 address ranges and returns information about each range.
 *
 * @param ranges - An array of objects containing IPv4 address ranges with their prefix lengths.
 * @returns An array of `PrefixInfo` objects containing information about each range, including whether it overlaps with any other range.
 *
 * @remarks
 * This function uses a Trie data structure to efficiently check for overlapping ranges. If an overlap is detected, the `overlap` property of the corresponding `PrefixInfo` object is set to `true`, and an `errorMessage` is provided with details about the error.
 *
 * @example
 * ```typescript
 * const ranges = [
 *   { address: '192.168.1.0', prefixLength: 24 },
 *   { address: '192.168.1.128', prefixLength: 25 },
 * ];
 * const result = checkOverlaps(ranges);
 * console.log(result);
 * // Output:
 * // [
 * //   { address: '192.168.1.0', prefixLength: 24, overlap: false },
 * //   { address: '192.168.1.128', prefixLength: 25, overlap: true, errorMessage: { type: 'Error', message: 'Overlap detected' } }
 * // ]
 * ```
 */
export function checkOverlaps(ranges: { address: string; prefixLength: number }[]): PrefixInfo[] {
    const trie = new Trie();
    const prefixInfos: PrefixInfo[] = [];

    for (const range of ranges) {
        const prefixInfo: PrefixInfo = {
            address: range.address,
            prefixLength: range.prefixLength,
            overlap: false,
        };
        const bits = ipv4AddressToBits(range.address);

        try {
            trie.insert(bits, range.prefixLength);
        } catch (error: any) {
            prefixInfo.overlap = true;
            prefixInfo.errorMessage = {
                type: error.constructor.name,
                message: error.message,
            }
        }

        prefixInfos.push(prefixInfo);
    }

    return prefixInfos;
}
