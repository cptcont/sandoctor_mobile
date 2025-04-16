import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Option, Pest, Point, TMCField, Zone } from "@/types/Checklist";
import { TextButton } from "@/components/TextButton";
import Footer from "@/components/Footer";
import { TransferField } from "@/types/Field";

type Tab3ContentType = {
    index: number;
    itemsTabContent?: Zone[];
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    isFirstTab?: boolean;
    isLastTab?: boolean;
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
                         isFirstTab = true,
                         isLastTab = false,
                     }: Tab3ContentType) => {
    const [field, setField] = useState<TransferField[]>([]);
    const [tabIndex, setTabIndex] = useState('tab0');
    const [tmcValues, setTmcValues] = useState<Record<string, { n: string; u: string; v: string }>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});

    const items: { label: string; value: string }[] = itemsTabContent[index].control_points.map((data: Point, index: number) =>
        ({ label: data.name.toString(), value: `tab${index}` })
    );

    const transformObjectToArrayTMC = (originalObject: any) => {
        const { name, fields } = originalObject;
        const fieldName = fields.p.name;
        const baseName = fieldName.replace(/\[[^\]]+\]$/, "");
        return [{
            name: baseName,
            label: name,
            type: 'tmc',
            value: fields,
        }];
    };

    const transformObjectToArrayPests = (originalObject: any) => {
        const { name, field } = originalObject;
        return [{
            type: "pest",
            name: field.name,
            value: field.value,
            label: name,
        }];
    };

    useEffect(() => {
        const updateFields = () => {
            const match = tabIndex.match(/\d+$/);
            const num = match ? Number(match[0]) : 0;

            const fields = itemsTabContent[index]?.control_points[num]?.fields;
            const TMC = itemsTabContent[index]?.control_points[num]?.tmc;
            const pests = itemsTabContent[index]?.control_points[num]?.pests;

            const fieldsTMC = Array.isArray(TMC) ? TMC.map((data: any) => transformObjectToArrayTMC(data)).flat() : [];
            const fieldsPests = Array.isArray(pests) ? pests.map((data: any) => transformObjectToArrayPests(data)).flat() : [];
            const fieldItem = Array.isArray(fields) ? fields.map((field: any) => field) : [];
            const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];
            const transformedField = transformData(combinedArray);

            const initialTmcValues: Record<string, { n: string; u: string; v: string }> = {};
            const initialPestValues: Record<string, string> = {};

            if (Array.isArray(transformedField)) {
                transformedField.forEach(item => {
                    if (item?.tmc) {
                        initialTmcValues[item.tmc.name] = {
                            n: item.tmc.value.n.value,
                            u: item.tmc.value.u.value,
                            v: item.tmc.value.v.value,
                        };
                    }
                    if (item?.pest) {
                        initialPestValues[item.pest.name] = item.pest.value;
                    }
                });
            }

            setTmcValues(initialTmcValues);
            setPestValues(initialPestValues);
            setField(transformedField);
        };

        updateFields();
    }, [tabIndex, index, itemsTabContent]);

    const transformData = (data: TransferField[]) => data.map(data => {
        if (data.type === "radio") {
            return {
                radio: {
                    label: data.label,
                    name: data.name,
                    options: data.options.map(option => ({
                        text: option.text,
                        value: option.value,
                        color: option.color,
                        bgcolor: option.bgcolor,
                        selected: option.selected,
                    })),
                }
            };
        }
        if (data.type === "text") {
            return { text: { label: data.label, value: data.value, name: data.name } };
        }
        if (data.type === "foto") {
            return { foto: { value: data.value, name: data.name } };
        }
        if (data.type === "checkbox") {
            return { checkbox: { label: data.label, checked: data.checked, name: data.name } };
        }
        if (data.type === "select") {
            return { select: { label: data.label, options: data.options, name: data.name } };
        }
        if (data.type === "tmc") {
            return { tmc: { label: data.label, name: data.name, value: data.value } };
        }
        if (data.type === "pest") {
            return { pest: { label: data.label, name: data.name, value: data.value } };
        }
    });

    const transferDataVisible = (data = [{}]) => {
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }

        // Проверяем, есть ли radio-компонент и все ли его опции не выбраны
        let hasRadio = false;
        let allRadioOptionsUnselected = false;
        data.forEach(item => {
            if (item.radio) {
                hasRadio = true;
                allRadioOptionsUnselected = !item.radio.options.some(option => option.selected);
            }
        });

        // Если есть radio и все опции не выбраны, показываем только сообщение
        if (hasRadio && allRadioOptionsUnselected) {
            return (
                <View style={[styles.text, { marginBottom: 17 }]}>
                    <Text style={[styles.title, { color: '#017EFA' }]}>Данные не заполнены</Text>
                </View>
            );
        }

        // Иначе отображаем данные как обычно
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest = false;

        let isNoSelected = false;
        data.forEach(item => {
            if (item.radio) {
                isNoSelected = item.radio.options.some(option => option.value === "0" && option.selected);
            }
        });

        return data.map((item, index) => {
            if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
                return null;
            }

            const type = Object.keys(item)[0];
            const componentData = item[type];

            if (!componentData) {
                return null;
            }

            if (type !== 'radio' && isNoSelected) {
                return null;
            }

            switch (type) {
                case 'radio':
                    return (
                        <View key={`radio-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            {componentData.options.map((option, optionIndex) => {
                                if (option.selected) {
                                    return (
                                        <Text key={`option-${optionIndex}`} style={[styles.title, { color: '#939393' }]}>
                                            {option.text}
                                        </Text>
                                    );
                                }
                                return null;
                            })}
                        </View>
                    );
                case 'text':
                    return (
                        <View key={`text-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <Text style={[styles.title, { color: '#939393' }]}>{`${componentData.value}`}</Text>
                        </View>
                    );
                case 'foto':
                    return <View key={`foto-${index}`} />;
                case 'checkbox':
                    return <View key={`checkbox-${index}`} />;
                case 'select':
                    const selectedOption = Object.values(componentData.options || {}).find(option => option.selected === true);
                    return (
                        <View key={`select-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <Text style={[styles.title, { color: selectedOption.color }]}>{`${selectedOption.value}`}</Text>
                        </View>
                    );
                case 'tmc':
                    return (
                        <>
                            {!isHeaderVisibleTmc && (
                                <>
                                    <Text style={styles.tmcTitle}>{'Наличие препаратов в ТК'}</Text>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>{'Наименование'}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.tmcHeaderText}>{'В наличии'}</Text>
                                            <Text style={styles.tmcHeaderText}>{'Утилизировано'}</Text>
                                            <Text style={styles.tmcHeaderText}>{'Внесено'}</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            {!isHeaderVisibleTmc && (isHeaderVisibleTmc = true)}
                            <View key={`tmc-${index}`} style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}>
                                <Text style={[styles.tmcText, { width: '50%' }]}>{`${componentData.label}`}</Text>
                                <View style={{ width: '44%', flexDirection: 'row', justifyContent: 'space-between', marginRight: 12 }}>
                                    <Text style={styles.tmcTextInput}>{tmcValues[componentData.name]?.n || ''}</Text>
                                    <Text style={styles.tmcTextInput}>{tmcValues[componentData.name]?.u || ''}</Text>
                                    <Text style={styles.tmcTextInput}>{tmcValues[componentData.name]?.v || ''}</Text>
                                </View>
                            </View>
                        </>
                    );
                case 'pest':
                    return (
                        <>
                            {!isHeaderVisiblePest && (
                                <>
                                    <Text style={styles.tmcTitle}>{'Вредители'}</Text>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>{'Наименование'}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.tmcHeaderText}>{'Обнаружено'}</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            {!isHeaderVisiblePest && (isHeaderVisiblePest = true)}
                            <View key={`pest-${index}`} style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}>
                                <Text style={[styles.tmcText, { width: '50%' }]}>{`${componentData.label}`}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 20 }}>
                                    <Text style={styles.tmcTextInput}>{pestValues[componentData.name] || ''}</Text>
                                </View>
                            </View>
                        </>
                    );
                default:
                    return null;
            }
        });
    };

    const handleSelect = (value: string | null) => {
        if (value !== null) {
            setTabIndex(value);
        }
    };

    const handleNext = async () => {
        const match = tabIndex.match(/\d+$/);
        const currentIndex = match ? Number(match[0]) : 0;

        if (currentIndex < items.length - 1) {
            const nextIndex = `tab${currentIndex + 1}`;
            setTabIndex(nextIndex);
            handleSelect(nextIndex);
        } else if (!isLastTab) {
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
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
    };

    return (
        <View style={styles.tab3Container}>
            <View style={styles.text}>
                <Text style={styles.title}>{'Точка контроля'}</Text>
            </View>
            <View style={{ marginBottom: 23 }}>
                <Dropdown
                    style={styles.dropdown}
                    data={items}
                    labelField="label"
                    valueField="value"
                    value={tabIndex}
                    onChange={(item) => handleSelect(item.value)}
                    placeholder="Выберите параметр"
                    placeholderStyle={{ color: '#000000', fontSize: 12 }}
                    selectedTextStyle={{ color: '#000000', fontSize: 12 }}
                    itemTextStyle={{ fontSize: 14 }}
                />
            </View>
            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                {transferDataVisible(field)}
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
                        enabled={tabIndex !== 'tab0' || !isFirstTab}
                        touchable={tabIndex !== 'tab0' || !isFirstTab}
                    />
                    <TextButton
                        text={'Далее'}
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        onPress={handleNext}
                        enabled={tabIndex !== `tab${items.length - 1}` || !isLastTab}
                        touchable={tabIndex !== `tab${items.length - 1}` || !isLastTab}
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
    tmcContainer: {
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    tmcTitle: {
        marginTop: 10,
        marginBottom: 12,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1C1F37',
    },
    tmcHeaderContainer: {
        marginBottom: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    tmcHeaderText: {
        marginRight: 5,
        fontSize: 10,
        fontWeight: 'medium',
        color: '#919191',
    },
    tmcTextInput: {
        width: 20,
        height: 20,
        backgroundColor: '#F5F7FB',
        fontSize: 10,
        color: '#1C1F37',
        textAlign: 'center',
    },
    tmcText: {
        fontSize: 10,
        color: '#1C1F37',
    },
    dropdown: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F5F7FB',
        marginBottom: 5,
    },
});

export default Tab3Content;
