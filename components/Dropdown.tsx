import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet, View } from 'react-native';

interface DropdownProps {
    items: { label: string; value: string }[]; // Данные для выпадающего списка
    defaultValue?: string | null; // Значение по умолчанию
    placeholder?: string; // Плейсхолдер
    onSelect: (value: string | null) => void; // Обработчик выбора значения
    zIndex?: number; // zIndex для управления слоями (если несколько выпадающих списков)
    zIndexInverse?: number; // zIndex для обратного управления слоями
}

const Dropdown: React.FC<DropdownProps> = ({
                                               items,
                                               defaultValue = null,
                                               placeholder = 'Select an item',
                                               onSelect,
                                               zIndex = 1000,
                                               zIndexInverse = 1000,
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
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                labelStyle={styles.labelText} // Стиль для текста элементов списка
                placeholderStyle={styles.placeholderText} // Стиль для плейсхолдера
                textStyle={styles.selectedText} // Стиль для выбранного значения
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical:0,
    },
    dropdown: {
        height: 40,
        borderRadius: 6,
        backgroundColor: '#F5F7FB',
        borderColor: '#F5F7FB',
    },
    dropdownContainer: {

        borderColor: '#ccc',
    },
    labelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#5D6377',
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
