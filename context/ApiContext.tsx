import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Универсальный тип для ответа API
type ApiResponse<T> = {
    data: T[]; // Унифицированное поле для данных
};

type ApiContextType = {
    tasks: any[]; // Данные задач
    checklists: any[]; // Данные чек-листов
    isLoading: boolean;
    error: string | null;
    fetchData: <T>(endpoint: string, type: 'tasks' | 'checklists') => Promise<ApiResponse<T>>;
    saveDataToStorage: (key: string, data: any) => Promise<void>;
    getDataFromStorage: <T>(key: string) => Promise<T[]>;
};

const ApiContext = createContext<ApiContextType>({
    tasks: [],
    checklists: [],
    isLoading: false,
    error: null,
    fetchData: async () => ({ data: [] }),
    saveDataToStorage: async () => {},
    getDataFromStorage: async () => [],
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [checklists, setChecklists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = useCallback(async (): Promise<string | null> => {
        return await SecureStore.getItemAsync('authToken');
    }, []);

    // Универсальная функция для запросов
    const fetchData = useCallback(async <T,>(endpoint: string, type: 'tasks' | 'checklists'): Promise<ApiResponse<T>> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');

            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'GET',
                headers: { 'Authorization': token },
            });

            if (!response.ok) throw new Error('Ошибка при загрузке данных');

            const responseData = await response.json();
            //console.log('ResponseData', responseData);
            // Сохраняем данные в нужное состояние
            switch (type) {
                case 'tasks':
                    setTasks(responseData.responce || []);
                    break;
                case 'checklists':
                    setChecklists(responseData.responce.parts || []);
                    break;
            }

            return { data: responseData.data };
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    // Остальные функции
    const saveDataToStorage = async (key: string, data: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };

    const getDataFromStorage = async <T,>(key: string): Promise<T[]> => {
        try {
            const dataJson = await AsyncStorage.getItem(key);
            return dataJson ? JSON.parse(dataJson) : [];
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return [];
        }
    };

    return (
        <ApiContext.Provider value={{
            tasks,
            checklists,
            isLoading,
            error,
            fetchData,
            saveDataToStorage,
            getDataFromStorage,
        }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);
