import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';

type AuthContextType = {
    isAuthenticated: boolean;
    isAppUsageExpired: boolean;
    userData: any;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    updateUserDataNow: () => Promise<void>;
    setUserDataStorage: (data: any) => Promise<void>;
    getUserDataStorage: () => Promise<any>;
    updateUserDataOnServer: (userId: string, data: any) => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isAppUsageExpired: false,
    userData: null,
    token: null,
    login: async () => {},
    logout: () => {},
    updateUserDataNow: async () => {},
    setUserDataStorage: async () => {},
    getUserDataStorage: async () => {},
    updateUserDataOnServer: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const encodeBase64 = (str: string): string => {
    return Buffer.from(str).toString('base64');
};

const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('authToken');
};

const setToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync('authToken', token);
};

const deleteToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
};

const setUserDataStorage = async (data: any): Promise<void> => {
    await deleteUserDataStorage();
    await SecureStore.setItemAsync('userData', JSON.stringify(data));
};

const getUserDataStorage = async (): Promise<any> => {
    const data = await SecureStore.getItemAsync('userData');
    return data ? JSON.parse(data) : null;
};

const deleteUserDataStorage = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('userData');
};

const updateUserDataOnServer = async (userId: string, data: any): Promise<any> => {
    try {
        const token = await getToken();
        if (!token) {
            throw 'Токен авторизации отсутствует';
        }

        console.log('Data', data);
        console.log('UserId', userId);
        console.log('token', token);

        const response = await fetch(`https://sandoctor.ru/api/v1/user/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw 'Не удалось обновить данные на сервере';
        }

        return await response.json();
    } catch (error: any) {
        const errorMessage = error.message?.includes('Network request failed')
            ? 'Ошибка подключения к серверу'
            : typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
        console.error('Ошибка:', errorMessage);
        throw errorMessage;
    }
};

const setFirstLaunchDate = async (date: string): Promise<void> => {
    await SecureStore.setItemAsync('firstLaunchDate', date);
};

const getFirstLaunchDate = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('firstLaunchDate');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isAppUsageExpired, setIsAppUsageExpired] = useState(false);

    useEffect(() => {
        const checkAuthAndUsage = async () => {
            try {
                const token = await getToken();
                const userData = await getUserDataStorage();
                const isExpired = await checkAppUsageExpiry();

                if (isExpired) {
                    setIsAppUsageExpired(true);
                    return;
                }

                if (token && userData) {
                    setIsAuthenticated(true);
                    setTokenState(token);
                    setUserData(userData);
                }
            } catch (error: any) {
                const errorMessage = typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
                console.error('Ошибка при проверке авторизации:', errorMessage);
            }
        };
        checkAuthAndUsage();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const token = encodeBase64(`${username}:${password}`);
            const response = await fetch('https://sandoctor.ru/api/v1/authorization/', {
                method: 'GET',
                headers: {
                    Authorization: token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Data', data);
                await setToken(token);
                await setUserDataStorage(data);
                setTokenState(token);
                setUserData(data);
                setIsAuthenticated(true);
            } else {
                throw 'Не удалось авторизоваться';
            }
        } catch (error: any) {
            const errorMessage = error.message?.includes('Network request failed')
                ? 'Ошибка подключения к серверу'
                : typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
            console.error('Ошибка:', errorMessage);
            throw errorMessage;
        }
    };

    const logout = async () => {
        try {
            await deleteToken();
            await deleteUserDataStorage();
            setTokenState(null);
            setUserData(null);
            setIsAuthenticated(false);
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
            console.error('Ошибка при выходе из системы:', errorMessage);
            throw 'Не удалось выйти из системы';
        }
    };

    const checkAppUsageExpiry = async (): Promise<boolean> => {
        try {
            const firstLaunchDate = await getFirstLaunchDate();
            if (!firstLaunchDate) {
                await setFirstLaunchDate(new Date().toISOString());
                return false;
            }

            const currentDate = new Date();
            const launchDate = new Date(firstLaunchDate);
            const diffTime = Math.abs(currentDate.getTime() - launchDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays > 7;
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
            console.error('Ошибка при проверке срока использования:', errorMessage);
            throw 'Не удалось проверить срок использования приложения';
        }
    };

    const updateUserDataNow = async () => {
        try {
            const storedData = await getUserDataStorage();
            setUserData(storedData);
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error.message.replace(/^Error:\s*/, '');
            console.error('Ошибка при обновлении данных:', errorMessage);
            throw 'Не удалось обновить данные пользователя';
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAppUsageExpired,
            userData,
            token,
            login,
            logout,
            setUserDataStorage,
            getUserDataStorage,
            updateUserDataOnServer,
            updateUserDataNow,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
