import React, { useEffect, useState,memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Dropdown from '@/components/Dropdown';
import { Zone, Field, Param } from "@/types/Checklist";
import Footer from "@/components/Footer";
import {TextButton} from "@/components/TextButton";

type Tab1ContentType = {
    index: number;
    itemsTabContent?: Zone[];
};

const Tab1Content = memo(({ itemsTabContent = [], index }: Tab1ContentType) => {
    const [selectedValue, setSelectedValue] = useState('tab0');
    const [field, setField] = useState<{ label: string; value: string | null; id?: string}[]>([]);
    const items = itemsTabContent[index].param.map((data: Param, index: any) => (
        { label: data.name.toString(), value: `tab${index}` }
    ));
    console.log('Tab1Content');
    useEffect(() => {
        if (
            itemsTabContent[index].param.length > 0 ) {
            const fieldItem = itemsTabContent[index].param[0].fields.map((field: Field) => field);
            const transformedField = transformData(fieldItem);
            setField(transformedField);
        } else {
            setField([]); // Если данных нет, устанавливаем пустой массив
        }
    }, [itemsTabContent, index]);

    function transformData(data: Field[]): { label: string; value: string | null; type?: string; options?: any; id?: string }[] {
        return data.map(item => {
            let value: string | null;
            if (item.type === 'radio' && item.options) {
                const selectedOption = Object.values(item.options).find(opt => opt.selected);
                value = selectedOption ? selectedOption.value : null;
            } else if (item.type === 'checkbox') {
                value = item.checked ? 'да' : 'нет';
            } else if (item.type === 'select' && item.options) {
                const selectedOption = Object.values(item.options).find(opt => opt.selected);
                value = selectedOption ? selectedOption.value : null;
            } else {
                value = item.value ?? null;
            }

            // Добавляем замену null на '-' если id === '1'
            if (item.id === '1' && value === null) {
                value = '-';
            }

            return {
                label: item.label,
                value,
                type: item.type,
                options: item.options,
                id: item.id // Добавляем id
            };
        });
    }
    const handleSelect = (value: string | null) => {
        if (value !== null) {
            setSelectedValue(value);
            const match = value.match(/\d+$/);
            const num = match ? Number(match[0]) : 0;
            const fieldItem = itemsTabContent[index].param[num].fields.map((field: Field) => field);
            const transformedField = transformData(fieldItem);
            setField(transformedField);
        }
    };

    const renderField = (field: { label: string; value: string | [] | null; type?: string; options?: any; id?: string }) => {
        if (field.type === 'foto') {
            const arrayFoto = field.value || [];
            if (!Array.isArray(arrayFoto)) {
                return null; // or return some fallback UI
            }

            return (
                <View style={styles.imageContainer}>
                    {arrayFoto.map((foto: any, index: number) => (
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
        } else if (field.type === 'select') {
            // Преобразуем options в формат для Dropdown
            const dropdownItems = Object.entries(field.options || {}).map(([key, opt]: [string, any]) => ({
                label: opt.value,
                value: key,
            }));

            // Находим выбранное значение
            const defaultValue = Object.entries(field.options || {}).find(([key, opt]: [string, any]) => opt.selected)?.[0] || null;

            return (
                <View style={[styles.text, { marginBottom: 17 }]}>
                    <Text style={[styles.title, { color: '#1C1F37' }]}>{`${field.label}`}</Text>
                    <Dropdown
                        items={dropdownItems}
                        defaultValue={defaultValue}
                        onSelect={(value) => {
                            console.log('Selected:', value);
                            // Здесь можно обновить состояние, если нужно
                        }}
                    />
                </View>
            );
        } else {
            let valueColor = '#939393';
            if (field.value === 'да') {
                valueColor = '#FD1F9B';
            } else if (field.value === 'нет') {
                valueColor = '#30DA88';
            }

            return (
                <View style={[styles.text, { marginBottom: 17 }]}>
                    <Text style={[styles.title, { color: '#1C1F37' }]}>{`${field.label}`}</Text>
                    <Text style={[styles.title, { color: valueColor, fontSize: 12 }]}>{`${field.value}`}</Text>
                </View>
            );
        }
    };

    return (
        <>
            <View style={styles.tab1Container}>
                <View style={styles.text}>
                    <Text style={styles.title}>{'Параметр'}</Text>
                </View>
                <View style={{ marginBottom: 23 }}>
                    <Dropdown items={items} defaultValue={'tab0'} onSelect={handleSelect} />
                </View>
                {field.some(f => f.value === 'нет' && f.id === '1' || f.value === '-' && f.id === '1')
                    ? field
                        .slice(0, field.findIndex(f => f.value === 'нет' && f.id === '1' || f.value === '-' && f.id === '1') + 1)
                        .map((fieldItem, index) => (
                            <View key={index}>{renderField(fieldItem)}</View>
                        ))
                    : field.map((fieldItem, index) => (
                        <View key={index}>{renderField(fieldItem)}</View>
                    ))}

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
                        onPress={() => {}}
                    />
                    <TextButton
                        text={'Далее'}
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        onPress={() => {}}
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
});

export default Tab1Content;
