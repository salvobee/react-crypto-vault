import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { importKeyFromBase64 } from "@salvobee/crypto-vault";

interface CryptoContextValue {
    cryptoKey: CryptoKey | null;
    setCryptoKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
}

const CryptoContext = createContext<CryptoContextValue | undefined>(undefined);

export function useCrypto(): CryptoContextValue {
    const context = useContext(CryptoContext);
    if (!context) {
        throw new Error("useCrypto must be used within a CryptoProvider");
    }
    return context;
}

export interface CryptoProviderProps {
    children: React.ReactNode;
}

export function CryptoProvider({ children }: CryptoProviderProps) {
    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

    useEffect(() => {
        const storedKey = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vaultKey") : null;
        if (!storedKey) return;

        let cancelled = false;
        importKeyFromBase64(storedKey)
            .then((key) => {
                if (!cancelled) {
                    setCryptoKey(key);
                }
            })
            .catch((err) => console.warn("Key import failed:", err));

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!cryptoKey) {
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("vaultKey");
            }
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const { exportKeyToBase64 } = await import("@salvobee/crypto-vault");
                const b64 = await exportKeyToBase64(cryptoKey);
                if (!cancelled && typeof sessionStorage !== "undefined") {
                    sessionStorage.setItem("vaultKey", b64);
                }
            } catch (err) {
                console.warn("Key export failed:", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cryptoKey]);

    const value = useMemo(() => ({ cryptoKey, setCryptoKey }), [cryptoKey]);

    return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}
