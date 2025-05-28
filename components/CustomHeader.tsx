import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { IconButton } from '@/components/IconButton';
import { BellSolidIcon, QrIcon } from '@/components/icons/Icons';
import { useModal } from '@/context/ModalContext';
import { AvatarMenu } from '@/components/AvatarMenu';
import { Badge } from '@rneui/themed';
import { useNotifications } from '@/context/NotificationContext';
import {removeDataFromStorage} from "@/services/api";

export function CustomHeader() {
    const { userData, logout, getUserDataStorage } = useAuth();
    const { showModal, hideModal } = useModal();
    const { notificationsCount, resetNotifications, refreshNotifications } = useNotifications();
    const [userPic, setUserPic] = useState('');

    // Загрузка данных пользователя
    useEffect(() => {
        const loadUserData = async () => {
            try {
                await getUserDataStorage();
                refreshNotifications();
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
            }
        };

        loadUserData();

        if (userData && userData.responce && userData.responce.pic) {
            setUserPic(userData.responce.pic);
        } else {
            setUserPic('');
        }
    }, [userData]);

    // Обновление уведомлений при монтировании компонента
    //useEffect(() => {
    //    refreshNotifications(); // Обновляем уведомления при отрисовке
    //}, [refreshNotifications]); // Зависимость от refreshNotifications

    const openQr = () => {
        router.push('/qrcode');
    };

    const handleNotification = () => {
        resetNotifications(); // Сбрасываем уведомления
        router.push('/notifications');
    };

    const handleProfilePress = () => {
        router.push('/profile');
        hideModal();
    };

    const handleLogoutPress = () => {
        console.log('LogoutPress');
        removeDataFromStorage('selectedDate');
        logout();
        hideModal();
    };
    const openBuilding = () => {
        router.push('/buildings');
    }

    const handlePressHome = () => {
        router.push('/');
    }

    const toggleAvatarMenu = () => {
        showModal(
            <AvatarMenu
                onClose={() => {}}
                onProfilePress={handleProfilePress}
                onLogoutPress={handleLogoutPress}
            />,
            {
                overlay: { alignItems: 'flex-end' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0)' },
                modalContent: { paddingTop: 75, paddingRight: 10 },
            }
        );
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={handlePressHome}
                activeOpacity={0.9}
            >
                <Image source={require('@/assets/images/logo-header.png')} style={styles.logo} />
            </TouchableOpacity>
                <IconButton icon={<QrIcon />} size={30} marginLeft={90} onPress={openQr} />
            {/* <IconButton icon={<QrIcon />} size={30} marginLeft={90} onPress={openBuilding} /> */}

            <View>
                <IconButton
                    icon={<BellSolidIcon />}
                    size={30}
                    marginLeft={10}
                    onPress={handleNotification}
                />
                {notificationsCount > 0 && (
                    <Badge
                        status="success"
                        containerStyle={{ position: 'absolute', top: 0, left: 35 }}
                    />
                )}
            </View>
            <ButtonHeader
                iconSource={
                    userPic ? { uri: userPic } : require('@/assets/icons/avatar.png')
                }
                containerSize={40}
                size={30}
                marginLeft={10}
                marginRight={20}
                onPress={toggleAvatarMenu}
                isCircle={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
        borderBottomColor: '#C5C5C6',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    logo: {
        resizeMode: 'contain',
    },
});
