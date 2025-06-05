import React from "react";
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { CustomHeader } from '@/components/CustomHeader';
import {PushNotificationProvider} from "@/context/PushNotificationContext";

export default function TabsLayout() {
    return (
        <PushNotificationProvider>
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
        </PushNotificationProvider>
    );
}
