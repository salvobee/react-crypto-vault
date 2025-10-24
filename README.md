# 🧩 React Crypto Vault

React bindings and UI components for [`@salvobee/crypto-vault`](https://www.npmjs.com/package/@salvobee/crypto-vault) —  
a browser-only, zero-dependency AES-GCM vault using the native **Web Crypto API**.

> Bring end-to-end encryption to your React apps with minimal setup and no backend requirements.

---

## ✨ Features

- 🔑 **AES-GCM-256** encryption (via Web Crypto API)
- 💾 **Session-based key storage** with React Context
- 📦 **Base64URL** serialization — safe for APIs, DBs, URLs
- 🧩 **Plug-and-play components** for encrypted content:
  - `<EncryptedText />`
  - `<EncryptedImage />`
  - `<EncryptedVideo />`
  - `<EncryptedFile />`
- ✍️ **Encryptable inputs** for editing & saving secure data:
  - `<EncryptableTextArea />`
  - `<EncryptableFileInput />`
- ⚙️ **Minimal UI**, no dependencies, pure browser APIs

---

## 📦 Installation

```bash
npm i @salvobee/react-crypto-vault
# or
pnpm add @salvobee/react-crypto-vault
# or
yarn add @salvobee/react-crypto-vault
````

> Peer dependencies:
>
> * React 19+
> * [`@salvobee/crypto-vault`](https://www.npmjs.com/package/@salvobee/crypto-vault)

---

## 🚀 Quickstart

```jsx
import React, { useState } from "react";
import {
  CryptoProvider,
  KeyManager,
  EncryptableTextArea,
  EncryptedText,
} from "@salvobee/react-crypto-vault";

export default function App() {
  const [cipher, setCipher] = useState("");

  return (
    <CryptoProvider>
      <div style={{ padding: 20 }}>
        <h2>🔐 React Crypto Vault – Demo</h2>

        <KeyManager />

        <h3>Secure Text</h3>
        <EncryptableTextArea value={cipher} onChange={setCipher} />

        <h3>Preview (Decrypted)</h3>
        <EncryptedText cipherText={cipher} />
      </div>
    </CryptoProvider>
  );
}
```

---

## 🧠 Core concept

`@salvobee/react-crypto-vault` wraps [`@salvobee/crypto-vault`](https://www.npmjs.com/package/@salvobee/crypto-vault) inside a React Context (`CryptoProvider`) that stores a symmetric AES-GCM key in **sessionStorage**.

When a valid key is present, the content components automatically decrypt what they receive — otherwise they display a placeholder (🔒).

---

## 🧩 Components Overview

### `CryptoProvider`

Wrap your app with this provider to enable encryption context.

```jsx
import { CryptoProvider } from "@salvobee/react-crypto-vault";

<CryptoProvider>
  <App />
</CryptoProvider>
```

### `useCrypto()`

A hook to access the active key.

```jsx
const { cryptoKey, setCryptoKey } = useCrypto();
```

---

### `KeyManager`

Minimal key controller:

* Generates, imports, or removes the current AES key.
* Optionally shows “Generate” and “Export” buttons.

```jsx
<KeyManager showGenerate showExport />
```

*Click the colored dot to import/remove a key.*

---

### `EncryptedText / EncryptedImage / EncryptedVideo / EncryptedFile`

Render decrypted content only when a key is active.

```jsx
<EncryptedText cipherText={cipher} />
<EncryptedImage cipherText={imgCipher} />
<EncryptedVideo cipherText={videoCipher} />
<EncryptedFile cipherText={fileCipher} filename="secret.pdf" />
```

Each component displays a 🔒 placeholder if no key is available.

---

### `EncryptableTextArea`

A textarea that automatically encrypts on blur (or manually via button).

```jsx
<EncryptableTextArea
  value={cipherText}
  onChange={setCipherText}
  autoEncrypt={true}
/>
```

Props:

* `value`: current ciphertext (Base64URL)
* `onChange`: callback receiving encrypted output
* `autoEncrypt`: whether to encrypt automatically (default `true`)
* `compress`: enable gzip compression before encrypting (default `true`)

---

### `EncryptableFileInput`

Input field for encrypting uploaded files (images, PDFs, etc.).

```jsx
<EncryptableFileInput
  onChange={setCipherFile}
  autoEncrypt={false}
  maxSizeMB={50}
/>
```

Props:

* `autoEncrypt`: automatically encrypt after selecting (default `false`)
* `maxSizeMB`: file size limit (default `50`)
* `compress`: enable gzip compression (default `true`)

---

## 🧱 API Reference (summary)

All crypto operations internally rely on the core vault package:

```js
import {
  generateAesKey,
  exportKeyToBase64,
  importKeyFromBase64,
  encryptString,
  decryptToString,
  encryptBlob,
  decryptToBlob,
} from "@salvobee/crypto-vault";
```

For full API details, see [@salvobee/crypto-vault documentation](https://www.npmjs.com/package/@salvobee/crypto-vault).

---

## 🧰 Browser requirements

* **Web Crypto API** (`crypto.subtle`)
* **CompressionStream API** (optional gzip)
* **HTTPS or localhost** context required

---

## 💬 Example UI Flow

1. User opens app → `CryptoProvider` loads key from sessionStorage.
2. If no key → `KeyManager` shows 🔴 (click to import/generate).
3. Once key is active → 🔵 content decrypts automatically.
4. TextArea/FileInput can now encrypt outgoing data for secure storage.

---

## ⚠️ Security Notes

* AES-GCM ensures confidentiality + integrity.
* Always **export & backup** your key securely.
* Keys are cleared when the browser session ends.
* Never log or send the key to analytics/backends.
* For shared access, wrap AES key with public-key crypto (future feature).

---

## 📝 License

MIT © [Salvo Bee](https://github.com/salvobee)

---

## ❤️ Acknowledgements

Built on top of the native **Web Crypto API** and **Compression Streams**,
keeping encrypted data portable, text-friendly, and React-ready.