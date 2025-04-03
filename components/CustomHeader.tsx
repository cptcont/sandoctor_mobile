import React, { useEffect, useState } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { IconButton } from '@/components/IconButton';
import { BellSolidIcon, QrIcon } from '@/components/icons/Icons';
import { useModal } from '@/context/ModalContext';
import { AvatarMenu } from '@/components/AvatarMenu';
import { Badge } from '@rneui/themed';
import {
    fetchData
} from '@/services/api'

export function CustomHeader() {
    const { userData, logout, getUserDataStorage } = useAuth();
    const { showModal, hideModal } = useModal();
    const [userPic, setUserPic] = useState(''); // Состояние для изображения пользователя
    const [notifications, setNotifications] = useState(0);

    // Отладка и обновление userPic
    useEffect(() => {
        const loadUserData = async () => {
            try {
                await getUserDataStorage();
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
            }
        }

        console.log('userData:', userData); // Проверяем, что приходит в userData
        if (userData && userData.responce && userData.responce.pic) {
            console.log('Setting userPic to:', userData.responce.pic); // Проверяем, устанавливается ли pic
            setUserPic(userData.responce.pic);
        } else {
            console.log('No valid pic found in userData');
            setUserPic('');
        }
    }, [userData]);

    // Добавляем эффект для периодического получения уведомлений
    useEffect(() => {
        // Первоначальный вызов
        getNotificationAvailability();

        // Установка интервала на каждые 5 минут (300000 миллисекунд)
        const intervalId = setInterval(() => {
            getNotificationAvailability();
        }, 300000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []); // Пустой массив зависимостей, чтобы эффект сработал только при монтировании

    const getNotificationAvailability = async () => {
        try {
            const response = await fetchData('notification/');
            console.log('Полный ответ:', response); // {"responce": {"count": 2}}
            const count = response?.responce?.count; // Обращаемся напрямую к responce
            if (count !== undefined) {
                setNotifications(count); // Устанавливаем количество уведомлений
            } else {
                console.warn('Count не найден в ответе API');
                setNotifications(0); // Устанавливаем 0, если count отсутствует
            }
        } catch (error) {
            console.error('Ошибка при получении уведомлений:', error);
            setNotifications(0); // Устанавливаем 0 в случае ошибки
        }
    };

    const openQr = () => {
        router.push('/qrcode');
    };

    const handleNotification = () => {
        router.push('/notifications');
    }

    const handleProfilePress = () => {
        router.push('/profile');
        hideModal();
    };

    const handleLogoutPress = () => {
        logout();
        hideModal();
    };

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
            <Image
                source={require('@/assets/images/logo-header.png')}
                style={styles.logo}
            />
            <IconButton
                icon={<QrIcon />}
                size={30}
                marginLeft={90}
                onPress={openQr}
            />
            <View>
                <IconButton
                    icon={<BellSolidIcon />}
                    size={30}
                    marginLeft={10}
                    onPress={handleNotification}
                />

                {notifications > 0 && (<Badge
                    status="success"
                    value={notifications}
                    containerStyle={{ position: 'absolute', top: -5, left: 35 }}
                />)}
            </View>
            <ButtonHeader
                iconSource={
                    userPic
                        ? { uri: userPic } // Используем uri, если userPic есть
                        : require('@/assets/icons/avatar.png') // Резервное изображение
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
