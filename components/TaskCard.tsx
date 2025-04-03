import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface TaskCardProps {
    title: string;
    idStatus?: number;
    bgColor?: string;
    onPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, idStatus = 0, bgColor = '#F9F9F9', onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <View style={styles.cardTitle}>
                <Text style={styles.title}>{title}</Text>
            </View>
            {idStatus === 0 && (
                <View style={[styles.statusNew, { backgroundColor: bgColor }]}>
                </View>
            )}
            {idStatus === 3 && (
                <View style={[styles.statusActive, { backgroundColor: bgColor }]}>
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
        width: '90%',
    },
    title: {
        fontSize: 12,
        fontWeight: 'medium',
    },
    statusCompleted: {
        width: 7,
        height: 7,
        borderRadius: 50,
    },
    statusActive: {
        width: 7,
        height: 7,
        borderRadius: 50,
    },
    statusNew: {
        width: 7,
        height: 7,
        borderRadius: 50,
        backgroundColor: '#248AFD',
    }
});

export default TaskCard;
