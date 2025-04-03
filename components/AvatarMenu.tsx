import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserCircleIcon, SignOutIcon } from '@/components/icons/Icons';

type AvatarMenuProps = {
    onClose: () => void;
    onProfilePress: () => void;
    onLogoutPress: () => void;
};

export const AvatarMenu: React.FC<AvatarMenuProps> = ({ onProfilePress, onLogoutPress }) => {
    return (
        <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={onProfilePress}>
                <UserCircleIcon />
                <Text style={styles.menuText}>{'Мой профиль'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItemEnd} onPress={onLogoutPress}>
                <SignOutIcon />
                <Text style={styles.menuText}>{'Выйти'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    menu: {
        width: 160,
        backgroundColor: '#fff',
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    menuItemEnd: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#1B2B65',
    },
});
