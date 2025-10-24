import React, {useEffect, useState} from "react";
import {decryptToBlob} from "@salvobee/crypto-vault";
import {useCrypto} from "../context/CryptoContext.jsx";

export default function EncryptedImage({
                                           cipherText, alt = "",
                                           imgStyle = {},
                                           progressStyle = {},
                                           protectedStyle = {
                                               width: "100%",
                                               height: "auto",
                                               background: "#eee",
                                               color: "#888",
                                               textAlign: "center",
                                               padding: "8px"
                                           },
                                           imgClassName = '',
                                           progressClassName = '',
                                           protectedClassName = ''
                                       }) {
    const {cryptoKey} = useCrypto();
    const [url, setUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;
        let aborted = false;
        setProgress(0);

        (async () => {
            try {
                const blob = await decryptToBlob(cipherText, cryptoKey, {
                    onProgress: ({percent}) => setProgress(percent)
                });
                if (!aborted) {
                    setUrl(URL.createObjectURL(blob));
                }
            } catch (err) {
                console.error("Error decrypting image:", err);
            }
        })();

        return () => {
            aborted = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [cryptoKey, cipherText]);

    if (!cryptoKey)
        return <div style={protectedStyle} className={progressClassName}>🔒</div>;

    if (!url)
        return <progress value={progress} max="100" style={progressStyle} className={progressClassName} />;

    return <img className={imgClassName} style={imgStyle} src={url} alt={alt}/>;
}
