import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Dropdown from '@/components/Dropdown';
import CustomTable from '@/components/CustomTable';
import CustomTableB from '@/components/CustomTableB';
import {Option, Pest, Point, TMCField, Zone} from "@/types/Checklist";
import {TextButton} from "@/components/TextButton";
import Footer from "@/components/Footer";
import {fetchDataSaveStorage, getDataFromStorage} from "@/services/api";

type Tab3ContentType = {
    index: number;
    itemsTabContent?: Zone[];
    onNextTab?: () => void;
    onPreviousTab?: () => void;
};

interface FilterData {
    access: { value: string; color: string };
    point_status: { value: string; color: string };
    mount_condition: { value: string; color: string };
    tmc: TMCField[];
    pests: Pest[];
}

const Tab3Content = ({
                         itemsTabContent = [],
                         index,
                         onNextTab,
                         onPreviousTab,
}: Tab3ContentType) => {
    const [filterData, setFilterData] = useState<FilterData | undefined>();
    const [tabIndex, setTabIndex] = useState('tab0');
    const [tmcData, setTmcData] = useState<Map<string, string>>();
    const items: { label: string; value: string }[] = itemsTabContent[index].control_points.map((data: Point, index: number) =>
        ({ label: data.name.toString(), value: `tab${index}` })
    );

    useEffect(() => {
        const fields = itemsTabContent[index]?.control_points[0]?.fields || [];
        const TMC = itemsTabContent[index]?.control_points[0]?.tmc || [];
        const pests = itemsTabContent[index]?.control_points[0]?.pests || [];

        const fieldsTMC = { tmc: Array.isArray(TMC) ? TMC.flat() : [] };
        const fieldsPests = { pests: Array.isArray(pests) ? pests.flat() : [] };
        const fieldItem = { fields: Array.isArray(fields) ? fields : [] };

        const combinedArray = [fieldItem, fieldsTMC, fieldsPests];
        console.log('combinedArray', combinedArray);
        console.log('filteredData', filteredData(combinedArray));
        setFilterData(filteredData(combinedArray))

    }, []);

    useEffect(() => {
        const match = tabIndex.match(/\d+$/);
        const num = match ? Number(match[0]) : 0;

        const fields = itemsTabContent[index]?.control_points[num]?.fields || [];
        const TMC = itemsTabContent[index]?.control_points[num]?.tmc || [];
        const pests = itemsTabContent[index]?.control_points[num]?.pests || [];

        const fieldsTMC = { tmc: Array.isArray(TMC) ? TMC.flat() : [] };
        const fieldsPests = { pests: Array.isArray(pests) ? pests.flat() : [] };
        const fieldItem = { fields: Array.isArray(fields) ? fields : [] };

        const combinedArray = [fieldItem, fieldsTMC, fieldsPests];
        console.log('combinedArray', combinedArray);
        console.log('filteredData', filteredData(combinedArray));
        setFilterData(filteredData(combinedArray))

    }, [tabIndex]);

    const filteredData = (data) => {
        let accessOptions = {};
        let pointStatus = {};
        let mountCondition = {};
        let tmcData = [];
        let pestsData = [];

        data.forEach(item => {
            if (item.fields) {
                item.fields.forEach(fieldItem => {
                    if (fieldItem.type === "radio") {
                        const selectedOption = fieldItem.options.find(option => option.selected);
                        if (selectedOption) {
                            accessOptions = {
                                label: fieldItem.label,
                                value: selectedOption.value,
                                color: selectedOption.color
                            };
                        } else {
                            accessOptions = {
                                value: "-",
                                color: "#000000"
                            };
                        }
                    }
                    if (fieldItem.type === "select" && fieldItem.id === "point_status") {
                        const selectedOption = Object.values(fieldItem.options).find(option => option.selected);
                        if (selectedOption) {
                            pointStatus = {
                                label: fieldItem.label,
                                value: selectedOption.value,
                                color: selectedOption.color
                            };
                        }
                    }
                    if (fieldItem.type === "select" && fieldItem.id === "mount_condition") {
                        const selectedOption = Object.values(fieldItem.options).find(option => option.selected);
                        if (selectedOption) {
                            mountCondition = {
                                label: fieldItem.label,
                                value: selectedOption.value,
                                color: selectedOption.color
                            };
                        }
                    }
                });
            }
            if (item.tmc) {
                tmcData = item.tmc.map(tmcItem => {
                    return { name: tmcItem.name, value: tmcItem.value };
                });
            }
            if (item.pests) {
                pestsData = item.pests.map(pestItem => {
                    return { name: pestItem.name, value: pestItem.field.value };
                });
            }
        });

        return {
            access: accessOptions,
            point_status: pointStatus,
            mount_condition: mountCondition,
            tmc: tmcData,
            pests: pestsData,
        };
    };

    const handleSelect = (value: string | null) => {
        if (value !== null) {
            const match = value.match(/\d+$/);
            const num = match ? Number(match[0]) : 0;
            setTabIndex(value)

        }
    };
    const handleNext = async () => {
        const match = tabIndex.match(/\d+$/);
        const currentIndex = match ? Number(match[0]) : 0;

        if (currentIndex < items.length - 1) {
            const nextIndex = `tab${currentIndex + 1}`;
            setTabIndex(nextIndex);
            handleSelect(nextIndex);
        } else {
            onNextTab?.();
        }
    };

    const handlePrevious = () => {
        const match = tabIndex.match(/\d+$/);
        const currentIndex = match ? Number(match[0]) : 0;

        if (currentIndex > 0) {
            const prevIndex = `tab${currentIndex - 1}`;
            setTabIndex(prevIndex);
            handleSelect(prevIndex);
        } else {
            onPreviousTab?.();
        }
    };
    // Инициализация filterData при первой загрузке
    //useEffect(() => {
    //    if (itemsTabContent[index].control_points.length > 0) {
    //        handleSelect('tab0'); // Устанавливаем начальное значение
    //    }
    //}, [itemsTabContent, index]); // Зависимости для useEffect
    console.log('Filter Data:', filterData);

    return (

        <View style={styles.tab3Container}>
            <View style={styles.text}>
                <Text style={styles.title}>{'Точка контроля'}</Text>
            </View>
            <View style={{ marginBottom: 23 }}>
                <Dropdown
                    key={tabIndex}
                    items={items}
                    defaultValue={tabIndex}
                    onSelect={handleSelect} />
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
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#5D6377'}
                        onPress={handlePrevious}
                    />
                    <TextButton
                        text={'Далее'}
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        onPress={handleNext}
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
