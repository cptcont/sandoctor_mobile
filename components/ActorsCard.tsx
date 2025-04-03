import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Executor = {
    user: string;
    id: string;
    user_id: string;
};

type ActorsCardProps = {
    executors: Executor[];
};

const ActorsCard = ({ executors }: ActorsCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Исполнители'}</Text>
            <View style={styles.container}>
                {executors.map((executor, index) => (
                    <View
                        key={`executor-${executor.id}`}
                        style={[
                            styles.executorContainer,
                            index % 2 === 0 ? styles.leftColumn : styles.rightColumn
                        ]}
                    >
                        <Text style={styles.name}>{executor.user}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
    },
    title: {
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
        paddingBottom: 15,
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 13,
        justifyContent: 'space-between',
    },
    executorContainer: {
        marginBottom: 15,
    },
    leftColumn: {
        width: '50%',
        paddingRight: 5,
        justifyContent: 'flex-start',
    },
    rightColumn: {
        width: '50%',
        paddingLeft: 5,
        justifyContent: 'flex-start',
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1C1F37',
        marginBottom: 5,
    },
});

export default ActorsCard;
