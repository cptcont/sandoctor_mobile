import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // Импортируем SecureStore

type Task = {
    id: string;
    title: string;
    description: string;
    status: string;
    color?: string; // Опциональное поле для цвета
    time?: string; // Опциональное поле для времени
    point?: string; // Опциональное поле для баллов
    time_begin_work?: string,
    time_end_work?: string,
    date_begin_work?: string,
    adress: string,
    condition: TaskCondition;

};

type TaskContextType = {
    tasks: { responce: Task[] }; // tasks — это объект с полем responce
    isLoading: boolean;
    error: string | null;
    fetchTasks: () => Promise<void>;
    saveTasksToStorage: (tasks: Task[]) => Promise<void>;
    getTasksFromStorage: () => Promise<Task[]>;
};

type TaskCondition = {
    color: string | ''; // Обязательное поле для цвета
};

const TaskContext = createContext<TaskContextType>({
    tasks: { responce: [] }, // Инициализация объектом с пустым массивом
    isLoading: false,
    error: null,
    fetchTasks: async () => {},
    saveTasksToStorage: async () => {},
    getTasksFromStorage: async () => [],
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<{ responce: Task[] }>({ responce: [] }); // tasks — это объект
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Функция для получения токена из SecureStore
    const getToken = async (): Promise<string | null> => {
        return await SecureStore.getItemAsync('authToken'); // Используем SecureStore
    };

    // Функция для загрузки задач с сервера
    const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Токен не найден');
            }

            const response = await fetch('https://sandoctor.ru/api/v1/task/', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке задач');
            }

            const data = await response.json();
            setTasks({ responce: data.responce }); // Сохраняем данные в формате { responce: Task[] }
            await saveTasksToStorage(data.responce); // Сохраняем задачи в хранилище
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка при загрузке задач:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для сохранения задач в AsyncStorage
    const saveTasksToStorage = async (tasks: Task[]): Promise<void> => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Ошибка при сохранении задач в хранилище:', error);
        }
    };

    // Функция для получения задач из AsyncStorage
    const getTasksFromStorage = async (): Promise<Task[]> => {
        try {
            const tasksJson = await AsyncStorage.getItem('tasks');
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('Ошибка при получении задач из хранилища:', error);
            return [];
        }
    };

    // Загружаем задачи при монтировании компонента
    useEffect(() => {
        const initializeData = async () => {
            const storedTasks = await getTasksFromStorage();
            if (storedTasks.length > 0) {
                setTasks({ responce: storedTasks }); // Восстанавливаем задачи из хранилища
            } else {
                await fetchTasks(); // Загружаем задачи с сервера, если в хранилище пусто
            }
        };
        initializeData();
    }, []);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                isLoading,
                error,
                fetchTasks,
                saveTasksToStorage,
                getTasksFromStorage,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
