import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { PopupProvider } from '@/context/PopupContext';
import {Platform, StyleSheet, StatusBar, View, AppState, Text} from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { CustomModal } from '@/components/CustomModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { removeDataFromStorage } from '@/services/api';
import {NotificationProvider} from "@/context/NotificationContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <PopupProvider>
                <ModalProvider>
                    <NotificationProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            <KeyboardProvider preserveEdgeToEdge={false}>
                                <RootLayoutNav />
                            </KeyboardProvider>
                        </GestureHandlerRootView>
                    </NotificationProvider>
                </ModalProvider>
            </PopupProvider>
        </AuthProvider>
    );
}

function RootLayoutNav() {
    const { isAuthenticated, isAppUsageExpired } = useAuth();
    const { hideModal, isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle } = useModal();

    if (Platform.OS === 'android') {
        // NavigationBar.setVisibilityAsync("hidden");
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync('#081A51');
            NavigationBar.setButtonStyleAsync('light');
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        } else {
            router.replace('/LoginScreen');
        }
    }, [isAuthenticated, isAppUsageExpired]);

    // Очистка selectedDate при запуске приложения
    useEffect(() => {
        const clearSelectedDateOnStart = async () => {
            await removeDataFromStorage('selectedDate');
            console.log('SelectedDate удалён из хранилища при запуске приложения');
        };

        clearSelectedDateOnStart();
    }, []);

    // Отслеживание состояния приложения (опционально, для отладки)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            console.log('AppState changed to:', nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#081A51'} barStyle="light-content" />
            {!isAuthenticated && (
                <Stack>
                    <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPasswordScreen" options={{ headerShown: false }} />
                </Stack>
            )}
            {isAuthenticated && (
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
            )}
            <CustomModal
                visible={isModalVisible}
                onClose={hideModal}
                overlay={overlayStyle}
                overlayBackground={overlayBackgroundStyle}
                modalContent={modalContentStyle}
            >
                {typeof modalContent === 'string' ? <Text>{modalContent}</Text> : modalContent}
            </CustomModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
    },
});
