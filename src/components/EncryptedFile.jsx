import React, { useEffect, useState } from "react";
import { decryptToBlob } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext.jsx";

export default function EncryptedFile({ cipherText, filename = "file.bin" }) {
    const { cryptoKey } = useCrypto();
    const [url, setUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;
        (async () => {
            try {
                const blob = await decryptToBlob(cipherText, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                const link = URL.createObjectURL(blob);
                setUrl(link);
            } catch (e) {
                console.error(e);
            }
        })();

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [cryptoKey, cipherText]);

    if (!cryptoKey)
        return <span style={{ color: "#999" }}>🔒 Protected File</span>;

    if (!url)
        return <progress value={progress} max="100" style={{ width: "100px" }} />;

    return <a href={url} download={filename}>📁 Download {filename}</a>;
}
