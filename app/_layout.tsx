import React from "react";
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PopupProvider } from '@/context/PopupContext'; // Импортируем PopupProvider

export default function RootLayout() {
    return (
        <AuthProvider>
            <PopupProvider> {/* Обертываем приложение в PopupProvider */}
                <RootLayoutNav />
            </PopupProvider>
        </AuthProvider>
    );
}

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        } else {
            router.replace('/LoginScreen');
        }
    }, [isAuthenticated]);

    return (
        <>
            <StatusBar hidden />

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
        </>
    );
}
