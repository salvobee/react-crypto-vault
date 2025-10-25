import React, { useEffect, useState } from "react";
import { decryptToBlob } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptedImageProps {
    cipherText: string;
    alt?: string;
    imgStyle?: React.CSSProperties;
    progressStyle?: React.CSSProperties;
    protectedStyle?: React.CSSProperties;
    imgClassName?: string;
    progressClassName?: string;
    protectedClassName?: string;
}

export default function EncryptedImage({
    cipherText,
    alt = "",
    imgStyle,
    progressStyle,
    protectedStyle = {
        width: "100%",
        height: "auto",
        background: "#eee",
        color: "#888",
        textAlign: "center",
        padding: "8px"
    },
    imgClassName,
    progressClassName,
    protectedClassName
}: EncryptedImageProps) {
    const { cryptoKey } = useCrypto();
    const [url, setUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;
        setProgress(0);

        let aborted = false;
        let objectUrl: string | null = null;

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
                console.error("Error decrypting image:", error);
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
        return (
            <div style={protectedStyle} className={protectedClassName}>
                🔒
            </div>
        );
    }

    if (!url) {
        return (
            <progress
                value={progress}
                max={100}
                style={progressStyle}
                className={progressClassName}
            />
        );
    }

    return <img className={imgClassName} style={imgStyle} src={url} alt={alt} />;
}
