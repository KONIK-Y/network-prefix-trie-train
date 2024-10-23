export interface PrefixInfo {
    address: string;
    prefixLength: number;
    overlap: boolean;
    errorMessage?: ErrorInfo;
}

export interface ErrorInfo{
    type: string;
    message: string;
}