import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Dropdown from '@/components/Dropdown';
import CustomTable from '@/components/CustomTable';
import CustomTableB from '@/components/CustomTableB';
import {Option, Pest, Point, TMCField, Zone} from "@/types/Checklist";
import {TextButton} from "@/components/TextButton";
import Footer from "@/components/Footer";

type Tab3ContentType = {
    index: number;
    itemsTabContent?: Zone[];
};

interface FilterData {
    access: { value: string; color: string };
    point_status: { value: string; color: string };
    mount_condition: { value: string; color: string };
    tmc: TMCField[];
    pests: Pest[];
}

const Tab3Content = ({ itemsTabContent = [], index }: Tab3ContentType) => {
    const [filterData, setFilterData] = useState<FilterData | undefined>();

    const items: { label: string; value: string }[] = itemsTabContent[index].control_points.map((data: Point, index: number) =>
        ({ label: data.name.toString(), value: `tab${index}` })
    );

    const handleSelect = (value: string | null) => {
        if (value !== null) {
            const match = value.match(/\d+$/);
            const num = match ? Number(match[0]) : 0;

            const fieldItem: Point = itemsTabContent[index].control_points[num];
            console.log('Selected Value:', value, 'Parsed Index:', num)
            console.log('fieldItem',fieldItem);

            // Обработка access
            const accessOptions = (fieldItem.fields.access.options as Option[])
                .map((data: Option) => {
                    const value = data.value || '-';
                    const color = data.color || '#939393';
                    return data.selected ? { value, color } : null;
                })
                .find((item) => item !== null) || { value: '-', color: '#939393' };

            // Обработка point_status
            const pointStatus = fieldItem.fields.point_status.options
                ? Object.values(fieldItem.fields.point_status.options).reduce((acc: { value: string; color: string }, data: Option) => {
                    const value = data.value || '-';
                    const color = data.color || '#939393';
                    return data.selected ? { value, color } : acc;
                }, { value: '-', color: '#939393' })
                : { value: '-', color: '#939393' };
            const mountCondition = fieldItem.fields.mount_condition.options
                ? Object.values(fieldItem.fields.mount_condition.options).reduce((acc: { value: string; color: string }, data: Option) => {
                    const value = data.value || '-';
                    const color = data.color || '#939393';
                    return data.selected ? { value, color } : acc;
                }, { value: '-', color: '#939393' })
                : { value: '-', color: '#939393' };
            // Устанавливаем данные в состояние
            const tmc = (fieldItem.tmc)
                .map((data: TMCField) => {
                    return data
                })
            const pests = (fieldItem.pests)
                .map ((data: Pest)=> {
                    return data
                })
            setFilterData({
                access: accessOptions,
                point_status: pointStatus,
                mount_condition: mountCondition,
                tmc: tmc,
                pests: pests,
            });


        }
    };

    // Инициализация filterData при первой загрузке
    useEffect(() => {
        if (itemsTabContent[index].control_points.length > 0) {
            handleSelect('tab0'); // Устанавливаем начальное значение
        }
    }, [itemsTabContent, index]); // Зависимости для useEffect
    console.log('Filter Data:', filterData);

    return (

        <View style={styles.tab3Container}>
            <View style={styles.text}>
                <Text style={styles.title}>{'Точка контроля'}</Text>
            </View>
            <View style={{ marginBottom: 23 }}>
                <Dropdown items={items} defaultValue={'tab0'} onSelect={handleSelect} />
            </View>
            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            <View style={[styles.text, { marginBottom: 17 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Доступ'}</Text>
                <Text style={[styles.title, { color: filterData?.access.color }]}>{filterData?.access.value}</Text>
            </View>
            <View style={[styles.text, { marginBottom: 13 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние'}</Text>
                <Text style={[styles.title, { color: filterData?.point_status.color }]}>{filterData?.point_status.value}</Text>
            </View>
            <View style={[styles.text, { marginBottom: 16 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Состояние крепления'}</Text>
                <Text style={[styles.title, { color: filterData?.mount_condition.color }]}>{filterData?.mount_condition.value}</Text>
            </View>

                <View style={[styles.text, { marginBottom: 19 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Наличие препаратов в ТК'}</Text>
                <CustomTable tmc={filterData?.tmc}/>
            </View>
            <View style={[styles.text, { marginBottom: 20 }]}>
                <Text style={[styles.title, { marginBottom: 5 }]}>{'Вредители'}</Text>
                <CustomTableB pests={filterData?.pests}/>
            </View>
            </ScrollView>
            <Footer>
                <View style={styles.footerContainer}>
                    <TextButton
                        text={'Назад'}
                        type={'secondary'}
                        size={125}
                        onPress={() => {}}
                    />
                    <TextButton
                        text={'Далее'}
                        type={'primary'}
                        size={125}
                        onPress={() => {}}
                    />
                </View>
            </Footer>
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
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default Tab3Content;
