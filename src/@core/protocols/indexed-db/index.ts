export interface IndexedDbProtocol {
  get<T>(storeName: string, key: string): Promise<T | undefined>;

  set<T>(storeName: string, key: string, value: T): Promise<void>;

  delete(storeName: string, key: string): Promise<void>;

  getAll<T>(storeName: string): Promise<T[]>;

  isAvailable(): Promise<boolean>;
}
