const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5555/api').replace(/\/$/, '');

export type ApiRequestOptions = RequestInit & {
    params?: Record<string, string | number | boolean | undefined | null>;
    skipAuth?: boolean;
};

export class ApiError extends Error {
    status: number;
    payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.status = status;
        this.payload = payload;
    }
}

function getToken() {
    return localStorage.getItem('auth_token');
}

function buildUrl(path: string, params?: ApiRequestOptions['params']) {
    const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

async function parseResponse(response: Response) {
    const text = await response.text();
    let payload: unknown = null;

    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    if (!response.ok) {
        const message =
            typeof payload === 'object' &&
                payload !== null &&
                'message' in payload &&
                typeof (payload as any).message === 'string'
                ? (payload as any).message
                : `Request failed with status ${response.status}`;

        throw new ApiError(message, response.status, payload);
    }

    return payload;
}

export async function apiRequest<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    const isFormData = options.body instanceof FormData;

    if (!isFormData && options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (!options.skipAuth) {
        const token = getToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(buildUrl(path, options.params), {
        ...options,
        headers,
    });

    return parseResponse(response) as T;
}

export const api = {
    get: <T = any>(path: string, params?: ApiRequestOptions['params'], options?: Omit<ApiRequestOptions, 'method' | 'params'>) =>
        apiRequest<T>(path, { ...options, method: 'GET', params }),
    post: <T = any>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
        apiRequest<T>(path, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        }),
    put: <T = any>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
        apiRequest<T>(path, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        }),
    delete: <T = any>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
        apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

export { API_BASE };