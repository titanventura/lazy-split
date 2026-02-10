export const STORAGE_KEY = 'simple-split-user-id';

export interface UserProfile {
    id: string;
    name: string;
    upi_id?: string;
}

export const getStoredUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
};

export const setStoredUserId = (id: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, id);
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const res = await fetch(`/api/user?id=${userId}`);
        const data = await res.json();
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (err) {
        console.error('Failed to fetch user profile:', err);
        return null;
    }
};

export const saveUserProfile = async (name: string, upiId?: string, id?: string): Promise<UserProfile | null> => {
    try {
        const res = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, upi_id: upiId, id }),
        });
        const data = await res.json();
        if (data.success) {
            setStoredUserId(data.data.id);
            return data.data;
        }
        return null;
    } catch (err) {
        console.error('Failed to save user profile:', err);
        return null;
    }
};
