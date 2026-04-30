import { LocalStorageProtocol } from '@core/protocols/storage';

export const webStorageAdapter: LocalStorageProtocol = {
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};
