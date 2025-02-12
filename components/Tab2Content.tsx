import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Dropdown from '@/components/Dropdown';
import CustomTable from '@/components/CustomTable';
import CustomTableB from '@/components/CustomTableB';

const Tab2Content = () => {
    const items2 = [
        { label: '12 Приманочный ящик с клеевой пластиной', value: 'viewW' },
    ];

    return (
        <View style={styles.tab3Container}>
            <View style={styles.text}>
                <Text style={styles.title}>{'Точка контроля'}</Text>
            </View>
            <View style={{ marginBottom: 23 }}>
                <Dropdown items={items2} defaultValue={'viewW'} onSelect={() => { }} />
            </View>
            <View style={[styles.text, { marginBottom: 17 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Доступ'}</Text>
                <Text style={[styles.title, { color: '#30DA88' }]}>{'Есть'}</Text>
            </View>
            <View style={[styles.text, { marginBottom: 13 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние'}</Text>
                <Text style={[styles.title, { color: '#F7AA16' }]}>{'Нормальное'}</Text>
            </View>
            <View style={[styles.text, { marginBottom: 16 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние крепления'}</Text>
                <Text style={[styles.title, { color: '#F7AA16' }]}>{'Нормальное'}</Text>
            </View>
            <View style={[styles.text, { marginBottom: 19 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие препаратов в ТК'}</Text>
                <CustomTable />
            </View>
            <View style={[styles.text, { marginBottom: 20 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Вредители'}</Text>
                <CustomTableB />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tab3Container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 14,
    },
    text: {
        marginBottom: 13,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Tab2Content;
