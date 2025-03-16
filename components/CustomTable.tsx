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
                    <View style={[styles.cellContainer]}>
                        <Text style={[styles.cell, { }]}>{`${data.value.n}`}</Text>
                        <Text style={[styles.cell, { }]}>{`${data.value.p}`}</Text>
                        <Text style={[styles.cell, { }]}>{`${data.value.u}`}</Text>
                        <Text style={[styles.cell, {}]}>{`${data.value.v}`}</Text>
                    </View>
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
    cellContainer: {
        width: '60%',
        flexDirection: 'row',
        justifyContent: 'space-around',

    },
    cell: {

        fontSize: 8,
        color: '#1C1F37',
    },
    cellStart: {
        flex: 3,
        width: '40%',
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
