import React, { useEffect, useState } from "react";
import { decryptToBlob } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptedVideoProps {
    cipherText: string;
    controls?: boolean;
    videoStyle?: React.CSSProperties;
    progressStyle?: React.CSSProperties;
    protectedStyle?: React.CSSProperties;
    videoClassName?: string;
    progressClassName?: string;
    protectedClassName?: string;
}

export default function EncryptedVideo({
    cipherText,
    controls = true,
    videoStyle,
    progressStyle,
    protectedStyle = {
        width: "100%",
        height: "auto",
        background: "#eee",
        color: "#888",
        textAlign: "center",
        padding: "8px"
    },
    videoClassName,
    progressClassName,
    protectedClassName
}: EncryptedVideoProps) {
    const { cryptoKey } = useCrypto();
    const [url, setUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;

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
                console.error("Error decrypting video", error);
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

    return <video src={url} controls={controls} style={videoStyle} className={videoClassName} />;
}
