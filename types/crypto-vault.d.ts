declare module "@salvobee/crypto-vault" {
    export interface ProgressEvent {
        percent: number;
    }

    export interface EncryptOptions {
        compress?: boolean;
        onProgress?: (event: ProgressEvent) => void;
    }

    export interface DecryptOptions {
        onProgress?: (event: ProgressEvent) => void;
    }

    export function generateAesKey(): Promise<CryptoKey>;
    export function exportKeyToBase64(key: CryptoKey): Promise<string>;
    export function importKeyFromBase64(serialized: string): Promise<CryptoKey>;
    export function downloadText(filename: string, contents: string): void;
    export function encryptString(plainText: string, key: CryptoKey, options?: EncryptOptions): Promise<string>;
    export function decryptToString(cipherText: string, key: CryptoKey, options?: DecryptOptions): Promise<string>;
    export function encryptBlob(blob: Blob, key: CryptoKey, options?: EncryptOptions): Promise<string>;
    export function decryptToBlob(cipherText: string, key: CryptoKey, options?: DecryptOptions): Promise<Blob>;
}
