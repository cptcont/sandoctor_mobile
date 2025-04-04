import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import React, { useCallback, useState } from "react";
import { router } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { fetchData } from "@/services/api";
import { Card } from '@rneui/themed';
import { format } from 'date-fns';


interface Notification {
    id: number;
    date: string;
    body: string;
}


export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const getNotifications = async () => {
        try {
            const notifications = await fetchData('notification/message/');
            return notifications.responce;
        } catch (error) {
            console.error(error);
            return []; // Возвращаем пустой массив в случае ошибки
        }
    };

    useFocusEffect(
        useCallback(() => {
            const loadNotifications = async () => {
                const fetchedNotifications = await getNotifications();
                console.log('fetchedNotifications', fetchedNotifications);
                setNotifications(fetchedNotifications || []);
            };

            loadNotifications();

            return () => {
                // Опционально: очистка, если нужно
            };
        }, [])
    );

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
            <ScrollView>
            <View style={{paddingHorizontal: 16, width: '100%', alignItems: 'center'}}>
                {notifications.length > 0 ? (
                    notifications.map((notification: Notification) => (
                        <Card key={notification.id} containerStyle = {styles.cardContainerStyle}>
                            <Text style={styles.textBody}>{notification.body}</Text>
                            <Text style={styles.textTime}>{format(new Date(notification.date), 'HH:mm dd.MM.yyyy')}</Text>
                        </Card>
                    ))
                ) : (
                    <Text>Уведомлений нет</Text> // Сообщение, если уведомлений нет
                )}
            </View>
            </ScrollView>
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
        width: '100%',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#30DA88',
        //backgroundColor: '#EAFBF3',
    },
    textBody: {
        paddingBottom: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#30DA88',
    },

    textTime: {
        fontSize: 10,
    }


});
