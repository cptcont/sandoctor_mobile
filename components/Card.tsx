import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface CardProps {
    title?: string;
    address?: string;
    objectName?: string;
    colorStyle: string;
    time?: string;
    onPress?: () => void;
    noTasks?: boolean;
}

const Card: React.FC<CardProps> = ({ title, colorStyle, address = '', objectName = '', time, onPress, noTasks }) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, { borderColor: colorStyle }]}>
            {noTasks ? (
                <View style={styles.noTasksContainer}>
                    <Text style={styles.noTasksText}>Заданий нет</Text>
                </View>
            ) : (
                <>
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
                </>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    text: {
        width: '50%',
        fontSize: 16,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        flexShrink: 0,
    },
    addressContainer: {
        width: 223,
    },
    address: {
        fontSize: 10,
        color: '#000',
    },
    noTasksContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 50, // Минимальная высота для карточки
    },
    noTasksText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default Card;
