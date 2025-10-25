import React, { useState } from "react";
import { encryptBlob } from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface EncryptableFileInputProps {
    onChange: (value: string) => void;
    autoEncrypt?: boolean;
    maxSizeMB?: number;
    compress?: boolean;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
    displayProgress?: boolean;
}

export default function EncryptableFileInput({
    onChange,
    autoEncrypt = false,
    maxSizeMB = 50,
    compress = true,
    containerClassName,
    containerStyle = { display: "flex", flexDirection: "column", gap: "6px" },
    displayProgress = true
}: EncryptableFileInputProps) {
    const { cryptoKey } = useCrypto();
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;
        if (!selectedFile) return;

        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            alert(`File exceeds size limit of ${maxSizeMB}MB`);
            return;
        }

        setFile(selectedFile);
        if (autoEncrypt && cryptoKey) {
            void handleEncrypt(selectedFile);
        }
    };

    const handleEncrypt = async (targetFile: File | null = file) => {
        if (!targetFile) {
            alert("No file selected.");
            return;
        }
        if (!cryptoKey) {
            alert("Key not active.");
            return;
        }

        setBusy(true);
        setProgress(0);
        try {
            const packed = await encryptBlob(targetFile, cryptoKey, {
                compress,
                onProgress: ({ percent }) => setProgress(percent)
            });
            onChange(packed);
            alert("File encrypted!");
        } catch (error) {
            console.error("Error encrypting file:", error);
            alert("Errore encrypting file.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={containerClassName} style={containerStyle}>
            <input type="file" onChange={handleFileSelect} disabled={busy} />
            {file && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                    {file.name} – {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
            )}
            {displayProgress && busy && <progress value={progress} max={100} style={{ width: "100%" }} />}
            {!autoEncrypt && file && (
                <button
                    type="button"
                    onClick={() => handleEncrypt(file)}
                    disabled={!cryptoKey || busy}
                    style={{ fontSize: "12px", alignSelf: "flex-end" }}
                >
                    Encrypt File
                </button>
            )}
            {!cryptoKey && (
                <div style={{ color: "#999", fontSize: "12px", textAlign: "center" }}>
                    🔒 Turn on the Key to encrypt
                </div>
            )}
        </div>
    );
}
