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

export class IPv4Trie {
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

export function checkOverlaps(ranges: { address: string; prefixLength: number }[]): PrefixInfo[] {
    const trie = new IPv4Trie();
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
            prefixInfo.errorMessage = error.message;
        }

        prefixInfos.push(prefixInfo);
    }

    return prefixInfos;
}
