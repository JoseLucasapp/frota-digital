export type UserRole = 'ADMIN' | 'DRIVER' | 'MECHANIC';

export type AuthUser = {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    institution?: string;
    cnpj?: string;
    [key: string]: any;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function setAuthSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        clearAuthSession();
        return null;
    }
}

export function isAuthenticated() {
    return Boolean(getAuthToken() && getAuthUser());
}