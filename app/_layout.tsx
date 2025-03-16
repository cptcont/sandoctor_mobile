import React from "react";
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
//import { StatusBar } from 'expo-status-bar';
import { PopupProvider } from '@/context/PopupContext';
import { SafeAreaView, Platform, StyleSheet, StatusBar, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { CustomModal } from '@/components/CustomModal';
import { ApiProvider } from "@/context/ApiContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {PostProvider} from "@/context/PostApi";
import {ChecklistProvider} from "@/context/UpdateServerData";
import { KeyboardProvider, KeyboardController } from 'react-native-keyboard-controller';



export default function RootLayout() {
    return (

        <AuthProvider>
            <PopupProvider>
                <ModalProvider>
                    <ApiProvider>
                        <PostProvider>
                            <ChecklistProvider>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                    <KeyboardProvider preserveEdgeToEdge={false}>
                                        <RootLayoutNav />
                                    </KeyboardProvider>
                                </GestureHandlerRootView>
                            </ChecklistProvider>
                        </PostProvider>
                    </ApiProvider>
                </ModalProvider>
            </PopupProvider>
        </AuthProvider>

    );
}


function RootLayoutNav() {
    const { isAuthenticated } = useAuth();
    const { hideModal, isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle } = useModal();
    if (Platform.OS === 'android') {
        //NavigationBar.setVisibilityAsync("hidden");
    }
    useEffect(() => {
        if (Platform.OS === 'android') {
          //  NavigationBar.setVisibilityAsync("hidden");
            // Установите цвет фона Navigation Bar
            NavigationBar.setBackgroundColorAsync("#081A51"); // Используйте тот же цвет, что и для StatusBar
            // Установите светлый стиль кнопок (белые иконки)
            NavigationBar.setButtonStyleAsync("light");
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
            <View style={styles.container}>
            <StatusBar backgroundColor={'#081A51'} barStyle="light-content"/>
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
            </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height:'100%',
    },
});
