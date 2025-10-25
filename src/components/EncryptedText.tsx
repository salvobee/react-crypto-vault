import React, { useEffect, useState } from "react";
import { decryptToString } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptedTextProps {
    cipherText: string;
    style?: React.CSSProperties;
    className?: string;
}

export default function EncryptedText({ cipherText, style, className }: EncryptedTextProps) {
    const { cryptoKey } = useCrypto();
    const [text, setText] = useState("");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;

        let cancelled = false;
        (async () => {
            try {
                const plain = await decryptToString(cipherText, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                if (!cancelled) {
                    setText(plain);
                }
            } catch (error) {
                console.error("Error decrypting text", error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cryptoKey, cipherText]);

    if (!cryptoKey) {
        return <p style={{ color: "#999" }}>🔒 Protected Content</p>;
    }

    if (!text) {
        return <progress value={progress} max={100} style={{ width: "100%" }} />;
    }

    return (
        <p className={className} style={style}>
            {text}
        </p>
    );
}
