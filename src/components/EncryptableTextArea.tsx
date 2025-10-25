import React, { useEffect, useState } from "react";
import { decryptToString, encryptString } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptableTextAreaProps {
    value: string;
    onChange: (value: string) => void;
    autoEncrypt?: boolean;
    compress?: boolean;
    style?: React.CSSProperties;
    className?: string;
    placeholder?: string;
}

export default function EncryptableTextArea({
    value,
    onChange,
    autoEncrypt = true,
    compress = true,
    style,
    className,
    placeholder = "Type Here..."
}: EncryptableTextAreaProps) {
    const { cryptoKey } = useCrypto();
    const [plainText, setPlainText] = useState<string>(
        !value.startsWith("WCV1") ? value : ""
    );
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!cryptoKey || !value) return;
        if (!value.startsWith("WCV1")) {
            setPlainText(value);
            return;
        }

        setBusy(true);
        let cancelled = false;

        (async () => {
            try {
                const plain = await decryptToString(value, cryptoKey, {
                    onProgress: ({ percent }) => setProgress(percent)
                });
                if (!cancelled) {
                    setPlainText(plain);
                }
            } catch (error) {
                console.warn("Error decrypting text:", error);
            } finally {
                if (!cancelled) {
                    setBusy(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [value, cryptoKey]);

    const handleBlur = async () => {
        if (!cryptoKey || !autoEncrypt) return;
        if (!plainText) {
            onChange("");
            return;
        }
        setBusy(true);
        try {
            const packed = await encryptString(plainText, cryptoKey, { compress });
            onChange(packed);
        } catch (error) {
            console.error("Error encrypting text", error);
            alert("Errore encrypting text.");
        } finally {
            setBusy(false);
        }
    };

    const handleManualEncrypt = async () => {
        if (!cryptoKey) {
            alert("Chiave non inserita.");
            return;
        }
        setBusy(true);
        try {
            const packed = await encryptString(plainText, cryptoKey, { compress });
            onChange(packed);
            alert("Text Encrypted!");
        } catch (error) {
            console.error("Error encrypting text", error);
            alert("Errore encrypting text.");
        } finally {
            setBusy(false);
        }
    };

    if (!cryptoKey) {
        return (
            <div
                style={{
                    background: "#eee",
                    color: "#999",
                    padding: "8px",
                    borderRadius: "4px",
                    textAlign: "center"
                }}
            >
                🔒 Insert the key to modify text
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
            <textarea
                value={plainText}
                onChange={(event) => setPlainText(event.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={className}
                style={style}
            />
            {busy && <progress value={progress} max={100} style={{ width: "100%" }} />}
            {!autoEncrypt && (
                <button
                    type="button"
                    onClick={handleManualEncrypt}
                    disabled={busy}
                    style={{ fontSize: "12px", alignSelf: "flex-end" }}
                >
                    Encrypt
                </button>
            )}
        </div>
    );
}
