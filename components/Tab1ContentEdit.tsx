import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checklist, Zone } from "@/types/Checklist";
import { FormField, TransferField } from "@/types/Field";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fetchDataSaveStorage, getDataFromStorage, postData } from '@/services/api';
import CustomSwitch from "@/components/CustomSwitch";

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
                             idCheckList,
                             itemsTabContent = [],
                             isFirstTab = true,
                             isLastTab = false,
                         }: Tab1ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists') || []);
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [radioStates, setRadioStates] = useState<
        Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>
    >({});
    const [allFields, setAllFields] = useState({});
    const [isTextValid, setIsTextValid] = useState<Record<string, boolean>>({});
    const [isMounted, setIsMounted] = useState(false);

    // Загрузка checklists при монтировании и изменении idCheckList
    useEffect(() => {
        const loadChecklists = async () => {
            try {
                await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
                setChecklists(getDataFromStorage('checklists') || []);
            } catch (error) {
                console.error('Ошибка при загрузке checklists:', error);
            }
        };
        loadChecklists();
    }, [idCheckList]);

    // Функция синхронизации checklists
    const syncChecklists = useCallback(async () => {
        try {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
            setChecklists(getDataFromStorage('checklists') || []);
        } catch (error) {
            console.error('Ошибка при синхронизации checklists:', error);
        }
    }, [idCheckList]);

    const items = useMemo(() =>
            itemsTabContent[index]?.param?.map((data: any, idx: number) => ({
                label: data.name?.toString() || `Item ${idx}`,
                value: idx,
            })) || [],
        [itemsTabContent, index]);

    const transformData = useCallback((data: TransferField[]) =>
            data.map((data) => {
                if (data.type === "radio") {
                    return { radio: { label: data.label, name: data.name, options: data.options.map((opt) => ({ ...opt })) } };
                }
                if (data.type === "text") {
                    return { text: { label: data.label, value: data.value, name: data.name } };
                }
                if (data.type === "foto") {
                    return { foto: { value: data.value || [], name: data.name } };
                }
                if (data.type === "checkbox") {
                    return { checkbox: { label: data.label, checked: data.checked, name: data.name } };
                }
                return null;
            }).filter(Boolean),
        []);

    const loadFields = useCallback((value: number) => {
        if (!itemsTabContent[index]?.param?.[value]) return;

        const fields = itemsTabContent[index].param[value]?.fields || [];
        const fieldItem = Array.isArray(fields) ? fields.map((field: FormField) => field) : [];
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
            if (item?.checkbox) initialCheckboxStates[item.checkbox.name] = item.checkbox.checked || false;
            if (item?.radio) {
                initialRadioStates[item.radio.name] = {
                    yes: item.radio.options.some((opt) => opt.value === "1" && opt.selected),
                    no: item.radio.options.some((opt) => opt.value === "0" && opt.selected),
                    isContentVisible: item.radio.options.some((opt) => opt.selected && opt.value === "1"),
                };
            }
        });

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setIsTextValid(initialTextValid);
        setAllFields((prev) => ({ ...prev, [value]: transformedField }));
    }, [index, itemsTabContent, transformData]);

    useEffect(() => {
        loadFields(selectedValue);
    }, [selectedValue, loadFields]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const initialTextValid: Record<string, boolean> = {};
        field.forEach((item) => {
            if (item?.text) {
                initialTextValid[item.text.name] = (inputTexts[item.text.name] || '').length >= 5;
            }
        });
        setIsTextValid(initialTextValid);
    }, [field, inputTexts, isMounted]);

    const transferDataVisible = useMemo(() => (data: TransferField[] = []) => {
        if (!Array.isArray(data)) data = [];
        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;

        const renderedComponents = data.map((item, index) => {
            if (!item) return null;

            const type = Object.keys(item)[0];
            const componentData = item[type];

            if (!componentData) return null;

            if (type === 'radio') {
                const allOptionsFalse = componentData.options.every((option) => !option.selected);
                if (allOptionsFalse) isRadioUnselected = true;
                else isNoSelected = componentData.options.some((option) => option.value === "0" && option.selected);
            }

            if ((type !== 'radio' && isRadioUnselected) || (type !== 'radio' && isNoSelected)) {
                isContentHidden = true;
                return null;
            }

            switch (type) {
                case 'radio':
                    return (
                        <View key={`radio-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{componentData.label}</Text>
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
                        <View key={`text-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    isMounted && !isTextValid[componentData.name] && inputTexts[componentData.name] !== undefined && {
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
                            {isMounted && !isTextValid[componentData.name] && inputTexts[componentData.name] !== undefined && (
                                <Text style={styles.errorText}>Минимум 5 символов</Text>
                            )}
                        </View>
                    );
                case 'foto':
                    return (
                        <ImagePickerWithCamera
                            key={`image-${index}`}
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
                        <View key={`checkbox-${index}`} style={styles.containerCheckBox}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{componentData.label}</Text>
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
    }, [field, inputTexts, isEnabled, radioStates, isMounted, isTextValid, idTask, idCheckList]);

    const handlePressRadioButton = useCallback(async (name: string, optionIndex: number) => {
        const selectedOption = field.find((item) => item.radio && item.radio.name === name)?.radio.options[optionIndex];
        if (!selectedOption) return;

        setRadioStates((prev) => ({
            ...prev,
            [name]: {
                yes: selectedOption.value === "1",
                no: selectedOption.value === "0",
                isContentVisible: selectedOption.value === "1",
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
        setAllFields((prev) => ({ ...prev, [selectedValue]: updatedField }));

        try {
            await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: selectedOption.value }] });
            await syncChecklists();
        } catch (error) {
            console.error('Ошибка в handlePressRadioButton:', error);
        }
    }, [field, idCheckList, selectedValue, syncChecklists]);

    const handleSelect = useCallback((value: number) => {
        setSelectedValue(value);
    }, []);

    const handleImageUploaded = useCallback((name: string, newImage: { url: string; thumbUrl: string; name: string }) => {
        const updatedField = field.map((item) => {
            if (item.foto && item.foto.name === name) {
                return { ...item, foto: { ...item.foto, value: [...item.foto.value, newImage] } };
            }
            return item;
        });
        setField(updatedField);
        setAllFields((prev) => ({ ...prev, [selectedValue]: updatedField }));
    }, [field, selectedValue]);

    const handleImageRemoved = useCallback((
        name: string,
        removedImage: { name: string; thumbUrl: string; originalUrl: string }
    ) => {
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
        setAllFields((prev) => ({ ...prev, [selectedValue]: updatedField }));
    }, [field, selectedValue]);

    const handleChangeCheckBox = useCallback(async (checked: boolean, name: string) => {
        setIsEnabled((prev) => ({ ...prev, [name]: checked }));
        const updatedField = field.map((item) => {
            if (item.checkbox && item.checkbox.name === name) {
                return { ...item, checkbox: { ...item.checkbox, checked } };
            }
            return item;
        });
        setField(updatedField);
        setAllFields((prev) => ({ ...prev, [selectedValue]: updatedField }));

        try {
            await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, checked }] });
            await syncChecklists();
        } catch (error) {
            console.error('Ошибка в handleChangeCheckBox:', error);
        }
    }, [field, idCheckList, selectedValue, syncChecklists]);

    const handleChangeInputText = useCallback((text: string, name: string) => {
        setInputTexts((prev) => ({ ...prev, [name]: text }));
        if (isMounted) setIsTextValid((prev) => ({ ...prev, [name]: text.length >= 5 }));
    }, [isMounted]);

    const handleBlurTextInput = useCallback(async (name: string) => {
        const textValue = inputTexts[name] || '';
        if (isMounted) setIsTextValid((prev) => ({ ...prev, [name]: textValue.length >= 5 }));

        const updatedField = field.map((item) => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: textValue } };
            }
            return item;
        });
        setField(updatedField);
        setAllFields((prev) => ({ ...prev, [selectedValue]: updatedField }));

        try {
            await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: textValue }] });
            await syncChecklists();
        } catch (error) {
            console.error('Ошибка в handleBlurTextInput:', error);
        }
    }, [inputTexts, isMounted, field, idCheckList, selectedValue, syncChecklists]);

    const areAllTextFieldsValid = useCallback((isContentHidden: boolean) => {
        if (!isMounted || isContentHidden) return true;

        const textFields = field.filter((item) => item.text);
        if (textFields.length === 0) return true;

        return textFields.every((item) => isTextValid[item.text.name]);
    }, [field, isTextValid, isMounted]);

    const handleNext = useCallback(async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) return;

        try {
            if (selectedValue < items.length - 1) {
                await syncChecklists();
                setSelectedValue((prev) => prev + 1);
            } else if (!isLastTab) {
                onNextTab?.();
            }
        } catch (error) {
            console.error('Ошибка в handleNext:', error);
        }
    }, [selectedValue, items.length, isLastTab, onNextTab, field, transferDataVisible, areAllTextFieldsValid, syncChecklists]);

    const handlePrevious = useCallback(async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) return;

        try {
            if (selectedValue > 0) {
                await syncChecklists();
                setSelectedValue((prev) => prev - 1);
            } else if (!isFirstTab) {
                onPreviousTab?.();
            }
        } catch (error) {
            console.error('Ошибка в handlePrevious:', error);
        }
    }, [selectedValue, isFirstTab, onPreviousTab, field, transferDataVisible, areAllTextFieldsValid, syncChecklists]);

    const { isContentHidden } = transferDataVisible(field);
    const isNavigationEnabled = areAllTextFieldsValid(isContentHidden);

    return (
        <View style={styles.tab1Container}>
            {items.length > 0 ? (
                <>
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
                    <KeyboardAwareScrollView>
                        {transferDataVisible(field).renderedComponents}
                    </KeyboardAwareScrollView>
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
                                enabled={isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                                touchable={isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                            />
                            <TextButton
                                text={'Далее'}
                                width={125}
                                height={40}
                                textSize={14}
                                textColor={'#FFFFFF'}
                                backgroundColor={'#017EFA'}
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

export default memo(Tab1ContentEdit);

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
    containerCheckBox: {
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
        marginBottom: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
