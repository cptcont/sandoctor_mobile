import React, { useEffect, useState } from "react";
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { PopupProvider } from '@/context/PopupContext';
import { Platform, StyleSheet, StatusBar, View, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { CustomModal } from '@/components/CustomModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { removeDataFromStorage } from '@/services/api';
import { NotificationProvider } from '@/context/NotificationContext';

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
    const [isMounted, setIsMounted] = useState(false);

    if (Platform.OS === 'android') {
        // NavigationBar.setVisibilityAsync("hidden");
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync("#081A51");
            NavigationBar.setButtonStyleAsync("light");
        }
    }, []);

    // Отмечаем, что компонент смонтирован
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Очистка selectedDate при запуске приложения
    useEffect(() => {
        const clearSelectedDateOnStart = async () => {
            await removeDataFromStorage('selectedDate');
            console.log('SelectedDate удалён из хранилища при запуске приложения');
        };

        clearSelectedDateOnStart();
    }, []);

    // Отслеживание состояния приложения
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            console.log('AppState changed to:', nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // Навигация только после монтирования
    useEffect(() => {
        if (isMounted) {
            console.log('isAuthenticated:', isAuthenticated);
            if (isAuthenticated) {
                router.replace('/(tabs)');
            } else {
                router.replace('/LoginScreen');
            }
        }
    }, [isAuthenticated, isAppUsageExpired, isMounted]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#081A51'} barStyle="light-content" />
            <Stack>
                <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPasswordScreen" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <CustomModal
                visible={isModalVisible}
                onClose={hideModal}
                overlay={overlayStyle}
                overlayBackground={overlayBackgroundStyle}
                modalContent={modalContentStyle}
            >
                {modalContent}
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
