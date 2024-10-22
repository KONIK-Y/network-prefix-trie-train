export class TrieNode {
    children: Map<number, TrieNode>;
    isEnd: boolean;

    constructor() {
        this.children = new Map();
        this.isEnd = false;
    }
}

export interface PrefixInfo {
    address: string;
    prefixLength: number;
    overlap: boolean;
    errorMessage?: string;  
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
                    throw new Error(`重複エラー: 同じプレフィックスが既に存在します。`);
                } else {
                    throw new Error(`重複エラー: 指定されたプレフィックスは既存のプレフィックスに含まれています。`);
                }
            }
        }
        
        if (node.children.size > 0) {
            throw new Error(`重複エラー: 指定されたプレフィックスは既存のプレフィックスを包含しています。`);
        }
    
        node.isEnd = true;        
    }
}

export function ipv6AddressToBits(address: string): number[] {
    const bits: number[] = [];
    const expanded = expandIPv6Address(address);
    const parts = expanded.split(':');
    if (parts.length !== 8) {
        throw new Error(`Invalid expanded IPv6 address: ${expanded}`);
    }
    for (const part of parts) {
        const num = parseInt(part, 16);
        for (let i = 15; i >= 0; i--) {
            bits.push((num >> i) & 1);
        }
    }
    return bits;
}

export function expandIPv6Address(address: string): string {
    const parts = address.split('::');
    if (parts.length > 2) {
        throw new Error('Invalid IPv6 address');
    }
    const left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    const right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) {
        throw new Error('Invalid IPv6 address: too many parts');
    }
    const zeros = Array(missing).fill('0000');
    const fullParts = [...left, ...zeros, ...right];
    const expandedAddress = fullParts.map(part => part.padStart(4, '0')).join(':');
    return expandedAddress;
}
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
            prefixInfo.errorMessage = error.message;
        }

        prefixInfos.push(prefixInfo);
    }

    return prefixInfos;
}
