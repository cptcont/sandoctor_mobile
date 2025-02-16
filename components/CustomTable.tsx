import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {TMCField} from "@/types/Checklist";

type CustomTableType = {
    tmc?: TMCField[];
};

const CustomTable = ({tmc = []}:CustomTableType) => {
    console.log('CustomTableTMC', tmc);
    return (
        <View style={styles.container}>
            {/* Шапка таблицы */}
            <View style={styles.headerRow}>
                <Text style={[styles.cellStart ]}>Наименование</Text>
                <Text style={[styles.cell, styles.headerCell]}>В наличии</Text>
                <Text style={[styles.cell, styles.headerCell]}>Съедено</Text>
                <Text style={[styles.cell, styles.headerCell]}>Утилизировано</Text>
                <Text style={[styles.cell, styles.headerCell]}>Внесено</Text>
            </View>

            {/* Разделитель */}
            <View style={styles.separator} />

            {tmc?.map((data,index) =>(
           <>
                <View key={index} style={styles.dataRow}>
                <Text style={[styles.cellStart]}>{`${data.name}`}</Text>
                <Text style={[styles.cell, { marginRight: 40}]}>10</Text>
                <Text style={[styles.cell, { marginRight: 55}]}>5</Text>
                <Text style={[styles.cell, { marginRight: 50}]}>0</Text>
                <Text style={[styles.cell, { marginRight: 12}]}>0</Text>
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
        paddingVertical: 7,
        paddingHorizontal: 5,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
        paddingHorizontal: 5,
    },
    cell: {
        width: 'auto',
        fontSize: 8,
        color: '#1C1F37',
    },
    cellStart: {
        flex: 3,
        width: 'auto',
        fontSize: 10,
        color: '#1C1F37',
    },
    headerCell: {
        marginLeft: 10,
        fontWeight: '500',
        fontSize: 8,
        color: '#939393',
    },
    separator: {
        height: 1,
        backgroundColor: '#DADADA',
    },
});

export default CustomTable;
