import React, { useEffect, useState } from "react";
import { decryptToString } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext.jsx";

export default function EncryptedText({ cipherText, style = {}, className = {} }) {
    const { cryptoKey } = useCrypto();
    const [text, setText] = useState("");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;
        (async () => {
            try {
                const plain = await decryptToString(cipherText, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                setText(plain);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [cryptoKey, cipherText]);

    if (!cryptoKey)
        return <p style={{ color: "#999" }}>🔒 Protected Content</p>;

    if (!text)
        return <progress value={progress} max="100" style={{ width: "100%" }} />;

    return <p className={className} style={style}>{text}</p>;
}
