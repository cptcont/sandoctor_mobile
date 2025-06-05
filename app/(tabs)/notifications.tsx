import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import React, { useCallback, useEffect, useState } from "react";
import { router } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { fetchData } from "@/services/api";
import { Card } from '@rneui/themed';
import { format } from 'date-fns';
import { useNotifications } from "@/context/NotificationContext";
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface Notification {
    id: number;
    date: string;
    body: string;
    task_id: string | null;
    read: boolean;
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const { notificationsCount, resetNotifications } = useNotifications();

    const getNotifications = async () => {
        try {
            const notifications = await fetchData('notification/message/');
            return notifications.responce;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // Загрузка уведомлений
    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        const fetchedNotifications = await getNotifications();
        setNotifications(fetchedNotifications || []);
        setIsLoading(false);
        resetNotifications();
        setIsInitialLoad(false);
    }, [resetNotifications]);

    // Загрузка уведомлений и установка бейджа в 0 при фокусе экрана
    useFocusEffect(
        useCallback(() => {
            setIsScreenFocused(true);
            loadNotifications();
            // Устанавливаем бейдж в 0 при посещении экрана
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                Notifications.setBadgeCountAsync(0).catch((error) => {
                    console.error('Ошибка при установке бейджа:', error);
                });
            }

            return () => {
                setIsScreenFocused(false);
            };
        }, [loadNotifications])
    );

    // Обновление уведомлений при изменении notificationsCount
    useEffect(() => {
        if (!isScreenFocused || isInitialLoad || notificationsCount === 0) return;

        const delay = setTimeout(() => {
            loadNotifications();
        }, 2000);

        return () => clearTimeout(delay);
    }, [notificationsCount, isScreenFocused, isInitialLoad, loadNotifications]);

    const handleBack = () => {
        router.replace('/');
    };

    const handleOnBackDetail = (taskId: string | null) => {
        if (taskId && taskId !== "") {
            router.replace({
                pathname: '/details',
                params: {
                    taskId: taskId,
                },
            });
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeaderScreen
                text={`Уведомления`}
                marginBottom={0}
                onPress={handleBack}
            />
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            ) : (
                <ScrollView>
                    {notifications.length > 0 ? (
                        notifications.map((notification: Notification) => (
                            <Card key={notification.id} containerStyle={styles.cardContainerStyle}>
                                <TouchableOpacity
                                    onPress={() => handleOnBackDetail(notification.task_id)}
                                >
                                    <Text style={styles.textTime}>
                                        {format(new Date(notification.date), 'dd.MM.yyyy HH:mm')}
                                    </Text>
                                    <Text style={styles.textBody}>{notification.body}</Text>
                                    <Text style={styles.readStatus}>
                                        {notification.read ? 'Прочитано' : 'Непрочитано'}
                                    </Text>
                                </TouchableOpacity>
                            </Card>
                        ))
                    ) : (
                        <Text>Уведомлений нет</Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cardContainerStyle: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ECECEC',
        backgroundColor: '#F9F9F9',
    },
    textBody: {
        paddingBottom: 10,
        fontSize: 16,
        fontWeight: '400',
        color: '#1B2B65',
    },
    textTime: {
        marginBottom: 10,
        fontSize: 10,
        fontWeight: '900',
        color: '#1B2B65',
    },
    readStatus: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
