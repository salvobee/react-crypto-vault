import React, { useEffect, useState } from "react";
import {
    encryptString,
    decryptToString
} from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext.jsx";

export default function EncryptableTextArea({
                                                value,
                                                onChange,
                                                autoEncrypt = true,
                                                compress = true,
                                                style = {},
                                                placeholder = "Scrivi qui..."
                                            }) {
    const { cryptoKey } = useCrypto();
    const [plainText, setPlainText] = useState("");
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);

    // Decrypts if value is encrypted and key is "on"
    useEffect(() => {
        if (!cryptoKey || !value || typeof value !== "string") return;
        if (!value.startsWith("WCV1")) return; // già plaintext
        setBusy(true);
        (async () => {
            try {
                const plain = await decryptToString(value, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                setPlainText(plain);
            } catch (e) {
                console.warn("Error decrypting text:", e);
            } finally {
                setBusy(false);
            }
        })();
    }, [value, cryptoKey]);

    // Crittazione automatica all’uscita (blur)
    const handleBlur = async () => {
        if (!cryptoKey || !autoEncrypt) return;
        if (!plainText) return onChange("");
        setBusy(true);
        try {
            const packed = await encryptString(plainText, cryptoKey, { compress });
            onChange(packed);
        } catch (e) {
            console.error(e);
            alert("Errore crittando il testo.");
        } finally {
            setBusy(false);
        }
    };

    const handleManualEncrypt = async () => {
        if (!cryptoKey) return alert("Chiave non inserita.");
        setBusy(true);
        try {
            const packed = await encryptString(plainText, cryptoKey, { compress });
            onChange(packed);
            alert("Testo crittato!");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
            {cryptoKey ? (
                <>
          <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              style={{ width: "100%", minHeight: "100px", fontFamily: "monospace", ...style }}
          />
                    {busy && <progress value={progress} max="100" style={{ width: "100%" }} />}
                    {!autoEncrypt && (
                        <button
                            onClick={handleManualEncrypt}
                            disabled={busy}
                            style={{ fontSize: "12px", alignSelf: "flex-end" }}
                        >
                            Encrypt
                        </button>
                    )}
                </>
            ) : (
                <div style={{
                    background: "#eee",
                    color: "#999",
                    padding: "8px",
                    borderRadius: "4px",
                    textAlign: "center"
                }}>
                    🔒 Insert the key to modify text
                </div>
            )}
        </div>
    );
}
