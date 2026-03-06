import crypto from 'crypto';

// IMPORTANT: In production, this key must be stored in Environment Variables (Next.js/Vercel)
// If changing the key, OLD data will be unreadable. 
// Fallback is kept for local dev/current data compatibility, but MUST BE SET in Vercel.
const KEY_SOURCE = process.env.ENCRYPTION_KEY || 'spshare-super-secret-key-32-chars';

// Smarter key handling: If hex (64 chars), use as is. Otherwise, slice/pad to 32 bytes.
const getEncryptionKey = (source: string) => {
    if (source.length === 64 && /^[0-9a-fA-F]+$/.test(source)) {
        return Buffer.from(source, 'hex');
    }
    // Fallback logic to maintain compatibility with existing data
    return Buffer.from(source).slice(0, 32);
};

const ENCRYPTION_KEY = getEncryptionKey(KEY_SOURCE);
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
    }
}

export function decrypt(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // Check if the text is in the expected format (iv:encrypted)
    if (!text.includes(':')) return text;

    try {
        const textParts = text.split(':');
        const ivHex = textParts.shift();
        const encryptedHex = textParts.join(':');

        if (!ivHex || !encryptedHex) return text;

        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // Silently fail to return empty string instead of crashing the app
        // This usually happens when the ENCRYPTION_KEY has changed
        console.warn('Decryption failed: The data might be encrypted with a different key or is corrupted.');
        return '';
    }
}
