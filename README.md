# Network Prefix Trie
This project was created as a learning project for practicing trie algorithms.

It provides classes and functions for checking overlapping address ranges using the Trie data structure, as well as converting IPv4 and IPv6 addresses into bit representations and expanding omitted zeros.

## Overview
### Class Methods
| name | description                                  | path      |
| -------- | ----------------------------------- | ----------- |
| `insert` | Inserts a network prefix into the Trie and checks for overlaps. | `./trie.ts` |

### Functions
| name                 | description                                       | path                                |
| ------------------- | ---------------------------------------- | ------------------------------------- |
| `ipv6AddressToBits` | Converts an IPv6 address to a bit array. Expands omitted zeros.     | `./ipv6-utils.ts`                     |
| `expandIPv6Address` | Expands a compressed IPv6 address into its full representation.               | `./ipv6-utils.ts`                     |
| `checkOverlaps`     | Checks for overlapping IPv4 or IPv6 address ranges and returns information for each range. | `./ipv6-utils.ts`, `./ipv4-utils.ts`  |
| `ipv4AddressToBits` | Converts an IPv4 address to a bit array.                    | `./ipv4-utils.ts`                     |

## Usage
This project provides a Trie data structure for storing and checking overlapping network prefixes. The primary classes and functions help manage both IPv4 and IPv6 address ranges, including converting addresses to bit arrays and detecting overlaps.

### Example: Insert Prefix into Trie
To insert a prefix into the Trie, use the insert method provided by the Trie class. Before insertion, convert the IPv4 or IPv6 address to a bit array using the appropriate function. Here's an example of how to use it with actual IP addresses and prefixes:
```typescript
import { Trie } from './trie';
import { ipv4AddressToBits } from './ipv4-utils';

const trie = new Trie();
const ipv4Address = '192.168.0.0';
const prefixLength = 24;
const prefixBits = ipv4AddressToBits(ipv4Address); // Convert IPv4 address to bit array

try {
  trie.insert(prefixBits, prefixLength);
  console.log('Prefix inserted successfully.');
} catch (error) {
  console.error(`Failed to insert prefix: ${error.message}`);
}
```

### Example: Convert IPv6 Address to Bit Array
To convert an IPv6 address to a bit array, use the ipv6AddressToBits function:

```typescript
import { ipv6AddressToBits } from './ipv6-utils';

const ipv6Address = '2001:db8::1';
const bits = ipv6AddressToBits(ipv6Address);
console.log(bits); // Output: [1, 1, 0, 0, 0, 0, 0, 0, ...]
```

### Example: Check for Overlapping Prefixes
To check for overlapping prefixes, use the checkOverlaps function:

```typescript
import { checkOverlaps } from './ipv6-utils';

const ranges = [
  { address: '2001:db8::', prefixLength: 32 },
  { address: '2001:db8::1', prefixLength: 128 },
];

const result = checkOverlaps(ranges);
console.log(result);
// Output:
// [
//   { address: '2001:db8::', prefixLength: 32, overlap: false },
//   { address: '2001:db8::1', prefixLength: 128, overlap: true, errorMessage: { type: 'Error', message: 'Overlap detected' } }
// ]
```
### Example: Expanding an IPv6 Address

You can use the expandIPv6Address function to expand a compressed IPv6 address into its full representation:
```typescript
import { expandIPv6Address } from './ipv6-utils';

const compressedAddress = '2001:db8::';
const expandedAddress = expandIPv6Address(compressedAddress);
console.log(expandedAddress); // Output: '2001:0db8:0000:0000:0000:0000:0000:0000'
```

## Testing

To run tests for this project, you can use the following command:
```sh
npm test
```
The tests include both unit tests for individual functions and integration tests to verify prefix insertion and overlap detection.
