import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,

    setIsLoggedIn: (isLoggedIn) => set(() => ({ isLoggedIn })),
    setUserInfo: (userInfo) => set(() => ({ userInfo })),

    checkLoginStatus: async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/me`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                set(() => ({
                    isLoggedIn: true,
                    userInfo: data
                }));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userInfo', JSON.stringify(data));
            } else {
                set(() => ({
                    isLoggedIn: false,
                    userInfo: null
                }));
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userInfo');
            }
        } catch (error) {
            set(() => ({
                isLoggedIn: false,
                userInfo: null
            }));
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userInfo');
        }
    }
}));