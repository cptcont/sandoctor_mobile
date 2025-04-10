import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchData } from '@/services/api';

// Тип для ответа API
interface NotificationResponse {
    responce: {
        count: number;
    };
}

// Тип для значения контекста
interface NotificationContextValue {
    notificationsCount: number; // Изменено на notificationsCount
    resetNotifications: () => void;
    refreshNotifications: () => void;
}

// Создаем контекст с начальным значением undefined
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Props для провайдера
interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notificationsCount, setNotificationsCount] = useState<number>(0); // Изменено на notificationsCount

    const getNotificationAvailability = async () => {
        try {
            const response = (await fetchData('notification/')) as NotificationResponse;
            const count = response?.responce?.count ?? 0;
            setNotificationsCount(count); // Изменено на setNotificationsCount
        } catch (error) {
            console.error('Ошибка при получении уведомлений:', error);
            setNotificationsCount(0); // Изменено на setNotificationsCount
        }
    };

    // Периодический запрос каждые 5 минут
    useEffect(() => {
        getNotificationAvailability(); // Первоначальный вызов
        const intervalId = setInterval(getNotificationAvailability, 120000); // 5 минут

        return () => clearInterval(intervalId); // Очистка при размонтировании
    }, []);

    // Функция для сброса уведомлений
    const resetNotifications = () => {
        setNotificationsCount(0); // Изменено на setNotificationsCount
    };

    // Функция для обновления уведомлений
    const refreshNotifications = () => {
        getNotificationAvailability(); // Вызываем получение уведомлений вручную
    };

    const value: NotificationContextValue = {
        notificationsCount, // Изменено на notificationsCount
        resetNotifications,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Хук для использования контекста с проверкой наличия провайдера
export const useNotifications = (): NotificationContextValue => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
