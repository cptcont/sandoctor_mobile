import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Pest, TMCField} from "@/types/Checklist";

type CustomTableBType = {
    pests?: Pest[];
};

const CustomTableB = ({pests = []}: CustomTableBType) => {
    return (
        <View style={styles.container}>
            {/* Шапка таблицы */}
            <View style={styles.headerRow}>
                <Text style={[styles.cellStart ]}>Наименование</Text>
                <Text style={[styles.cell, styles.headerCell]}>Обнаружено</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />

            {pests?.map((data,index) =>(
            <>
            <View key={index} style={styles.dataRow}>
                <Text style={[styles.cellStart]}>{`${data.name}`}</Text>
                <Text style={[styles.cell, { marginRight: 25}]}>{`${data.value}`}</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />
            </>
    ))}
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
