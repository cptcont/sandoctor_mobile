import React, { createContext, useContext, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// Универсальный тип для ответа API
type ApiResponse<T> = {
    data: T[]; // Унифицированное поле для данных
};

type PostContextType = {
    isLoading: boolean;
    error: string | null;
    postData: <T>(endpoint: string, body: any) => Promise<ApiResponse<T>>;
    uploadImage: <T>(endpoint: string, imageUri: string, fieldName?: string) => Promise<ApiResponse<T>>;
};

type ReactNativeFile = {
    uri: string;
    name: string;
    type: string;
};

const PostContext = createContext<PostContextType>({
    isLoading: false,
    error: null,
    postData: async () => ({ data: [] }),
    uploadImage: async () => ({ data: [] }),
});

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = useCallback(async (): Promise<string | null> => {
        return await SecureStore.getItemAsync('authToken');
    }, []);

    // Универсальная функция для POST запросов
    const postData = useCallback(async <T,>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');
            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'POST',
                headers: {
                    Authorization: token,
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

    // Функция для отправки изображений
    const uploadImage = useCallback(async <T,>(endpoint: string, imageUri: string, fieldName: string = 'file'): Promise<ApiResponse<T>> => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error('Токен не найден');

            // Создаем объект FormData
            const formData = new FormData();
            const file: ReactNativeFile = {
                uri: imageUri,
                name: 'image.jpg', // Имя файла
                type: 'image/jpeg', // MIME-тип файла
            };
            formData.append(fieldName, file as unknown as Blob); // Приведение типа

            // Отправляем запрос
            const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Ошибка при загрузке изображения');
            const responseData = response.json();
            return responseData;
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
            console.error('Ошибка:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    return (
        <PostContext.Provider value={{ isLoading, error, postData, uploadImage }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePost = () => useContext(PostContext);
