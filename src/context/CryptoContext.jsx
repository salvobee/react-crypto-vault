import React, { createContext, useContext, useEffect, useState } from "react";
import { importKeyFromBase64 } from "@salvobee/crypto-vault";

const CryptoContext = createContext(null);

export function useCrypto() {
    return useContext(CryptoContext);
}

export function CryptoProvider({ children }) {
    const [cryptoKey, setCryptoKey] = useState(null);

    useEffect(() => {
        const storedKey = sessionStorage.getItem("vaultKey");
        if (storedKey) {
            importKeyFromBase64(storedKey)
                .then(setCryptoKey)
                .catch((err) => console.warn("Key import failed:", err));
        }
    }, []);

    useEffect(() => {
        if (cryptoKey) {
            (async () => {
                const { exportKeyToBase64 } = await import("@salvobee/crypto-vault");
                const b64 = await exportKeyToBase64(cryptoKey);
                sessionStorage.setItem("vaultKey", b64);
            })();
        } else {
            sessionStorage.removeItem("vaultKey");
        }
    }, [cryptoKey]);

    return (
        <CryptoContext.Provider value={{ cryptoKey, setCryptoKey }}>
            {children}
        </CryptoContext.Provider>
    );
}