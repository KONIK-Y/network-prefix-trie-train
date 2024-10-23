export class TrieNode {
    children: Map<number, TrieNode>;
    isEnd: boolean;

    constructor() {
        this.children = new Map();
        this.isEnd = false;
    }
}

export class Trie {
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
    search(prefixBits: number[], prefixLength: number): boolean {
        let node = this.root;
        for (let i = 0; i < prefixLength; i++) {
            const bit = prefixBits[i];
            if (!node.children.has(bit)) {
                return false;
            }
            node = node.children.get(bit)!;
        }
        return node.isEnd;
    }
}