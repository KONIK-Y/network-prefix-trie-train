import { PrefixInfo } from "./types/types";

export class TrieNode {
    children: Map<number, TrieNode>;
    isEnd: boolean;

    constructor() {
        this.children = new Map();
        this.isEnd = false;
    }
}

export class IPv6Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(prefixBits: number[], prefixLength: number): void {
        let node = this.root;
        for (let i = 0; i < prefixLength; i++) {
            const bit = prefixBits[i];
        
            if (!node.children.has(bit)) {
                node.children.set(bit, new TrieNode());
            }
            node = node.children.get(bit)!;
        
            if (node.isEnd) {
                if (i === prefixLength - 1) {
                    throw new RangeError(`The same prefix already exists.`);
                } else {
                    throw new RangeError(`The specified prefix is included in an existing prefix.`);
                }
            }
        }
        if (node.children.size > 0) {
            throw new RangeError(`The specified prefix contains an existing prefix.`);
        }
    
        node.isEnd = true;        
    }
}

/**
 * Converts an IPv6 address to an array of bits.
 *
 * @param address - The IPv6 address to convert.
 * @returns An array of bits representing the IPv6 address.
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
 * Checks for overlapping IPv6 address ranges.
 *
 * @param ranges - An array of objects containing IPv6 address ranges and their prefix lengths.
 * @returns An array of `PrefixInfo` objects indicating whether each range overlaps with any previously inserted range.
 *
 * Each object in the `ranges` array should have the following properties:
 * - `address`: The IPv6 address as a string.
 * - `prefixLength`: The prefix length of the IPv6 address.
 *
 * Each object in the returned array will have the following properties:
 * - `address`: The IPv6 address as a string.
 * - `prefixLength`: The prefix length of the IPv6 address.
 * - `overlap`: A boolean indicating whether the range overlaps with any previously inserted range.
 * - `errorMessage` (optional): An error message if an overlap is detected.
 */
export function checkOverlaps(ranges: { address: string; prefixLength: number }[]): PrefixInfo[] {
    const trie = new IPv6Trie();
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
