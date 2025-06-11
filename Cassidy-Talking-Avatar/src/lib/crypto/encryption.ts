const masterKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

/**
 * Derives a crypto key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM with Web Crypto API
 * @param data - The string data to encrypt
 * @param encryptionKey - The password/key to use for encryption
 * @returns Promise<string> - Base64 encoded encrypted data with salt and IV
 */
const encrypt = async (data:string , encryptionKey: string): Promise<string> => {
  if (!data || !encryptionKey) {
    throw new Error('Data and encryption key are required');
  }

  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  
  const key = await deriveKey(encryptionKey, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(data)
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64 for easy storage/transmission
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypts data using AES-GCM with Web Crypto API
 * @param encryptedData - Base64 encoded encrypted data
 * @param encryptionKey - The password/key used for encryption
 * @returns Promise<string> - The decrypted string
 */
const decrypt = async (encryptedData:string, encryptionKey:string ): Promise<string> => {
  if (!encryptedData || !encryptionKey) {
    throw new Error('Encrypted data and encryption key are required');
  }

  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveKey(encryptionKey, salt);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed: Invalid data or wrong key');
  }
};

export { encrypt, decrypt, masterKey };

