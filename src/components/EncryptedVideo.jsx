import React, {useEffect, useState} from "react";
import {decryptToBlob} from "@salvobee/crypto-vault";
import {useCrypto} from "../context/CryptoContext.jsx";

export default function EncryptedVideo({
                                           cipherText, controls = true,
                                           videoStyle = {},
                                           progressStyle = {},
                                           protectedStyle = {
                                               width: "100%",
                                               height: "auto",
                                               background: "#eee",
                                               color: "#888",
                                               textAlign: "center",
                                               padding: "8px"
                                           },
                                           videoClassName = '',
                                           progressClassName = '',
                                           protectedClassName = ''
                                       }) {

    const {cryptoKey} = useCrypto();
    const [url, setUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!cryptoKey || !cipherText) return;
        let aborted = false;

        (async () => {
            try {
                const blob = await decryptToBlob(cipherText, cryptoKey, {
                    onProgress: ({percent}) => setProgress(percent)
                });
                if (!aborted) setUrl(URL.createObjectURL(blob));
            } catch (e) {
                console.error(e);
            }
        })();

        return () => {
            aborted = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [cryptoKey, cipherText]);

    if (!cryptoKey)
        return <div style={{background: "#eee", textAlign: "center", padding: "8px"}}>🔒</div>;
    if (!url)
        return <progress value={progress} max="100" style={progressStyle}/>;

    return <video src={url} controls={controls} style={videoStyle} className={videoClassName}/>;
}
