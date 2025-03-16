import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet, View } from 'react-native';

interface DropdownProps {
    items: { label: string; value: string }[]; // Данные для выпадающего списка
    defaultValue?: string | null | number; // Значение по умолчанию
    placeholder?: string; // Плейсхолдер
    onSelect: (value: string | null | number) => void; // Обработчик выбора значения
    zIndex?: number; // zIndex для управления слоями (если несколько выпадающих списков)
    zIndexInverse?: number; // zIndex для обратного управления слоями
    bgColor?: string;
    bdColor?: string;
    textColor?: string;
    textAlign?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
                                               items,
                                               defaultValue = null,
                                               placeholder = 'Нет данных для отображения',
                                               onSelect,
                                               zIndex = 2000,
                                               zIndexInverse = 1000,
                                               bgColor = '#F5F7FB',
                                               bdColor = '#F5F7FB',
                                               textColor = '#5D6377',
                                               textAlign = 'left',

                                           }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(defaultValue);
    const [pickerItems, setPickerItems] = useState(items);

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={value}
                items={pickerItems}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setPickerItems}
                placeholder={placeholder}
                onChangeValue={(selectedValue) => {
                    onSelect(selectedValue); // Вызываем обработчик при изменении значения
                }}
                zIndex={zIndex} // Управление слоями
                zIndexInverse={zIndexInverse} // Управление слоями
                style={[styles.dropdown, {backgroundColor: bgColor, borderColor: bdColor,}]}
                dropDownContainerStyle={styles.dropdownContainer}
                labelStyle={[styles.labelText, {color: textColor }]} // Стиль для текста элементов списка
                placeholderStyle={styles.placeholderText} // Стиль для плейсхолдера
                textStyle={styles.selectedText} // Стиль для выбранного значения

            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical:0,
        zIndex: 2000,
    },
    dropdown: {
        height: 60,
        borderRadius: 6,

    },
    dropdownContainer: {
        color: 'red',
        borderColor: '#ccc',
    },
    labelText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    placeholderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#5D6377',
    },
    selectedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#5D6377',
    },
});

export default Dropdown;
