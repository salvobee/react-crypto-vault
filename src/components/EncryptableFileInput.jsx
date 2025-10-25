import React, {useState} from "react";
import {encryptBlob} from "@salvobee/crypto-vault";
import {useCrypto} from "../context/CryptoContext.jsx";

export default function EncryptableFileInput({
                                                 onChange,
                                                 autoEncrypt = false,
                                                 maxSizeMB = 50,
                                                 compress = true,
                                                 containerClassName = "",
                                                 containerStyle = {display: "flex", flexDirection: "column", gap: "6px"},
                                                 displayProgress = true,
                                             }) {
    const {cryptoKey} = useCrypto();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);

    const handleFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > maxSizeMB * 1024 * 1024) {
            alert(`File exceeds size limit of ${maxSizeMB}MB`);
            return;
        }
        setFile(f);
        if (autoEncrypt && cryptoKey) {
            handleEncrypt(f);
        }
    };

    const handleEncrypt = async (f = file) => {
        if (!f) return alert("No file selected.");
        if (!cryptoKey) return alert("Key not active.");
        setBusy(true);
        setProgress(0);
        try {
            const packed = await encryptBlob(f, cryptoKey, {
                compress,
                onProgress: ({percent}) => setProgress(percent)
            });
            onChange(packed);
            alert("File encrypted!");
        } catch (e) {
            console.error("Errore encrypting file:", e);
            alert("Errore encrypting file.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={containerClassName} style={containerStyle}>
            <input type="file" onChange={handleFileSelect} disabled={busy}/>
            {file && (
                <div style={{fontSize: "12px", color: "#666"}}>
                    {file.name} – {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
            )}
            {displayProgress && busy && <progress value={progress} max="100" style={{width: "100%"}}/>}
            {!autoEncrypt && file && (
                <button
                    onClick={() => handleEncrypt(file)}
                    disabled={!cryptoKey || busy}
                    style={{fontSize: "12px", alignSelf: "flex-end"}}
                >
                    Encrypt File
                </button>
            )}
            {!cryptoKey && (
                <div style={{color: "#999", fontSize: "12px", textAlign: "center"}}>
                    🔒 Turn on the Key to encrypt
                </div>
            )}
        </div>
    );
}
