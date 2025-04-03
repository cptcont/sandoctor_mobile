import React, { useEffect, useState, memo } from 'react';
import { View, Text, Image, StyleSheet, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Zone, Field } from "@/types/Checklist";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import { TransferField } from "@/types/Field";

type Tab1ContentType = {
    index: number;
    itemsTabContent?: Zone[];
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    isFirstTab?: boolean;
    isLastTab?: boolean;
};

const Tab1Content = memo(({
                              itemsTabContent = [],
                              index,
                              onNextTab,
                              onPreviousTab,
                              isFirstTab = true,
                              isLastTab = false,
                          }: Tab1ContentType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const [field, setField] = useState<{ label: string; value: string | null; id?: string }[]>([]);
    const items = itemsTabContent[index].param.map((data: any, index: any) => (
        { label: data.name.toString(), value: index }
    ));

    useEffect(() => {
        if (itemsTabContent[index].param.length > 0) {
            const fieldItem = itemsTabContent[index].param[selectedValue].fields.map((field: Field) => field);
            const transformedField = transformData(fieldItem);
            setField(transformedField);
        } else {
            setField([]);
        }
    }, [selectedValue, index, itemsTabContent]);

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
    });

    const handleSelect = (value: number) => {
        if (value !== null) {
            setSelectedValue(value);
            const fieldItem = itemsTabContent[index].param[value].fields.map((field: Field) => field);
            const transformedField = transformData(fieldItem);
            setField(transformedField);
        }
    };

    const handleNext = async () => {
        if (selectedValue < items.length - 1) {
            const nextIndex = selectedValue + 1;
            setSelectedValue(nextIndex);
            handleSelect(nextIndex);
        } else if (!isLastTab) {
            onNextTab?.();
        }
    };

    const handlePrevious = () => {
        if (selectedValue > 0) {
            const prevIndex = selectedValue - 1;
            setSelectedValue(prevIndex);
            handleSelect(prevIndex);
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
    };

    const transferDataVisible = (data = [{}]) => {
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }

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
                                        <Text key={`option-${optionIndex}`} style={[styles.title, { color: option.color }]}>
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
                    const arrayPhoto = componentData.value || [];
                    return (
                        <View style={styles.imageContainer}>
                            {arrayPhoto.map((foto: any, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: foto.thumbUrl }}
                                    style={[
                                        styles.image,
                                        index !== 3 && styles.imageMargin,
                                    ]}
                                />
                            ))}
                        </View>
                    );
                case 'checkbox':
                    return (
                        <View />
                    );
                case 'select':
                    const dropdownItems = Object.entries(componentData.options || {}).map(([key, opt]: [string, any]) => ({
                        label: opt.value,
                        value: key,
                    }));
                    const defaultValue = Object.entries(componentData.options || {}).find(([key, opt]: [string, any]) => opt.selected)?.[0] || null;

                    return (
                        <View style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={dropdownItems}
                                labelField="label"
                                valueField="value"
                                value={defaultValue}
                                placeholder="Выберите значение"
                                placeholderStyle={{ color: '#000000', fontSize: 12 }}
                                selectedTextStyle={{ color: '#000000', fontSize: 12 }}
                                itemTextStyle={{ fontSize: 14 }}
                                disable={true} // Отключаем взаимодействие, так как это режим просмотра
                            />
                        </View>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <>
            <View style={styles.tab1Container}>
                <View style={styles.text}>
                    <Text style={styles.title}>{'Параметр'}</Text>
                </View>
                <View style={{ marginBottom: 23 }}>
                    <Dropdown
                        style={styles.dropdown}
                        data={items}
                        labelField="label"
                        valueField="value"
                        value={selectedValue}
                        onChange={(item) => handleSelect(item.value)}
                        placeholder="Выберите параметр"
                        placeholderStyle={{ color: '#000000', fontSize: 12 }}
                        selectedTextStyle={{ color: '#000000', fontSize: 12 }}
                        itemTextStyle={{ fontSize: 14 }}
                    />
                </View>
                <View>
                    {transferDataVisible(field)}
                </View>
            </View>
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
                        enabled={selectedValue > 0 || !isFirstTab}
                        touchable={selectedValue > 0 || !isFirstTab}
                    />
                    <TextButton
                        text={'Далее'}
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        onPress={handleNext}
                        enabled={selectedValue < items.length - 1 || !isLastTab}
                        touchable={selectedValue < items.length - 1 || !isLastTab}
                    />
                </View>
            </Footer>
        </>
    );
});

const styles = StyleSheet.create({
    tab1Container: {
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
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    imageMargin: {
        marginRight: 14,
        marginBottom: 14,
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdown: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F5F7FB',
        marginBottom: 5,
    },
});

export default Tab1Content;
