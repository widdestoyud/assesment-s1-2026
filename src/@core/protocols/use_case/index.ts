export interface UseCaseProtocol {
  useCase: <T = any>(data?: any) => T;
}
