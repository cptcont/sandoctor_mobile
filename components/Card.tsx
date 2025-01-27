import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface CardProps {
    title?: string;
    address?: string;
    objectName?: string;
    colorStyle: string;
    time: string;

}

const Card: React.FC<CardProps> = ({ title, colorStyle, address = '', objectName = '', time,  }) => {
    const handleOnPress = () => {
        router.push('/details');
    };
    return (
        <TouchableOpacity onPress={handleOnPress} style={[styles.card, { borderColor: colorStyle }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.text, { color: colorStyle }]}>{title}</Text>
                <Text style={[styles.time, { color: colorStyle }]}>{time}</Text>
            </View>

            {/* Условный рендеринг для адреса */}
            {address !== '' && (
                <View style={styles.addressContainer}>
                    <Text style={styles.address}>{address}</Text>
                </View>
            )}
            {objectName !== '' && (
                <View style={styles.addressContainer}>
                    <Text style={styles.address}>{objectName}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderWidth: 2,
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
    },
    cardHeader: {
        flexDirection: 'row', // Размещаем title и time в одну строку
        justifyContent: 'space-between',
        alignItems: 'center', // Выравниваем по центру по вертикали
        marginBottom: 10, // Отступ сверху для адреса
    },
    text: {
        width: '50%',
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        flexShrink: 0, // Запрещаем сжимание времени
    },
    addressContainer: {
        width: 223, // Ограничение ширины контейнера

    },
    address: {
        fontSize: 10, // Размер шрифта 10
        color: '#000', // Черный цвет для адреса
    },
});

export default Card;
