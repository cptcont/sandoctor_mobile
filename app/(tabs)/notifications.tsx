import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import React, { useCallback, useEffect, useState } from "react";
import { router } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { fetchData } from "@/services/api";
import { Card } from '@rneui/themed';
import { format } from 'date-fns';
import { useNotifications } from "@/context/NotificationContext";

interface Notification {
    id: number;
    date: string;
    body: string;
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { notificationsCount, resetNotifications, refreshNotifications } = useNotifications();

    const getNotifications = async () => {
        try {
            const notifications = await fetchData('notification/message/');
            return notifications.responce;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadNotifications = async () => {
                setIsLoading(true);
                const fetchedNotifications = await getNotifications();
//                console.log('fetchedNotifications', fetchedNotifications);
                setNotifications(fetchedNotifications || []);
                setIsLoading(false);
            };

            loadNotifications();

            return () => {
                // Опционально: очистка, если нужно
            };
        }, [])
    );

    useEffect(() => {
        const loadNotifications = async () => {
            setIsLoading(true);
            const fetchedNotifications = await getNotifications();
            console.log('fetchedNotifications', fetchedNotifications);
            setNotifications(fetchedNotifications || []);
            setIsLoading(false);
        };

        loadNotifications();
        resetNotifications();
    }, [notificationsCount]);

    const handleBack = () => {
        router.back();
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
                                <Text style={styles.textTime}>{format(new Date(notification.date), 'dd.MM.yyyy HH:mm')}</Text>
                                <Text style={styles.textBody}>{notification.body}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
