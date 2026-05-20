import { describe, expect, it, vi } from 'vitest';

// --- config.ts ---
import config from '@infra/config';

describe('infrastructure/config', () => {
  it('exports config object with expected keys', () => {
    expect(config).toBeDefined();
    expect(config.minTopUp).toBe(2000);
    expect(config.maxBalance).toBe(300000);
    expect(config.silentShield).toBeDefined();
    expect(config.silentShield.algorithm).toBe('AES-GCM');
    expect(config.silentShield.keyLength).toBe(32);
    expect(config.silentShield.ivLength).toBe(12);
    expect(config.silentShield.tagLength).toBe(16);
    expect(config.silentShield.iterations).toBe(100000);
  });
});

// --- images.ts ---
import images from '@infra/images';

describe('infrastructure/images', () => {
  it('exports image paths', () => {
    expect(images).toBeDefined();
    expect(images.success).toBeDefined();
    expect(images.tapNfc).toBeDefined();
    expect(images.nfcFailed).toBeDefined();
    expect(images.nfcLoadDataFailed).toBeDefined();
    expect(images.nfcWarningHuman).toBeDefined();
    expect(images.nfcSuccessHuman).toBeDefined();
  });
});

// --- DI container.ts ---
import container from '@di/container';

describe('infrastructure/di/container', () => {
  it('creates and exports a DI container', () => {
    expect(container).toBeDefined();
    expect(container.resolve).toBeDefined();
  });
});

// --- DI registry modules ---
import { registerHelperModules } from '@di/registry/helperContainer';
import { registerLibraryModule } from '@di/registry/libraryContainer';
import { registerMbcControllerModules } from '@di/registry/mbcControllerContainer';
import { registerMbcProtocolModules } from '@di/registry/mbcProtocolContainer';
import { registerMbcServiceModules } from '@di/registry/mbcServiceContainer';
import { registerMbcUseCaseModules } from '@di/registry/mbcUseCaseContainer';

describe('DI registry modules', () => {
  it('registerHelperModules is a function', () => {
    expect(typeof registerHelperModules).toBe('function');
  });

  it('registerLibraryModule is a function', () => {
    expect(typeof registerLibraryModule).toBe('function');
  });

  it('registerMbcControllerModules is a function', () => {
    expect(typeof registerMbcControllerModules).toBe('function');
  });

  it('registerMbcProtocolModules is a function', () => {
    expect(typeof registerMbcProtocolModules).toBe('function');
  });

  it('registerMbcServiceModules is a function', () => {
    expect(typeof registerMbcServiceModules).toBe('function');
  });

  it('registerMbcUseCaseModules is a function', () => {
    expect(typeof registerMbcUseCaseModules).toBe('function');
  });
});

// --- NFC adapter ---
import { webNfcAdapter } from '@src/infrastructure/nfc/webNfcAdapter';

describe('infrastructure/nfc/webNfcAdapter', () => {
  it('exports webNfcAdapter with expected interface', () => {
    expect(webNfcAdapter).toBeDefined();
    expect(typeof webNfcAdapter.isSupported).toBe('function');
    expect(typeof webNfcAdapter.queryPermission).toBe('function');
    expect(typeof webNfcAdapter.startScan).toBe('function');
    expect(typeof webNfcAdapter.write).toBe('function');
  });

  it('isSupported returns boolean', () => {
    const result = webNfcAdapter.isSupported();
    expect(typeof result).toBe('boolean');
  });
});
