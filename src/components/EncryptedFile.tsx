import React, { useEffect, useState } from "react";
import { decryptToBlob } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptedFileProps {
    cipherText: string;
    filename?: string;
}

export default function EncryptedFile({ cipherText, filename = "file.bin" }: EncryptedFileProps) {
    const { cryptoKey } = useCrypto();
    const [url, setUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;

        let objectUrl: string | null = null;
        let aborted = false;

        (async () => {
            try {
                const blob = await decryptToBlob(cipherText, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                if (!aborted) {
                    objectUrl = URL.createObjectURL(blob);
                    setUrl(objectUrl);
                }
            } catch (error) {
                console.error("Error decrypting file", error);
            }
        })();

        return () => {
            aborted = true;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setUrl(null);
        };
    }, [cryptoKey, cipherText]);

    if (!cryptoKey) {
        return <span style={{ color: "#999" }}>🔒 Protected File</span>;
    }

    if (!url) {
        return <progress value={progress} max={100} style={{ width: "100px" }} />;
    }

    return (
        <a href={url} download={filename}>
            📁 Download {filename}
        </a>
    );
}
