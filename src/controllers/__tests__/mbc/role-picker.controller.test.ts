import { describe, expect, it, vi } from 'vitest';
import { useState, useCallback } from 'react';
import { renderHook, act } from '@testing-library/react';

import RolePickerController from '../../mbc/role-picker.controller';

function createController() {
  return renderHook(() =>
    RolePickerController({ useState, useCallback }),
  );
}

describe('RolePickerController', () => {
  it('provides 4 role options', () => {
    const { result } = createController();
    expect(result.current.roles).toHaveLength(4);
    expect(result.current.roles.map((r) => r.id)).toEqual([
      'station', 'gate', 'terminal', 'scout',
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

  it('each role has label, description, and icon', () => {
    const { result } = createController();

    for (const role of result.current.roles) {
      expect(role.label).toBeTruthy();
      expect(role.description).toBeTruthy();
      expect(role.icon).toBeTruthy();
    }
  });
});
