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
import { ApiProvider } from "@/context/ApiContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <AuthProvider>
            <PopupProvider>
                <ModalProvider>
                    <ApiProvider>
                            <GestureHandlerRootView style={{ flex: 1 }}>
                                <RootLayoutNav />
                            </GestureHandlerRootView>
                    </ApiProvider>
                </ModalProvider>
            </PopupProvider>
        </AuthProvider>
    );
}

function RootLayoutNav() {
    const { isAuthenticated } = useAuth();
    const { hideModal, isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle } = useModal();

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
            <SafeAreaView style={styles.container}>
                <StatusBar hidden={true}/>
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
                <CustomModal visible={isModalVisible}
                             onClose={hideModal}
                             overlay={overlayStyle}
                             overlayBackground={overlayBackgroundStyle}
                             modalContent={modalContentStyle}>
                    {modalContent}
                </CustomModal>
            </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
