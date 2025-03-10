import { useState, useEffect } from 'react';

export function useLocalStorageWithExpiry(key, expiryTime) {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem(key);
        const storedTime = localStorage.getItem(`${key}_time`);

        if (storedValue && storedTime) {
            const currentTime = new Date().getTime();
            const submittedTime = parseInt(storedTime);

            if (currentTime - submittedTime > expiryTime) {
                localStorage.removeItem(key);
                localStorage.removeItem(`${key}_time`);
                return null;
            }

            return storedValue;
        }

        return null;
    });

    useEffect(() => {
        if (value) {
            localStorage.setItem(key, value);
            localStorage.setItem(`${key}_time`, new Date().getTime().toString());
        } else {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_time`);
        }
    }, [key, value, expiryTime]);

    return [value, setValue];
}