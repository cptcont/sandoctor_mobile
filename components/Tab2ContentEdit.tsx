import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checklist, Zone } from "@/types/Checklist";
import { FormField, TransferField } from "@/types/Field";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import { usePopup } from "@/context/PopupContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fetchDataSaveStorage, getDataFromStorage, postData } from '@/services/api';
import CustomSwitch from "@/components/CustomSwitch";

type Tab2ContentEditType = {
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

const Tab2ContentEdit = ({
                             id,
                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             itemsTabContent,
                             idCheckList,
                             isFirstTab = true,
                             isLastTab = false,
                         }: Tab2ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const { showPopup } = usePopup();
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [radioStates, setRadioStates] = useState<Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>>({});
    const [allFields, setAllFields] = useState({});
    const [isTextValid, setIsTextValid] = useState<Record<string, boolean>>({});
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number>>({});

    const items = itemsTabContent[index].param.map((data: any, index: any) => ({
        label: data.name.toString(),
        value: index
    }));

    useEffect(() => {
        const fields = itemsTabContent[index]?.param[0]?.fields;
        const fieldItem = Array.isArray(fields) ? fields.map((field: any) => field) : [];
        const transformedField = transformData(fieldItem);

        const initialFields = {};
        if (Array.isArray(itemsTabContent[index]?.param)) {
            itemsTabContent[index].param.forEach((param: any, idx: number) => {
                if (Array.isArray(param.fields)) {
                    const fieldItem = param.fields.map((field: any) => field);
                    initialFields[idx] = transformData(fieldItem);
                }
            });
        }

        setAllFields(initialFields);
        setField(initialFields[0]);

        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTextValid: Record<string, boolean> = {};

        if (Array.isArray(transformedField)) {
            transformedField.forEach(item => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                    initialTextValid[item.text.name] = item.text.value.length >= 5;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.options.some(opt => opt.value === "1" && opt.selected),
                        no: item.radio.options.some(opt => opt.value === "0" && opt.selected),
                        isContentVisible: item.radio.options.some(opt => opt.selected && opt.value === "1"),
                    };
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) {
                        initialDropdownValues[item.select.name] = parseInt(selectedOption);
                    }
                }
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setIsTextValid(initialTextValid);
    }, [index, itemsTabContent]);

    useEffect(() => {
        return () => {
            setAllFields({});
        };
    }, []);

    useEffect(() => {
        setAllFields(prev => ({
            ...prev,
            [selectedValue]: field
        }));
    }, [field]);

    useEffect(() => {
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTextValid: Record<string, boolean> = {};

        if (Array.isArray(field)) {
            field.forEach(item => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                    initialTextValid[item.text.name] = item.text.value.length >= 5;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.options.some(opt => opt.value === "1" && opt.selected),
                        no: item.radio.options.some(opt => opt.value === "0" && opt.selected),
                        isContentVisible: item.radio.options.some(opt => opt.selected && opt.value === "1"),
                    };
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) {
                        initialDropdownValues[item.select.name] = parseInt(selectedOption);
                    }
                }
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setIsTextValid(initialTextValid);
    }, [field, selectedValue, index, itemsTabContent]);

    const handleSelect = (value: number | null) => {
        if (value !== null) {
            setSelectedValue(value);
            const fieldItem = itemsTabContent[index].param[value].fields.map((field: FormField) => field);
            const transformedField = transformData(fieldItem);

            if (allFields[value]) {
                setField(allFields[value]);
            } else {
                setAllFields(prev => ({
                    ...prev,
                    [selectedValue]: transformedField,
                }));
                setField(transformedField);
            }
        }
    };

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
            return {
                text: {
                    label: data.label,
                    value: data.value,
                    name: data.name,
                }
            };
        }
        if (data.type === "foto") {
            return {
                foto: {
                    value: data.value || [],
                    name: data.name,
                }
            };
        }
        if (data.type === "checkbox") {
            return {
                checkbox: {
                    label: data.label,
                    checked: data.checked,
                    name: data.name,
                }
            };
        }
        if (data.type === "select") {
            return {
                select: {
                    label: data.label,
                    options: data.options,
                    name: data.name,
                }
            };
        }
    });

    const handleImageUploaded = (name: string, newImage: { url: string; thumbUrl: string; name: string }) => {
        const updatedField = field.map(item => {
            if (item.foto && item.foto.name === name) {
                return {
                    ...item,
                    foto: {
                        ...item.foto,
                        value: [...item.foto.value, newImage]
                    }
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields(prev => ({
            ...prev,
            [selectedValue]: updatedField
        }));
    };

    const handleImageRemoved = (name: string, removedImage: { name: string; thumbUrl: string; originalUrl: string }) => {
        const updatedField = field.map(item => {
            if (item.foto && item.foto.name === name) {
                return {
                    ...item,
                    foto: {
                        ...item.foto,
                        value: item.foto.value.filter(img => img.thumbUrl !== removedImage.thumbUrl)
                    }
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields(prev => ({
            ...prev,
            [selectedValue]: updatedField
        }));
    };

    const transferDataVisible = (data = [{}]) => {
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }

        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;

        const renderedComponents = data.map((item, index) => {
            if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
                return null;
            }

            const type = Object.keys(item)[0];
            const componentData = item[type];

            if (!componentData) {
                return null;
            }

            if (type === 'radio') {
                const allOptionsFalse = componentData.options.every(option => !option.selected);
                if (allOptionsFalse) {
                    isRadioUnselected = true;
                } else {
                    isNoSelected = componentData.options.some(option => option.value === "0" && option.selected);
                    isRadioUnselected = false;
                }
            }

            if ((type !== 'radio' && isRadioUnselected) || (type !== 'radio' && isNoSelected)) {
                isContentHidden = true;
                return null;
            }

            switch (type) {
                case 'radio':
                    return (
                        <View key={`radio-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
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
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    !isTextValid[componentData.name] && inputTexts[componentData.name] !== undefined && { borderColor: 'red', borderWidth: 1 }
                                ]}
                                multiline={true}
                                numberOfLines={4}
                                onChangeText={(text) => handleChangeInputText(text, componentData.name)}
                                textAlignVertical="top"
                                value={inputTexts[componentData.name] || ''}
                                onBlur={() => handleBlurTextInput(componentData.name)}
                            />
                            {!isTextValid[componentData.name] && inputTexts[componentData.name] !== undefined && (
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
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <CustomSwitch value={isEnabled[componentData.name]} onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)} />
                        </View>
                    );
                case 'select':
                    const selectedValue = selectedDropdownValues[componentData.name] || 0;
                    const options = Object.entries(componentData.options).map(([key, value]) => ({
                        label: value.value,
                        value: parseInt(key),
                    }));

                    return (
                        <View key={`select-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37', marginBottom: 10 }]}>{`${componentData.label}`}</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={options}
                                labelField="label"
                                valueField="value"
                                value={selectedValue}
                                onChange={(item) => handleSelectDropdown(item.value, componentData.name)}
                                placeholder="Выберите значение"
                                placeholderStyle={{ color: '#000000', fontSize: 12 }}
                                selectedTextStyle={{ color: '#000000', fontSize: 12 }}
                                itemTextStyle={{ fontSize: 14 }}
                            />
                        </View>
                    );
                default:
                    return null;
            }
        });

        return { renderedComponents, isContentHidden };
    };

    const handlePressRadioButton = async (name: string, optionIndex: number) => {
        const selectedOption = field.find(item => item.radio && item.radio.name === name)?.radio.options[optionIndex];

        if (!selectedOption) {
            console.error("Selected option not found");
            return;
        }

        setRadioStates(prev => ({
            ...prev,
            [name]: {
                yes: selectedOption.value === "1",
                no: selectedOption.value === "0",
                isContentVisible: selectedOption.value === "1",
            },
        }));

        const updatedField = field.map(item => {
            if (item.radio && item.radio.name === name) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        options: item.radio.options.map((option, index) => ({
                            ...option,
                            selected: index === optionIndex,
                        })),
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: selectedOption.value },
            ],
        });
    };

    const handleSelectDropdown = async (value: number, name: string) => {
        setSelectedDropdownValues(prev => ({
            ...prev,
            [name]: value,
        }));

        const updatedField = field.map(item => {
            if (item.select && item.select.name === name) {
                const updatedOptions = Object.keys(item.select.options).reduce((acc, key) => {
                    acc[key] = {
                        ...item.select.options[key],
                        selected: parseInt(key) === value,
                    };
                    return acc;
                }, {});

                return {
                    ...item,
                    select: {
                        ...item.select,
                        options: updatedOptions,
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: value },
            ],
        });
    };

    const handleChangeCheckBox = async (checked: boolean, name: string) => {
        setIsEnabled(prev => ({ ...prev, [name]: checked }));

        const updatedField = field.map(item => {
            if (item.checkbox && item.checkbox.name === name) {
                return { ...item, checkbox: { ...item.checkbox, checked } };
            }
            return item;
        });
        setField(updatedField);

        const hasCheckBox = field.find(item => item.checkbox && item.checkbox.name === name);
        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasCheckBox.checkbox.name, checked },
            ],
        });
    };

    const handleChangeInputText = (text: string, name: string) => {
        setInputTexts(prev => ({ ...prev, [name]: text }));
        setIsTextValid(prev => ({ ...prev, [name]: text.length >= 5 }));

        const updatedField = field.map(item => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: text } };
            }
            return item;
        });
        setField(updatedField);
    };

    const handleBlurTextInput = async (name: string) => {
        const textValue = inputTexts[name] || '';
        setIsTextValid(prev => ({ ...prev, [name]: textValue.length >= 5 }));

        const hasText = field.find(item => item.text && item.text.name === name);
        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasText.text.name, value: hasText.text.value },
            ],
        });
    };

    const areAllTextFieldsValid = (isContentHidden: boolean) => {
        const textFields = field.filter(item => item.text);
        if (isContentHidden || textFields.length === 0) {
            return true;
        }
        return textFields.every(item => isTextValid[item.text.name] === true);
    };

    const handleNext = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) {
            showPopup('Все текстовые поля должны содержать минимум 5 символов');
            return;
        }

        if (selectedValue < items.length - 1) {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
            setChecklists(getDataFromStorage('checklists'));
            const nextIndex = selectedValue + 1;
            setSelectedValue(nextIndex);
            handleSelect(nextIndex);
        } else if (!isLastTab) {
            onNextTab?.();
        }
    };

    const handlePrevious = () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllTextFieldsValid(isContentHidden)) {
            showPopup('Все текстовые поля должны содержать минимум 5 символов');
            return;
        }

        if (selectedValue > 0) {
            const prevIndex = selectedValue - 1;
            setSelectedValue(prevIndex);
            handleSelect(prevIndex);
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
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
                <KeyboardAwareScrollView>
                    {transferDataVisible(field).renderedComponents}
                </KeyboardAwareScrollView>
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
};

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
});

export default memo(Tab2ContentEdit);
