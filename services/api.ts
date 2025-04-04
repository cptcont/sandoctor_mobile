// api.ts
import * as SecureStore from 'expo-secure-store';
import { storage } from '@/storage/storage';

// Универсальный тип для ответа API
type ApiResponse<T> = {
    data?: T[];
    responce?: any;
};

type ReactNativeFile = {
    uri: string;
    name: string;
    type: string;
};


// Получение токена
const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('authToken');
};

// Универсальная функция для GET запросов
export const fetchData = async <T>(
    endpoint: string,
): Promise<ApiResponse<T>> => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Токен не найден');

        const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке данных: ${response.status}`);
        }

        const responseData = await response.json(); // Предполагаем, что API возвращает массив данных

        return responseData; // Возвращаем объект с полем data
    } catch (error) {
        console.error('Ошибка в fetchData:', error);
        throw error;
    }
};

// Универсальная функция для GET запросов с сохранением в MMKV
export const fetchDataSaveStorage = async <T,>(
    endpoint: string,
    typeResponse?:string,
): Promise<ApiResponse<T>> => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Токен не найден');

        const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
            method: 'GET',
            headers: { 'Authorization': token },
        });

        if (!response.ok) throw new Error('Ошибка при загрузке данных');

        const responseData = await response.json();

            // Сохраняем данные в MMKV
            switch (typeResponse) {
                case 'checklists': {
                    removeDataFromStorage(typeResponse);
                    saveDataToStorage(typeResponse,responseData.responce.parts || []);
                    return responseData;
                }
                case 'tasks': {
                    removeDataFromStorage(typeResponse);
                    saveDataToStorage(typeResponse,responseData.responce || []);
                    return responseData;
                }
                case 'task': {
                    removeDataFromStorage(typeResponse);
                    saveDataToStorage(typeResponse,responseData.responce || []);
                    return responseData;
                }

                default: {
                    return responseData;
                }
            }
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
};

// Универсальная функция для POST, PUT, DELETE запросов
export const postData = async <T,>(
    endpoint: string,
    body: any,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<ApiResponse<T>> => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Токен не найден');

        const response = await fetch(`https://sandoctor.ru/api/v1/${endpoint}`, {
            method,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('Ошибка при отправке данных');

        const responseData = await response.json();
        console.log('Данные отправлены на сервер');
        return responseData
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    }
};

export const uploadImage = async <T,>(endpoint: string, imageUri: string, fieldName: string = 'file'): Promise<ApiResponse<T>> => {
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

        console.error('Ошибка:', error);
        throw error;
    }
};


// Сохранение данных в MMKV
export const saveDataToStorage = (key: string, data: any) => {
    try {
        storage.set(key, JSON.stringify(data));
        console.log('Данные сохранены в MMKV ',key);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
};

// Получение данных из MMKV
export const getDataFromStorage = <T,>(key: string): T => {
    try {
        const dataJson = storage.getString(key);
        return dataJson ? JSON.parse(dataJson) : (Array.isArray([]) ? [] : {}) as T;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return (Array.isArray([]) ? [] : {}) as T;
    }
};

// Удаление данных из MMKV
export const removeDataFromStorage = (key: string) => {
    try {
        storage.delete(key);
        console.log('Данные удалены из MMKV ', key);
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
};

export const addPhotoToJsonInMMKV = (key:string, newPhoto:object) => {
    // Получение JSON из MMKV
    const jsonString = storage.getString(key);

    if (jsonString) {
        // Преобразование JSON строки в объект
        const jsonObject = JSON.parse(jsonString);

        // Проверка, существует ли массив "photos" в JSON
        if (!jsonObject.photos) {
            // Если массива "photos" нет, создаем его
            jsonObject.photos = [];
        }

        // Добавление нового объекта в массив "photos"
        jsonObject.photos.push(newPhoto);

        // Преобразование измененного объекта обратно в строку
        const updatedJsonString = JSON.stringify(jsonObject);

        // Сохранение измененного JSON обратно в MMKV
        storage.set(key, updatedJsonString);

        console.log('Фото успешно добавлено в массив "photos" в MMKV');
    } else {
        console.log('JSON не найден в MMKV');
    }
};
