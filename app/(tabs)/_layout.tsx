import React from 'react';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { CustomHeader } from '@/components/CustomHeader';
import { CustomModal } from '@/components/CustomModal';
import { NotificationProvider } from '@/context/NotificationContext';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { PushNotificationProvider } from '@/context/PushNotificationContext';
import { View, StyleSheet } from 'react-native';

export default function TabsLayout() {
    return (
        <PushNotificationProvider>
            <NotificationProvider>
                <ModalProvider>
                    <DrawerContent />
                </ModalProvider>
            </NotificationProvider>
        </PushNotificationProvider>
    );
}

function DrawerContent() {
    const { hideModal, isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle } = useModal();

    return (
        <View style={styles.container}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    header: () => <CustomHeader />,
                    swipeEnabled: false, // Отключает боковую панель
                }}
            >
                <Drawer.Screen
                    name="index"
                    options={{
                        headerTitle: 'Главная',
                    }}
                />
                <Drawer.Screen
                    name="checklist"
                    options={{
                        headerTitle: 'Checklist',
                    }}
                />
                <Drawer.Screen
                    name="daydetails"
                    options={{
                        headerTitle: 'Day Details',
                    }}
                />
                <Drawer.Screen
                    name="details"
                />
                <Drawer.Screen
                    name="objects"
                    options={{
                        headerTitle: 'Объекты',
                    }}
                />
                <Drawer.Screen
                    name="buildings"
                    options={{
                        headerTitle: 'Здания',
                    }}
                />
                <Drawer.Screen
                    name="qrcode"
                    options={{
                        headerTitle: 'QR-код',
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        headerTitle: 'Профиль',
                        headerShown: true,
                    }}
                />
                <Drawer.Screen
                    name="starttask"
                />
                <Drawer.Screen
                    name="notifications"
                />
            </Drawer>
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
