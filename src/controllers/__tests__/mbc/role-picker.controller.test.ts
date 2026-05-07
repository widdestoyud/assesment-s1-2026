import { describe, expect, it } from 'vitest';
import { useState, useCallback } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import RolePickerController from '../../mbc/role-picker.controller';

function createController() {
  return renderHook(() =>
    RolePickerController({ useState, useCallback, useTranslation }),
  );
}

describe('RolePickerController', () => {
  it('provides 4 role options', () => {
    const { result } = createController();
    expect(result.current.roles).toHaveLength(4);
    expect(result.current.roles.map((r) => r.id)).toEqual([
      'gate', 'terminal', 'station', 'scout',
    ]);
  });

  it('starts with no active role', () => {
    const { result } = createController();
    expect(result.current.activeRole).toBeNull();
  });

  it('sets active role on selection', () => {
    const { result } = createController();

    act(() => {
      result.current.onSelectRole('gate');
    });

    expect(result.current.activeRole).toBe('gate');
  });

  it('changes active role on re-selection', () => {
    const { result } = createController();

    act(() => {
      result.current.onSelectRole('station');
    });
    expect(result.current.activeRole).toBe('station');

    act(() => {
      result.current.onSelectRole('terminal');
    });
    expect(result.current.activeRole).toBe('terminal');
  });

  it('each role has label, descriptionKey, icon, and color', () => {
    const { result } = createController();

    for (const role of result.current.roles) {
      expect(role.label).toBeTruthy();
      expect(role.descriptionKey).toBeTruthy();
      expect(role.icon).toBeTruthy();
      expect(role.color).toBeTruthy();
      expect(['blue', 'green', 'orange', 'purple']).toContain(role.color);
    }
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
