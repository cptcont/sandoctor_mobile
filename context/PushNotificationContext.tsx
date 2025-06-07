import React, { createContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { initializePushNotifications } from '@/services/pushNotifications';
import { AppState } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';

// Тип для значения контекста (пустой, так как UI не требуется)
interface PushNotificationContextValue {}

// Создаем контекст с начальным значением undefined
const PushNotificationContext = createContext<PushNotificationContextValue | undefined>(undefined);

// Props для провайдера
interface PushNotificationProviderProps {
    children: ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);
    const { refreshNotifications } = useNotifications();

    // Инициализация push-уведомлений и установка слушателей
    useEffect(() => {
        // Инициализация push-уведомлений
        initializePushNotifications()
            .then((token) => {
                if (token) {
                    console.log('Push token initialized:', token);
                }
            })
            .catch((error) => {
                console.error('Error initializing push notifications:', error);
            });

        // Слушатель для получения уведомлений
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
            // Обновляем счетчик уведомлений из NotificationContext
            refreshNotifications();
        });

        // Слушатель для реакции на уведомления (например, нажатие)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response:', response);
            // Обновляем счетчик уведомлений при нажатии
            refreshNotifications();
        });

        // Очистка слушателей при размонтировании
        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [refreshNotifications]);

    // Отслеживание состояния приложения
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            console.log('AppState changed to:', nextAppState);
            if (nextAppState === 'active') {
                // При возвращении в активное состояние инициализируем токен заново
                initializePushNotifications()
                    .then((token) => {
                        if (token) {
                            console.log('Push token refreshed on app resume:', token);
                        }
                    })
                    .catch((error) => {
                        console.error('Error refreshing push token:', error);
                    });
                // Обновляем счетчик уведомлений
                refreshNotifications();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [refreshNotifications]);

    return (
        <PushNotificationContext.Provider value={{}}>
            {children}
        </PushNotificationContext.Provider>
    );
};
