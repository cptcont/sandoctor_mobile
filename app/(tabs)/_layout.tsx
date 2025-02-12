import React from "react";
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { CustomHeader } from '@/components/CustomHeader';

export default function TabsLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                header: () => <CustomHeader />,
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
                options={{
                    headerTitle: 'Details',
                }}
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
        </Drawer>
    );
}
