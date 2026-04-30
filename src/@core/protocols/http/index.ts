export interface HttpProtocol {
  get<T, C extends HttpClientRequestConfig>(
    url: string,
    config?: C
  ): Promise<T>;

  put<T, D, C extends HttpClientRequestConfig>(
    url: string,
    data?: D,
    config?: C
  ): Promise<T>;

  post<T, D, C extends HttpClientRequestConfig>(
    url: string,
    data?: D,
    config?: C
  ): Promise<T>;

  delete<T, C extends HttpClientRequestConfig>(
    url: string,
    config?: C
  ): Promise<T>;

  patch<T, D, C extends HttpClientRequestConfig>(
    url: string,
    data?: D,
    config?: C
  ): Promise<T>;
}

export interface HttpClientRequestConfig {
  headers?: any;
  params?: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse<D> {
  data: D;
  status: number | string;
  message: string;
  transaction_id: string;
}
