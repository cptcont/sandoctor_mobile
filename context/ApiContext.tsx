import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { storage } from '@/storage/storage';

// Универсальный тип для ответа API
type ApiResponse<T> = {
    data: T[]; // Унифицированное поле для данных
};

type ApiContextType = {
    tasks: any[]; // Данные задач
    checklists: any[]; // Данные чек-листов
    isLoadingTasks: boolean; // Состояние загрузки для задач
    isLoadingChecklists: boolean; // Состояние загрузки для чек-листов
    errorTasks: string | null; // Ошибка для задач
    errorChecklists: string | null; // Ошибка для чек-листов
    postData: <T>(endpoint: string, body: any) => Promise<ApiResponse<T>>;
    fetchTasks: <T>(endpoint: string) => Promise<ApiResponse<T>>;
    fetchChecklists: <T>(endpoint: string) => Promise<ApiResponse<T>>;
    saveDataToStorage: (key: string, data: any) => void;
    getDataFromStorage: <T>(key: string) => T[];
    removeDataFromStorage: (key: string) => void;
};

const ApiContext = createContext<ApiContextType>({
    tasks: [],
    checklists: [],
    isLoadingTasks: false,
    isLoadingChecklists: false,
    errorTasks: null,
    errorChecklists: null,
    postData: async () => ({ data: [] }),
    fetchTasks: async () => ({ data: [] }),
    fetchChecklists: async () => ({ data: [] }),
    saveDataToStorage: () => {},
    getDataFromStorage: () => [],
    removeDataFromStorage: () => {},
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [checklists, setChecklists] = useState<any[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
    const [errorTasks, setErrorTasks] = useState<string | null>(null);
    const [errorChecklists, setErrorChecklists] = useState<string | null>(null);

    const getToken = useCallback(async (): Promise<string | null> => {
        return await SecureStore.getItemAsync('authToken');
    }, []);

    // Универсальная функция для запросов задач
    const fetchTasks = useCallback(async <T,>(endpoint: string): Promise<ApiResponse<T>> => {
        setIsLoadingTasks(true);
        setErrorTasks(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');

            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': token },
            });

            if (!response.ok) throw new Error('Ошибка при загрузке данных');

            const responseData = await response.json();
            setTasks(responseData.responce || []);

            return { data: responseData.data };
        } catch (error) {
            setErrorTasks(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка:', error);
            throw error;
        } finally {
            setIsLoadingTasks(false);
        }
    }, [getToken]);

    // Универсальная функция для запросов чек-листов
    const fetchChecklists = useCallback(async <T,>(endpoint: string): Promise<ApiResponse<T>> => {
        setIsLoadingChecklists(true);
        setErrorChecklists(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');

            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': token },
            });

            if (!response.ok) throw new Error('Ошибка при загрузке данных');

            const responseData = await response.json();
            //console.log("Ответ от сервера CheckList", responseData.responce.parts);
            setChecklists(responseData.responce.parts || []);
            return { data: responseData.data };
        } catch (error) {
            setErrorChecklists(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка:', error);
            throw error;
        } finally {
            setIsLoadingChecklists(false);
        }
    }, [getToken]);

    // Универсальная функция для POST запросов
    const postData = useCallback(async <T,>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
        const setIsLoading = endpoint.includes('tasks') ? setIsLoadingTasks : setIsLoadingChecklists;
        const setError = endpoint.includes('tasks') ? setErrorTasks : setErrorChecklists;

        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');

            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Ошибка при отправке данных');

            const responseData = await response.json();
            return { data: responseData.data };
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    // Сохранение данных в MMKV
    const saveDataToStorage = (key: string, data: any) => {
        try {
            storage.set(key, JSON.stringify(data));
            console.log('Данные сохранены в MMKV');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };

    // Получение данных из MMKV
    const getDataFromStorage = <T,>(key: string): T[] => {
        try {
            const dataJson = storage.getString(key);

            return dataJson ? JSON.parse(dataJson) : [];
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return [];
        }
    };

    // Удаление данных из MMKV
    const removeDataFromStorage = (key: string) => {
        try {
            storage.delete(key);
            console.log('Данные удалены из MMKV');
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };
    useEffect(() => {
        //console.log("Обновлённые checklists:", checklists);
    }, [checklists]);
    return (
        <ApiContext.Provider value={{
            tasks,
            checklists,
            isLoadingTasks,
            isLoadingChecklists,
            errorTasks,
            errorChecklists,
            postData,
            fetchTasks,
            fetchChecklists,
            saveDataToStorage,
            getDataFromStorage,
            removeDataFromStorage,
        }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);
