import { describe, expect, it, vi } from 'vitest';
import { useState, useCallback, useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import RolePickerController from '../../mbc/role-picker.controller';

const mockNavigate = vi.fn();
const mockUseNavigate = () => mockNavigate;

const mockNfcService = {
  isAvailable: vi.fn(() => true),
  read: vi.fn(),
  write: vi.fn(),
  cancel: vi.fn(),
};

function createController() {
  return renderHook(() =>
    RolePickerController({
      useState,
      useCallback,
      useEffect,
      useTranslation,
      useNavigate: mockUseNavigate as never,
      nfcService: mockNfcService,
    }),
  );
}

describe('RolePickerController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides 2 primary role options (gate, terminal)', () => {
    const { result } = createController();
    expect(result.current.primaryRoles).toHaveLength(2);
    expect(result.current.primaryRoles.map((r) => r.id)).toEqual([
      'gate', 'terminal',
    ]);
  });

  it('provides 2 secondary role options (station, scout)', () => {
    const { result } = createController();
    expect(result.current.secondaryRoles).toHaveLength(2);
    expect(result.current.secondaryRoles.map((r) => r.id)).toEqual([
      'station', 'scout',
    ]);
  });

  it('starts with no active role', () => {
    const { result } = createController();
    expect(result.current.activeRole).toBeNull();
  });

  it('sets active role and navigates on onNavigateToRole', () => {
    const { result } = createController();

    act(() => {
      result.current.onNavigateToRole('gate');
    });

    expect(result.current.activeRole).toBe('gate');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/gate' });
  });

  it('changes active role on re-selection', () => {
    const { result } = createController();

    act(() => {
      result.current.onNavigateToRole('station');
    });
    expect(result.current.activeRole).toBe('station');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/station' });

    act(() => {
      result.current.onNavigateToRole('terminal');
    });
    expect(result.current.activeRole).toBe('terminal');
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/terminal' });
  });

  it('each role has labelKey, descriptionKey, color, and variant', () => {
    const { result } = createController();

    const allRoles = [...result.current.primaryRoles, ...result.current.secondaryRoles];
    for (const role of allRoles) {
      expect(role.labelKey).toBeTruthy();
      expect(role.descriptionKey).toBeTruthy();
      expect(role.color).toBeTruthy();
      expect(['gate', 'terminal', 'station', 'scout']).toContain(role.color);
      expect(['primary', 'secondary']).toContain(role.variant);
    }
  });

  it('detects NFC capability as supported', () => {
    mockNfcService.isAvailable.mockReturnValue(true);
    const { result } = createController();
    expect(result.current.nfcCapability).toBe('supported');
  });

  it('detects NFC capability as unsupported', () => {
    mockNfcService.isAvailable.mockReturnValue(false);
    const { result } = createController();
    expect(result.current.nfcCapability).toBe('unsupported');
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
