import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomTableB = () => {
    return (
        <View style={styles.container}>
            {/* Шапка таблицы */}
            <View style={styles.headerRow}>
                <Text style={[styles.cellStart ]}>Наименование</Text>
                <Text style={[styles.cell, styles.headerCell]}>Обнаружено</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />

            {/* Первая строка данных */}
            <View style={styles.dataRow}>
                <Text style={[styles.cellStart]}>Блохи</Text>
                <Text style={[styles.cell, { marginRight: 25}]}>1</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />

            {/* Вторая строка данных */}
            <View style={styles.dataRow}>
                <Text style={[styles.cellStart ]}>Древесный точильщик</Text>
                <Text style={[styles.cell, { marginRight: 25}]}>4</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 5,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 5,
    },
    cell: {
        width: 'auto',
        fontSize: 10,
        color: '#1C1F37',
    },
    cellStart: {
        flex: 3,
        width: 'auto',
        fontSize: 10,
        color: '#1C1F37',
    },
    headerCell: {
        fontWeight: '500',
        fontSize: 10,
        color: '#939393',
    },
    separator: {
        height: 1,
        backgroundColor: '#DADADA',
    },
});

export default CustomTableB;
