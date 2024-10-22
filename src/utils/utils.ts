/**
 * Convert an IP address string to its corresponding integer representation.
 *
 * @param ip - The IP address to convert.
 * @returns The integer representation of the IP address.
 * @throws {Error} If the IP address is invalid.
 */
function ipToInt(ip: string): number {
    const octets:number[] = ip.split('.').map(Number);
    if (octets.length !== 4 || octets.some(octet => isNaN(octet) || octet < 0 || octet > 255)) {
        throw new Error('Invalid IP address');
    }
    return ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0);
}

function cidrToRange(cidr: string): {start: number, end: number} {
    let ip: string;
    let prefixLength: number;

    const parts = cidr.split('/');
    ip = parts[0];
    if (parts.length === 2) {
        prefixLength = parseInt(parts[1], 10);
        if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
            throw new Error('Invalid prefix length in CIDR notation');
        }
    } else if (parts.length === 1) {
        // No prefix length, treat as /32
        prefixLength = 32;
    } else {
        throw new Error('Invalid CIDR notation');
    }

    const ipInt = ipToInt(ip);

    const mask = prefixLength === 0 ? 0 : (0xFFFFFFFF << (32 - prefixLength)) >>> 0;

    const networkAddress = ipInt & mask;
    const broadcastAddress = networkAddress | (~mask >>> 0);

    return {start: networkAddress >>> 0, end: broadcastAddress >>> 0};
}

function rangesOverlap(range1: {start: number, end: number}, range2: {start: number, end: number}): boolean {
    return !(range1.end < range2.start || range2.end < range1.start);
}

function ipRangesOverlap(cidr1: string, cidr2: string): boolean {
    const range1 = cidrToRange(cidr1);
    const range2 = cidrToRange(cidr2);
    return rangesOverlap(range1, range2);
}
