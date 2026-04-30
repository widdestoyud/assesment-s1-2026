import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { HttpClientRequestConfig, HttpProtocol } from '@core/protocols/http';
import config from '@src/infrastructure/config';

function normalizeUrl(url: string): string {
  return url.replace(/([^:]\/)\/+/g, '$1');
}

const axiosAdapter = ({
  requestInterceptor,
  refreshInterceptor,
}: {
  requestInterceptor?: (
    config: InternalAxiosRequestConfig
  ) => Promise<InternalAxiosRequestConfig>;
  refreshInterceptor?: (config: InternalAxiosRequestConfig) => AxiosInstance;
}): HttpProtocol => {
  const axiosInstance = axios.create({
    baseURL: config.api.url,
    timeout: config.api.timeout,
  });

  if (requestInterceptor) {
    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return requestInterceptor(config);
      },
      error => {
        return error;
      }
    );
  }

  if (refreshInterceptor) {
    axiosInstance.interceptors.response.use(
      response => response,
      error => {
        const originalRequest: InternalAxiosRequestConfig = error.config;
        if (error.response.status === 401 || error.response.status === 403) {
          return refreshInterceptor(originalRequest);
        }

        return error;
      }
    );
  }

  return {
    get: async <T, C extends HttpClientRequestConfig>(
      url: string,
      config?: C
    ) => {
      try {
        const cleanUrl = normalizeUrl(url);
        const response = await axiosInstance.get(cleanUrl, config);
        return response.data as T;
      } catch (e) {
        return handleAxiosError(e);
      }
    },
    post: async <T, D, C extends HttpClientRequestConfig>(
      url: string,
      data?: D,
      config?: C
    ) => {
      try {
        const cleanUrl = normalizeUrl(url);
        const response = await axiosInstance.post(cleanUrl, data, config);
        return response.data as T;
      } catch (e) {
        return handleAxiosError(e);
      }
    },
    put: async <T, D, C extends HttpClientRequestConfig>(
      url: string,
      data?: D,
      config?: C
    ) => {
      try {
        const cleanUrl = normalizeUrl(url);
        const response = await axiosInstance.put(cleanUrl, data, config);
        return response.data as T;
      } catch (e) {
        return handleAxiosError(e);
      }
    },
    patch: async <T, D, C extends HttpClientRequestConfig>(
      url: string,
      data?: D,
      config?: C
    ) => {
      try {
        const cleanUrl = normalizeUrl(url);
        const response = await axiosInstance.put(cleanUrl, data, config);
        return response.data as T;
      } catch (e) {
        return handleAxiosError(e);
      }
    },
    delete: async <T, C extends HttpClientRequestConfig>(
      url: string,
      config?: C
    ) => {
      try {
        const cleanUrl = normalizeUrl(url);
        const response = await axiosInstance.delete(cleanUrl, config);
        return response.data as T;
      } catch (e) {
        return handleAxiosError(e);
      }
    },
  };
};

const handleAxiosError = <T>(error: any): Promise<T> => {
  if (axios.isAxiosError(error)) {
    return Promise.reject(error.response?.data);
  }
  return Promise.reject(error);
};

export default axiosAdapter;
