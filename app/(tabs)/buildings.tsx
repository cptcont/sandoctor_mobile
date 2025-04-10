import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect, useRef, useState } from "react";
import NotifTest from "@/components/NotifTest";

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, // Показывать уведомление, когда приложение активно
        shouldPlaySound: true, // Воспроизводить звук
        shouldSetBadge: false, // Не показывать бейдж
    }),
});

export default function BuildingsScreen() {
    return (
        <View style={styles.container}>
            <NotifTest />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
