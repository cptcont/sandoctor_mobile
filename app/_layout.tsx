import React from "react";
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PopupProvider } from '@/context/PopupContext';
import { SafeAreaView, Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { CustomModal } from '@/components/CustomModal';
import {TaskProvider} from "@/context/TaskContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <PopupProvider>
                <ModalProvider>
                    <TaskProvider>
                        <RootLayoutNav />
                    </TaskProvider>
                </ModalProvider>
            </PopupProvider>
        </AuthProvider>
    );
}

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();
    const { isModalVisible, modalContent, hideModal } = useModal();
    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync("hidden");
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
            <StatusBar hidden />

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

                <CustomModal visible={isModalVisible} onClose={hideModal}>
                    {modalContent}
                </CustomModal>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
