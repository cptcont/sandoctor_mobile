import React, { useEffect, useState, memo, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { MMKV } from 'react-native-mmkv';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ImagePickerWithCamera from '@/components/ImagePickerWithCamera';
import CustomSwitch from '@/components/CustomSwitch';
import { Checklist, Zone } from '@/types/Checklist';
import { FormField, TransferField } from '@/types/Field';
import { storage } from "@/storage/storage";
import { postData } from '@/services/api';

type Tab1ContentEditType = {
    id: string | string[];
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    idCheckList?: string;
    isFirstTab?: boolean;
    isLastTab?: boolean;
};

const Tab1ContentEdit = ({
                             id,
                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             idCheckList = '0',
                             itemsTabContent = [],
                             isFirstTab = true,
                             isLastTab = false,
                         }: Tab1ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [radioStates, setRadioStates] = useState<
        Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>
    >({});
    const [allFields, setAllFields] = useState<Record<string, TransferField[]>>({});
    const [isTextValid, setIsTextValid] = useState<Record<string, boolean>>({});
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const getStorageKey = (key: string) => `checklist_${idCheckList}_${key}`;

    useEffect(() => {
        const loadInitialData = async () => {
            const storedChecklists = storage.getString(getStorageKey('checklists'));
            const storedAllFields = storage.getString(getStorageKey('allFields'));

            setChecklists(storedChecklists ? JSON.parse(storedChecklists) : []);
            setAllFields(storedAllFields ? JSON.parse(storedAllFields) : {});
            setIsMounted(true);

            try {
                const response = await postData(`checklist/${idCheckList}`, {});
                if (response?.data) {
                    setChecklists(response.data);
                    storage.set(getStorageKey('checklists'), JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Ошибка при загрузке checklists:', error);
            }
        };

        loadInitialData();

        // Функция очистки для удаления данных MMKV при размонтировании компонента
        return () => {
            storage.delete(getStorageKey('checklists')); // Удаление данных checklists
            storage.delete(getStorageKey('allFields'));  // Удаление данных allFields
            // Опционально: очистка всех данных, если нужно
            // storage.clearAll();
        };
    }, []);

    console.log('Это Tab1ContentEdit')

    const items = useMemo(
        () =>
            itemsTabContent[index]?.param?.map((data: any, idx: number) => ({
                label: data.name?.toString() || `Элемент ${idx}`,
                value: idx,
            })) || [],
        [itemsTabContent, index]
    );

    const transformData = (data: FormField[]): TransferField[] => {
        return data
            .map((field) => {
                if (field.type === 'radio') {
                    return { radio: { label: field.label, name: field.name, options: field.options.map((opt) => ({ ...opt })) } };
                }
                if (field.type === 'text') {
                    return { text: { label: field.label, value: field.value, name: field.name } };
                }
                if (field.type === 'foto') {
                    return { foto: { value: field.value || [], name: field.name } };
                }
                if (field.type === 'checkbox') {
                    return { checkbox: { label: field.label, checked: field.checked, name: field.name } };
                }
                return null;
            })
            .filter((item): item is TransferField => item !== null);
    };

    const saveCurrentState = (value: number) => {
        setAllFields(prev => ({
            ...prev,
            [value]: field
        }));
        storage.set(getStorageKey('allFields'), JSON.stringify({
            ...allFields,
            [value]: field
        }));
    };

    const loadFields = (value: number) => {
        if (!itemsTabContent[index]?.param?.[value]) return;

        const savedFields = allFields[value];

        if (savedFields) {
            setField(savedFields);

            const updatedInputTexts: Record<string, string> = {};
            const updatedIsEnabled: Record<string, boolean> = {};
            const updatedRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
            const updatedTextValid: Record<string, boolean> = {};

            savedFields.forEach((item) => {
                if (item?.text) {
                    updatedInputTexts[item.text.name] = item.text.value || '';
                    updatedTextValid[item.text.name] = (item.text.value?.length || 0) >= 5;
                }
                if (item?.checkbox) {
                    updatedIsEnabled[item.checkbox.name] = item.checkbox.checked || false;
                }
                if (item?.radio) {
                    updatedRadioStates[item.radio.name] = {
                        yes: item.radio.options.some((opt) => opt.value === '1' && opt.selected),
                        no: item.radio.options.some((opt) => opt.value === '0' && opt.selected),
                        isContentVisible: item.radio.options.some((opt) => opt.selected && opt.value === '1'),
                    };
                }
            });

            setInputTexts(prev => ({ ...prev, ...updatedInputTexts }));
            setIsEnabled(prev => ({ ...prev, ...updatedIsEnabled }));
            setRadioStates(prev => ({ ...prev, ...updatedRadioStates }));
            setIsTextValid(prev => ({ ...prev, ...updatedTextValid }));
        } else {
            const fields = itemsTabContent[index].param[value]?.fields || [];
            const fieldItem = Array.isArray(fields) ? fields : [];
            const transformedField = transformData(fieldItem);

            setField(transformedField);

            const initialInputTexts: Record<string, string> = {};
            const initialCheckboxStates: Record<string, boolean> = {};
            const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
            const initialTextValid: Record<string, boolean> = {};

            transformedField.forEach((item) => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value || '';
                    initialTextValid[item.text.name] = (item.text.value?.length || 0) >= 5;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked || false;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.options.some((opt) => opt.value === '1' && opt.selected),
                        no: item.radio.options.some((opt) => opt.value === '0' && opt.selected),
                        isContentVisible: item.radio.options.some((opt) => opt.selected && opt.value === '1'),
                    };
                }
            });

            setInputTexts((prev) => ({ ...prev, ...initialInputTexts }));
            setIsEnabled((prev) => ({ ...prev, ...initialCheckboxStates }));
            setRadioStates((prev) => ({ ...prev, ...initialRadioStates }));
            setIsTextValid((prev) => ({ ...prev, ...initialTextValid }));

            setAllFields((prev) => {
                const newFields = { ...prev, [value]: transformedField };
                storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
                return newFields;
            });
        }
    };

    useEffect(() => {
        loadFields(selectedValue);
    }, [selectedValue]);

    useEffect(() => {
        if (!isMounted) return;

        const updatedTextValid: Record<string, boolean> = {};
        field.forEach((item) => {
            if (item?.text) {
                updatedTextValid[item.text.name] = (inputTexts[item.text.name] || '').length >= 5;
            }
        });
        setIsTextValid((prev) => ({ ...prev, ...updatedTextValid }));
    }, [field, inputTexts, isMounted]);

    const handleSelect = (value: number) => {
        saveCurrentState(selectedValue);
        setSelectedValue(value);
    };

    const sendFieldUpdate = async (name: string, value: any, type: string) => {
        try {
            let payload;
            if (type === 'radio') {
                payload = { answer: name, value };
            } else if (type === 'text') {
                payload = { answer: name, value };
            } else if (type === 'checkbox') {
                payload = { answer: name, checked: value };
            }

            if (payload) {
                await postData(`checklist/${idCheckList}`, { answers: [payload] });
            }
        } catch (error) {
            console.error('Ошибка при обновлении поля:', error);
        }
    };

    const handlePressRadioButton = (name: string, optionIndex: number) => {
        const selectedOption = field.find((item) => item.radio && item.radio.name === name)?.radio.options[optionIndex];
        if (!selectedOption) return;

        setRadioStates((prev) => ({
            ...prev,
            [name]: {
                yes: selectedOption.value === '1',
                no: selectedOption.value === '0',
                isContentVisible: selectedOption.value === '1',
            },
        }));

        const updatedField = field.map((item) => {
            if (item.radio && item.radio.name === name) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        options: item.radio.options.map((opt, idx) => ({
                            ...opt,
                            selected: idx === optionIndex,
                        })),
                    },
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        sendFieldUpdate(name, selectedOption.value, 'radio');
    };

    const handleChangeInputText = (text: string, name: string) => {
        setInputTexts((prev) => ({ ...prev, [name]: text }));
        if (isMounted) {
            setIsTextValid((prev) => ({ ...prev, [name]: text.length >= 5 }));
        }
    };

    const handleBlurTextInput = (name: string) => {
        const textValue = inputTexts[name] || '';
        if (isMounted) {
            setIsTextValid((prev) => ({ ...prev, [name]: textValue.length >= 5 }));
        }

        const updatedField = field.map((item) => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: textValue } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        sendFieldUpdate(name, textValue, 'text');
    };

    const handleChangeCheckBox = (checked: boolean, name: string) => {
        setIsEnabled((prev) => ({ ...prev, [name]: checked }));

        const updatedField = field.map((item) => {
            if (item.checkbox && item.checkbox.name === name) {
                return { ...item, checkbox: { ...item.checkbox, checked } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        sendFieldUpdate(name, checked, 'checkbox');
    };

    const handleImageUploaded = (name: string, newImage: { url: string; thumbUrl: string; name: string }) => {
        const updatedField = field.map((item) => {
            if (item.foto && item.foto.name === name) {
                return {
                    ...item,
                    foto: { ...item.foto, value: [...(item.foto.value || []), newImage] },
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });
    };

    const handleImageRemoved = (name: string, removedImage: { name: string; thumbUrl: string; originalUrl: string }) => {
        const updatedField = field.map((item) => {
            if (item.foto && item.foto.name === name) {
                return {
                    ...item,
                    foto: {
                        ...item.foto,
                        value: item.foto.value.filter((img) => img.thumbUrl !== removedImage.thumbUrl),
                    },
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });
    };

    const transferDataVisible = (data: TransferField[] = []) => {
        if (!Array.isArray(data)) data = [];
        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;

        const renderedComponents = data.map((item, idx) => {
            if (!item) return null;

            const type = Object.keys(item)[0];
            const componentData = item[type];

            if (!componentData) return null;

            if (type === 'radio') {
                const allOptionsFalse = componentData.options.every((option) => !option.selected);
                if (allOptionsFalse) isRadioUnselected = true;
                else isNoSelected = componentData.options.some((option) => option.value === '0' && option.selected);
            }

            if ((type !== 'radio' && isRadioUnselected) || (type !== 'radio' && isNoSelected)) {
                isContentHidden = true;
                return null;
            }

            switch (type) {
                case 'radio':
                    return (
                        <View key={`radio-${idx}`} style={[styles.fieldContainer, { marginBottom: 17 }]}>
                            <Text style={[styles.label, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <View style={styles.buttonContainer}>
                                {componentData.options.map((option, optionIndex) => (
                                    <TextButton
                                        key={optionIndex}
                                        text={option.text}
                                        width={142}
                                        height={29}
                                        textSize={14}
                                        textColor={option.color}
                                        backgroundColor={option.bgcolor}
                                        enabled={option.selected}
                                        onPress={() => handlePressRadioButton(componentData.name, optionIndex)}
                                    />
                                ))}
                            </View>
                        </View>
                    );
                case 'text':
                    return (
                        <View key={`text-${idx}`} style={[styles.fieldContainer, { marginBottom: 17 }]}>
                            <Text style={[styles.label, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    isMounted &&
                                    !isTextValid[componentData.name] &&
                                    inputTexts[componentData.name] !== undefined && {
                                        borderColor: 'red',
                                        borderWidth: 1,
                                    },
                                ]}
                                multiline
                                numberOfLines={4}
                                onChangeText={(text) => handleChangeInputText(text, componentData.name)}
                                textAlignVertical="top"
                                value={inputTexts[componentData.name] || ''}
                                onBlur={() => handleBlurTextInput(componentData.name)}
                            />
                            {isMounted &&
                                !isTextValid[componentData.name] &&
                                inputTexts[componentData.name] !== undefined && (
                                    <Text style={styles.errorText}>Минимум 5 символов</Text>
                                )}
                        </View>
                    );
                case 'foto':
                    return (
                        <ImagePickerWithCamera
                            key={`image-${idx}`}
                            taskId={idTask}
                            initialImages={componentData.value || []}
                            path={`checklist/${idCheckList}/${componentData.name}`}
                            name={componentData.name}
                            onImageUploaded={(newImage) => handleImageUploaded(componentData.name, newImage)}
                            onImageRemoved={(removedImage) => handleImageRemoved(componentData.name, removedImage)}
                        />
                    );
                case 'checkbox':
                    return (
                        <View key={`checkbox-${idx}`} style={styles.checkboxContainer}>
                            <Text style={[styles.label, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <CustomSwitch
                                value={isEnabled[componentData.name] || false}
                                onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)}
                            />
                        </View>
                    );
                default:
                    return null;
            }
        });

        return { renderedComponents, isContentHidden };
    };

    const areAllTextFieldsValid = (isContentHidden: boolean) => {
        if (!isMounted || isContentHidden) return true;

        const textFields = field.filter((item) => item.text);
        if (textFields.length === 0) return true;

        return textFields.every((item) => isTextValid[item.text.name]);
    };

    const handleNext = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) return;

        saveCurrentState(selectedValue);

        if (selectedValue < items.length - 1) {
            setSelectedValue((prev) => prev + 1);
        } else if (!isLastTab) {
            onNextTab?.();
        }
    };

    const handlePrevious = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) return;

        saveCurrentState(selectedValue);

        if (selectedValue > 0) {
            setSelectedValue((prev) => prev - 1);
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
    };

    const { isContentHidden } = transferDataVisible(field);
    const isNavigationEnabled = areAllTextFieldsValid(isContentHidden);

    return (
        <View style={styles.tab1Container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            ) : items.length > 0 ? (
                <>
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Параметр</Text>
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
                            placeholderStyle={styles.dropdownText}
                            selectedTextStyle={styles.dropdownText}
                            itemTextStyle={styles.dropdownItemText}
                        />
                    </View>
                    <KeyboardAwareScrollView>
                        {transferDataVisible(field).renderedComponents}
                    </KeyboardAwareScrollView>
                    <Footer>
                        <View style={styles.footerContainer}>
                            <TextButton
                                text="Назад"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={handlePrevious}
                                enabled={isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                                touchable={isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                            />
                            <TextButton
                                text="Далее"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#017EFA"
                                onPress={handleNext}
                                enabled={isNavigationEnabled && (selectedValue < items.length - 1 || !isLastTab)}
                                touchable={isNavigationEnabled && (selectedValue < items.length - 1 || !isLastTab)}
                            />
                        </View>
                    </Footer>
                </>
            ) : (
                <Text style={styles.errorText}>Данные отсутствуют</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tab1Container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 14,
        backgroundColor: '#FFFFFF',
    },
    fieldContainer: {
        marginBottom: 13,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    textArea: {
        height: 70,
        marginTop: 10,
        borderRadius: 6,
        padding: 10,
        fontSize: 12,
        textAlignVertical: 'top',
        backgroundColor: '#F5F7FB',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    dropdown: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F5F7FB',
    },
    dropdownText: {
        color: '#000000',
        fontSize: 12,
    },
    dropdownItemText: {
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default memo(Tab1ContentEdit);
