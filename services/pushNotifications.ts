import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { postData } from '@/services/api';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Обработка ошибок регистрации
function handleRegistrationError(errorMessage: string) {
    console.error('Push Notification Error:', errorMessage);
    throw new Error(errorMessage);
}

// Регистрация для получения push-токена
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        handleRegistrationError('Must use physical device for push notifications');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted for push notifications');
        return;
    }

    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        handleRegistrationError('Project ID not found');
        return;
    }

    try {
        const pushToken = (
            await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;
        return pushToken;
    } catch (e: unknown) {
        handleRegistrationError(`${e}`);
    }
}

// Сохранение токена в AsyncStorage
export async function savePushToken(token: string) {
    try {
        await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
        console.error('Error saving push token:', error);
    }
}

// Получение токена из AsyncStorage
export async function getPushToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
        console.error('Error retrieving push token:', error);
        return null;
    }
}

// Отправка токена на сервер
export async function sendTokenToServer(token: string) {
    try {
        await postData('notification', { token });
        console.log('Push token sent to server:', token);
    } catch (error) {
        console.error('Error sending token to server:', error);
    }
}

// Инициализация push-уведомлений
export async function initializePushNotifications(): Promise<string | null> {
    const storedToken = await getPushToken();
    if (storedToken) {
        await sendTokenToServer(storedToken);
        return storedToken;
    }

    const newToken = await registerForPushNotificationsAsync();
    if (newToken) {
        await savePushToken(newToken);
        await sendTokenToServer(newToken);
        return newToken;
    }
    return null;
}
