import { Buffer } from 'buffer';
import * as crypto from 'crypto-browserify';
import config from '@src/infrastructure/config';

export const encryptAuthHeader = (authHeader: string) => {
  const algorithm = config.encrypt.algo;
  const password = config.dev ? 'preprod' : config.nodeEnv;

  // For AES-128, the key should be 16 bytes (128 bits)
  const key = crypto
    .pbkdf2Sync(password, config.signature.clientId, 100000, 16, 'sha256')
    .toString('hex')
    .slice(0, 16);

  // IV should be 16 bytes for AES (same as block size)
  const iv = crypto.randomBytes(8).toString('hex');

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(authHeader, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Combine IV and encrypted data
  const result = iv + encrypted;

  return Buffer.from(result, 'hex').toString('base64');
};

export const decryptAuthHeader = (cipheredAuthHeader: string) => {
  const algorithm = config.encrypt.algo;
  const password = config.dev ? 'preprod' : config.nodeEnv;

  // Decode from base64 first
  const decoded = Buffer.from(cipheredAuthHeader, 'base64').toString('hex');

  // Extract IV (first 32 hex characters for 16-byte IV)
  const iv = decoded.substring(0, 16);

  // The rest is the encrypted data
  const encrypted = decoded.substring(16);

  // Derive the same key (16 bytes for AES-128)
  const key = crypto
    .pbkdf2Sync(password, config.signature.clientId, 100000, 16, 'sha256')
    .toString('hex')
    .slice(0, 16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
