import React, { useState } from "react";
import {
    encryptBlob
} from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext.jsx";

export default function EncryptableFileInput({
                                                 onChange,
                                                 autoEncrypt = false,
                                                 maxSizeMB = 50,
                                                 compress = true
                                             }) {
    const { cryptoKey } = useCrypto();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);

    const handleFileSelect = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > maxSizeMB * 1024 * 1024) {
            alert(`Il file supera il limite di ${maxSizeMB}MB`);
            return;
        }
        setFile(f);
        if (autoEncrypt && cryptoKey) {
            handleEncrypt(f);
        }
    };

    const handleEncrypt = async (f = file) => {
        if (!f) return alert("Nessun file selezionato.");
        if (!cryptoKey) return alert("Chiave non inserita.");
        setBusy(true);
        setProgress(0);
        try {
            const packed = await encryptBlob(f, cryptoKey, {
                compress,
                onProgress: ({ percent }) => setProgress(percent)
            });
            onChange(packed);
            alert("File crittato con successo!");
        } catch (e) {
            console.error("Errore crittando file:", e);
            alert("Errore nella crittazione del file.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input type="file" onChange={handleFileSelect} disabled={busy} />
            {file && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                    {file.name} – {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
            )}
            {busy && <progress value={progress} max="100" style={{ width: "100%" }} />}
            {!autoEncrypt && file && (
                <button
                    onClick={() => handleEncrypt(file)}
                    disabled={!cryptoKey || busy}
                    style={{ fontSize: "12px", alignSelf: "flex-end" }}
                >
                    Crittografa file
                </button>
            )}
            {!cryptoKey && (
                <div style={{ color: "#999", fontSize: "12px", textAlign: "center" }}>
                    🔒 Inserisci la chiave per crittare
                </div>
            )}
        </div>
    );
}
