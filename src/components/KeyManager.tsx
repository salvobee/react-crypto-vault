import React from "react";
import {
    downloadText,
    exportKeyToBase64,
    generateAesKey,
    importKeyFromBase64
} from "@salvobee/crypto-vault";
import { useCrypto } from "../context/CryptoContext";

export interface KeyManagerProps {
    showGenerate?: boolean;
    showExport?: boolean;
}

export default function KeyManager({ showGenerate = true, showExport = true }: KeyManagerProps) {
    const { cryptoKey, setCryptoKey } = useCrypto();

    const handleToggle = async () => {
        if (cryptoKey) {
            setCryptoKey(null);
            alert("🔓 Chiave rimossa.");
            return;
        }

        const b64 = prompt("Incolla qui la chiave Base64URL da importare:");
        if (!b64) return;

        try {
            const key = await importKeyFromBase64(b64);
            setCryptoKey(key);
            alert("🔐 Chiave importata con successo!");
        } catch (error) {
            console.error("Error importing key", error);
            alert("Errore importando la chiave.");
        }
    };

    const handleGenerate = async () => {
        const key = await generateAesKey();
        setCryptoKey(key);
        alert("🔑 Nuova chiave generata.");
    };

    const handleExport = async () => {
        if (!cryptoKey) {
            alert("Nessuna chiave da esportare.");
            return;
        }
        const b64 = await exportKeyToBase64(cryptoKey);
        downloadText("vault-key.b64u.txt", b64);
        alert("Chiave esportata come file.");
    };

    const color = cryptoKey ? "#00c853" : "#d50000";
    const title = cryptoKey ? "Chiave inserita (clic per rimuovere)" : "Nessuna chiave (clic per importare)";

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
                onClick={handleToggle}
                title={title}
                role="button"
                aria-label={title}
                style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    cursor: "pointer",
                    border: "1px solid #aaa"
                }}
            />
            {showGenerate && (
                <button type="button" onClick={handleGenerate} style={{ fontSize: "12px" }}>
                    Genera
                </button>
            )}
            {showExport && (
                <button type="button" onClick={handleExport} style={{ fontSize: "12px" }}>
                    Esporta
                </button>
            )}
        </div>
    );
}
