import React, { useState } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { View, StyleSheet, Image } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';
import { AvatarMenu } from '@/components/AvatarMenu';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router'
import {IconButton} from "@/components/IconButton";
import {BellSolidIcon, BurgerSolidIcon, QrIcon} from "@/components/icons/Icons";

export function CustomHeader() {
    const { logout } = useAuth();
    const navigation = useNavigation();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const openMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const toggleAvatarMenu = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleProfilePress = () => {
        setIsMenuVisible(false);
        router.push('/profile');
    };

    const handleLogoutPress = () => {
        setIsMenuVisible(false);
        logout();
    };

    return (
        <View style={styles.header}>
            <Image
                source={require('@/assets/images/logo-header.png')}
                style={styles.logo}
            />
            <IconButton
                icon={<BurgerSolidIcon/>}
                size={30}
                onPress={openMenu}
                marginLeft={18}
            />
            <IconButton
                icon={<QrIcon/>}
                size={30}
                marginLeft={90}/>
            <IconButton
                icon={<BellSolidIcon/>}
                size={30}
                marginLeft={10}
            />
            <ButtonHeader
                iconSource={require('@/assets/icons/avatar.png')}
                size={30}
                marginLeft={10}
                marginRight={20}
                onPress={toggleAvatarMenu}
            />

            {isMenuVisible && (
                <AvatarMenu
                    onClose={() => setIsMenuVisible(false)}
                    onProfilePress={handleProfilePress}
                    onLogoutPress={handleLogoutPress}
                />
            )}
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
