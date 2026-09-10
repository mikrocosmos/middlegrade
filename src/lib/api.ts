export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE_URL = "/api";

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

const isFormDataBody = (body: unknown): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const localizeMessage = (status: number, message: string): string => {
  if (
    message === "Not authenticated" ||
    (status === 401 && /not authenticated/i.test(message))
  ) {
    return "Сессия истекла. Войдите снова.";
  }

  return message;
};

export async function request<T>(
  path: string,
  { method = "GET", body, params, signal }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError(0, "Нет сети");
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      signal,
      headers:
        body && !isFormDataBody(body)
          ? { "Content-Type": "application/json" }
          : undefined,
      body: body
        ? isFormDataBody(body)
          ? body
          : JSON.stringify(body)
        : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      typeof navigator !== "undefined" && !navigator.onLine
        ? "Нет сети"
        : "Не удалось связаться с сервером",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const raw =
      (payload as { error?: string } | null)?.error ??
      `Запрос завершился с кодом ${response.status}`;

    throw new ApiError(response.status, localizeMessage(response.status, raw));
  }

  return payload as T;
}
