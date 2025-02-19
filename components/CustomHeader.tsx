import React from 'react';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { IconButton } from '@/components/IconButton';
import { BellSolidIcon, BurgerSolidIcon, QrIcon } from '@/components/icons/Icons';
import { useModal } from '@/context/ModalContext'; // Импортируем контекст
import { AvatarMenu } from '@/components/AvatarMenu';

export function CustomHeader() {
    const { logout } = useAuth();
    const navigation = useNavigation();
    const { showModal, hideModal, isModalVisible, modalContent, overlayStyle, overlayBackgroundStyle, modalContentStyle } = useModal(); // Используем контекст

    const openMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const handleProfilePress = () => {
        router.push('/profile');
        hideModal()
    };

    const handleLogoutPress = () => {
        logout();
        hideModal()
    };

    const toggleAvatarMenu = () => {
        // Показываем модальное окно с содержимым AvatarMenu
        showModal(
            <AvatarMenu
                onClose={() => {}}
                onProfilePress={handleProfilePress}
                onLogoutPress={handleLogoutPress}
            />, {
                overlay: { alignItems: 'flex-end' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0)' },
                modalContent: { paddingTop: 60, paddingRight: 10 },
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
                icon={<BurgerSolidIcon />}
                size={30}
                onPress={openMenu}
                marginLeft={18}
            />
            <IconButton
                icon={<QrIcon />}
                size={30}
                marginLeft={90}
            />
            <IconButton
                icon={<BellSolidIcon />}
                size={30}
                marginLeft={10}
            />
            <ButtonHeader
                iconSource={require('@/assets/icons/avatar.png')}
                size={30}
                marginLeft={10}
                marginRight={20}
                onPress={toggleAvatarMenu} // Открываем модальное окно
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
