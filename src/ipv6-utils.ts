import { Trie } from "./trie";
import { PrefixInfo } from "./types/types";

/**
 * Converts an IPv6 address to an array of bits.
 * If the address is compressed, it will be expanded before conversion.
 * 
 * @param address - The IPv6 address to convert. (e.g., "2001:db8::", "2001:db8::1", "2001:db8:0:0:0:0:2:1")
 * @returns An array of bits representing the IPv6 address.(e.g., [1, 1, 0, 0, 0, 0, 0, 0, ...])
 * @throws SyntaxError - If the expanded IPv6 address is invalid.
 */
export function ipv6AddressToBits(address: string): number[] {
    const bits: number[] = [];
    const expanded = expandIPv6Address(address);
    const parts = expanded.split(':');
    if (parts.length !== 8) {
        throw new SyntaxError(`Invalid expanded IPv6 address: ${expanded}`);
    }
    for (const part of parts) {
        const num = parseInt(part, 16);
        for (let i = 15; i >= 0; i--) {
            bits.push((num >> i) & 1);
        }
    }
    return bits;
}


/**
 * Expands a given IPv6 address by filling in the missing parts with zeros.
 * 
 * This function takes an IPv6 address that may contain a shorthand notation
 * (using "::" to represent consecutive zeros) and expands it to its full
 * representation.
 * 
 * @param address - The IPv6 address to expand.
 * @returns The fully expanded IPv6 address.
 * @throws {SyntaxError} If the IPv6 address contains more than one "::".
 * @throws {Error} If the IPv6 address has too many parts.
 */
export function expandIPv6Address(address: string): string {
    const parts = address.split('::');
    if (parts.length > 2) {
        throw new SyntaxError('Invalid IPv6 address');
    }
    const left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    const right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) {
        throw new SyntaxError('Invalid IPv6 address: too many parts');
    }
    const omittedZeros = Array(missing).fill('0000');
    const fullParts = [...left, ...omittedZeros, ...right];
    const expandedAddress = fullParts.map(part => part.padStart(4, '0')).join(':');
    return expandedAddress;
}

/**
 * Checks for overlapping IPv6 address ranges and returns information about each range.
 *
 * @param ranges - An array of objects containing IPv6 address ranges with their prefix lengths.
 * @returns An array of `PrefixInfo` objects containing information about each range, including whether it overlaps with any other range.
 *
 * @remarks
 * This function uses a Trie data structure to efficiently check for overlapping ranges. If an overlap is detected, the `overlap` property of the corresponding `PrefixInfo` object is set to `true`, and an `errorMessage` is provided with details about the error.
 *
 * @example
 * ```typescript
 * const ranges = [
 *  { address: '2001:db8::', prefixLength: 32 },
 * { address: '2001:db8::1', prefixLength: 128 },
 * ];
 * const result = checkOverlaps(ranges);
 * console.log(result);
 * // Output:
 * // [
 * //   { address: '2001:db8::', prefixLength: 32, overlap: false },
 * //   { address: '2001:db8::1', prefixLength: 128, overlap: true, errorMessage: { type: 'Error', message: 'Overlap detected' } }
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
        const bits = ipv6AddressToBits(range.address);

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
