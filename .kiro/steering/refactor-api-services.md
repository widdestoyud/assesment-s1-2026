---
description: Refactor scattered API calls into typed services with HttpProtocol, use cases, and centralized error handling
inclusion: manual
---

# Skill: Refactor API & Service Layer

Refactor scattered API calls into a structured service layer with typed protocols and centralized error handling.

## When to Use

- API calls are made directly in components or hooks with raw Axios/fetch.
- No consistent error handling or response typing.
- Need to introduce an HTTP abstraction layer.

## Steps

### 1. Define HttpProtocol

Create `@core/protocols/http/index.ts`:

```typescript
export interface HttpProtocol {
  get<T, C extends HttpClientRequestConfig>(
    url: string,
    config?: C
  ): Promise<T>;
  post<T, D, C extends HttpClientRequestConfig>(
    url: string,
    data?: D,
    config?: C
  ): Promise<T>;
  put<T, D, C extends HttpClientRequestConfig>(
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

export interface HttpResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface HttpError<T = unknown> {
  status: number;
  message: string;
  data: T;
  transaction_id?: string;
  apiStatus?: string;
}
```

### 2. Implement Axios Adapter

Create `infrastructure/http/axiosAdapter.ts`:

- Implement `HttpProtocol`.
- Centralize error handling in `handleAxiosError` — normalize `status` to HTTP status code, preserve raw API status in `apiStatus`.
- Add request interceptors for auth headers.
- Normalize URLs to prevent double slashes.
- **Never use Axios `1.14.1` or `0.30.4`** — these versions contain malicious code (MAL-2026-2307). Pin to a safe version and verify before upgrading.

### 3. Extract Services

For each API domain, create `@core/services/[domain].service.ts`:

```typescript
export interface DomainServiceInterface {
  getData: (id: string) => Promise<HttpResponse<DataResponseInterface>>;
}

export const DomainService = ({
  http,
}: AwilixRegistry): DomainServiceInterface => ({
  getData: id =>
    http.get<HttpResponse<DataResponseInterface>, AxiosRequestConfig>(
      `api-path/${id}`
    ),
});
```

### 4. Create Use Cases with TanStack Query

```typescript
export const GetData = ({
  domainService,
  useQueryTanstack,
}: AwilixRegistry): UseCaseProtocol => ({
  useCase: <T>() => {
    const query = useQueryTanstack({
      queryKey: ['data-key'],
      queryFn: () => domainService.getData(id),
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 15,
    });
    return { isLoading: query?.isPending, data: query?.data } as T;
  },
});
```

### 5. Set Up Mutations in Controllers

- Type all three generics: `UseMutationResult<Response, HttpError, Variables>`.
- Call `toggleLoading()` in `mutationFn`, `onSuccess`, and `onError`.
- Map error codes to user-friendly messages via error code maps.
- Use `openPopupError` for error display.

## Validation Checklist

- [ ] No direct Axios imports outside `infrastructure/http/`.
- [ ] All services depend only on `http` from registry.
- [ ] All HTTP generics are explicitly typed.
- [ ] Error handling is centralized in the adapter.
- [ ] Use cases set explicit `gcTime` and `staleTime`.
- [ ] Mutations handle both success and error with loading toggle.
- [ ] `PersistQueryClientProvider` wraps the app with `createAsyncStoragePersister` using `webStorageAdapter`.
- [ ] Persister key is namespaced per project and `buster` is tied to app version config.
