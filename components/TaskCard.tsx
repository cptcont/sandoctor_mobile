import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface TaskCardProps {
    title: string;
    status: 'active' | 'completed';
    onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, status, onPress  }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <View style={styles.cardTitle}>
                <Text style={styles.title}>{title}</Text>
            </View>
            {status === 'completed' && (
                <View style={styles.statusCompleted}>
                </View>
            )}
            {status === 'active' && (
                <View style={styles.statusActive}>
                </View>            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#ECECEC',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
    },
    title: {
        fontSize: 12,
        fontWeight: 'medium',
    },
    statusCompleted: {
        width: 7,
        height: 7,
        borderRadius: 50,
        backgroundColor: '#30DA88',

    },
    statusActive: {
        width: 7,
        height: 7,
        borderRadius: 50,
        backgroundColor: '#FFA500',
    },
});

export default TaskCard;
