import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import btoa from "btoa";
import { Buffer } from 'buffer';

type AuthContextType = {
    isAuthenticated: boolean;
    userData: any; // Данные пользователя из JSON-ответа
    token: string | null; // Токен
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    setUserDataStorage: (data: any) => Promise<void>;
    getUserDataStorage: () => Promise<any>;
    updateUserDataOnServer: (userId: string, data: any) => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    userData: null,
    token: null,
    login: async () => {},
    logout: () => {},
    setUserDataStorage: async () => {},
    getUserDataStorage: async () => {},
    updateUserDataOnServer: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Универсальная функция для кодирования в Base64
const encodeBase64 = (str: string): string => {
    if (Platform.OS === 'web') {
        return btoa(encodeURIComponent(str)); // Используем btoa для браузера
    } else {
        // Для React Native используем Buffer
        return Buffer.from(str).toString('base64');
    }
};

// Универсальная функция для получения токена
const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('authToken');
    } else {
        return await SecureStore.getItemAsync('authToken');
    }
};

// Универсальная функция для сохранения токена
const setToken = async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
        localStorage.setItem('authToken', token);
    } else {
        await SecureStore.setItemAsync('authToken', token);
    }
};

// Универсальная функция для удаления токена
const deleteToken = async (): Promise<void> => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('authToken');
    } else {
        await SecureStore.deleteItemAsync('authToken');
    }
};

// Универсальная функция для сохранения данных пользователя
const setUserDataStorage = async (data: any): Promise<void> => {
    await deleteUserDataStorage();
    if (Platform.OS === 'web') {
        localStorage.setItem('userData', JSON.stringify(data)); // Сохраняем как JSON
    } else {
        await SecureStore.setItemAsync('userData', JSON.stringify(data)); // Исправлено: добавлен SecureStore
    }

};

// Универсальная функция для получения данных пользователя
const getUserDataStorage = async (): Promise<any> => {
    if (Platform.OS === 'web') {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    } else {
        const data = await SecureStore.getItemAsync('userData');
        return data ? JSON.parse(data) : null;
    }
};

// Универсальная функция для удаления данных пользователя
const deleteUserDataStorage = async (): Promise<void> => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('userData');
    } else {
        await SecureStore.deleteItemAsync('userData');
    }
};
// Универсальная функция для обновления данных на сервере
const updateUserDataOnServer = async (userId: string, data: any): Promise<any> => {
    try {
        // Получаем токен из хранилища
        const token = await getToken();
        if (!token) {
            throw new Error('Токен не найден');
        }

        console.log('Data', data);
        console.log('UserId', userId);
        console.log('token', token);

        // Отправляем данные на сервер
        const response = await fetch(`https://sandoctor.ru/api/v1/user/${userId}/`, {
            method: 'POST', // Используем POST для обновления данных
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token, // Используем токен для авторизации
            },
            body: JSON.stringify(data), // Отправляем данные пользователя в формате JSON
        });

        // Проверяем статус ответа
        if (!response.ok) {
            throw new Error('Ошибка при обновлении данных на сервере');
        }

        // Возвращаем обновленные данные с сервера
        return await response.json();
    } catch (error) {
        console.error('Ошибка при отправке данных на сервер:', error);
        throw error;
    }
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<any>(null); // Данные пользователя
    const [token, setTokenState] = useState<string | null>(null); // Токен

    // Проверка аутентификации при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            const token = await getToken();
            const userData = await getUserDataStorage();
            if (token && userData) {
                setIsAuthenticated(true);
                setTokenState(token);
                setUserData(userData);
            }
        };
        checkAuth();
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
                const data = await response.json(); // Получаем JSON-ответ
                console.log('Data', data);
                await setToken(token); // Сохраняем токен
                await setUserDataStorage(data); // Сохраняем данные пользователя
                setTokenState(token); // Обновляем состояние токена
                setUserData(data); // Обновляем данные пользователя
                setIsAuthenticated(true);
            } else {
                throw new Error('Ошибка авторизации');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    };

    const logout = async () => {
        await deleteToken(); // Удаляем токен
        await deleteUserDataStorage(); // Удаляем данные пользователя
        setTokenState(null); // Очищаем состояние токена
        setUserData(null); // Очищаем данные пользователя
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userData,
            token,
            login,
            logout,
            setUserDataStorage,
            getUserDataStorage,
            updateUserDataOnServer,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
