import React from "react";
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PopupProvider } from '@/context/PopupContext';
import { SafeAreaView, Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar'; // Импортируем модуль для управления навигационной панелью

export default function RootLayout() {
    return (
        <AuthProvider>
            <PopupProvider>
                <RootLayoutNav />
            </PopupProvider>
        </AuthProvider>
    );
}

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();

    // Скрываем навигационную панель при загрузке компонента
    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync("hidden"); // Скрываем навигационную панель
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        } else {
            router.replace('/LoginScreen');
        }
    }, [isAuthenticated]);

    return (
        <>
            {/* Скрываем StatusBar */}
            <StatusBar hidden />

            {/* Используем SafeAreaView для предотвращения перекрытия контента */}
            <SafeAreaView style={styles.container}>
                {!isAuthenticated && (
                    <Stack>
                        <Stack.Screen
                            name="LoginScreen"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPasswordScreen"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                )}

                {isAuthenticated && (
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                )}
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
//        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Учитываем высоту статус-бара на Android
    },
});
