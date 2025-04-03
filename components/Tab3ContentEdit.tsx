import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checklist, Zone } from '@/types/Checklist';
import { FormField, TransferField } from '@/types/Field';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ImagePickerWithCamera from '@/components/ImagePickerWithCamera';
import { usePopup } from '@/context/PopupContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fetchDataSaveStorage, getDataFromStorage, postData } from '@/services/api';
import CustomSwitch from '@/components/CustomSwitch';

type Tab3ContentEditType = {
    id: string | string[];
    checklistSort?: Checklist;
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    idCheckList?: string;
    tabId?: string;
    isFirstTab?: boolean;
    isLastTab?: boolean;
};

const Tab3ContentEdit = ({
                             id,
                             checklistSort,
                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             idCheckList,
                             tabId,
                             itemsTabContent = [],
                             isFirstTab = true,
                             isLastTab = false,
                         }: Tab3ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [tmcValues, setTmcValues] = useState<Record<string, { n: string; u: string; v: string }>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});
    const [radioStates, setRadioStates] = useState<Record<string, {
        options: { value: string; color: string; bgcolor: string; selected: boolean }[];
        isContentVisible: boolean;
    }>>({});
    const [allFields, setAllFields] = useState({});
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number>>({});

    const items = itemsTabContent[index].control_points.map((data: any, index: any) => ({
        label: data.name.toString(),
        value: index,
    }));

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
        const { name, id, field } = originalObject;
        return [{
            type: "pest",
            name: field.name,
            value: field.value,
            label: name,
        }];
    };

    useEffect(() => {
        const fields = itemsTabContent[index]?.control_points[0]?.fields;
        const TMC = itemsTabContent[index]?.control_points[0]?.tmc;
        const pests = itemsTabContent[index]?.control_points[0]?.pests;

        const fieldsTMC = Array.isArray(TMC) ? TMC.map((data: any) => transformObjectToArrayTMC(data)).flat() : [];
        const fieldsPests = Array.isArray(pests) ? pests.map((data: any) => transformObjectToArrayPests(data)).flat() : [];
        const fieldItem = Array.isArray(fields) ? fields.map((field: any) => field) : [];
        const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

        const transformedField = transformData(combinedArray);

        const initialFields = {};
        initialFields['0'] = transformedField;
        setAllFields(initialFields);
        setField(initialFields[0]);

        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { options: { value: string; color: string; bgcolor: string; selected: boolean }[]; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTmcValues: Record<string, { n: string; u: string; v: string }> = {};
        const initialPestValues: Record<string, string> = {};

        if (Array.isArray(transformedField)) {
            transformedField.forEach(item => {
                if (item?.text) initialInputTexts[item.text.name] = item.text.value;
                if (item?.checkbox) initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        options: item.radio.options.map(option => ({
                            ...option,
                            selected: option.selected,
                        })),
                        isContentVisible: item.radio.options.some(option => option.selected),
                    };
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) initialDropdownValues[item.select.name] = parseInt(selectedOption);
                }
                if (item?.tmc) {
                    initialTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n.value,
                        u: item.tmc.value.u.value,
                        v: item.tmc.value.v.value,
                    };
                }
                if (item?.pest) initialPestValues[item.pest.name] = item.pest.value;
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setTmcValues(initialTmcValues);
        setPestValues(initialPestValues);

        return () => setAllFields({});
    }, [index, itemsTabContent]);

    useEffect(() => {
        if (tabId && checklistSort && !isInitialized) {
            const tabIndex = checklistSort.zones[index].control_points.findIndex((zone: any) => zone.id === tabId);
            if (tabIndex !== -1) {
                setSelectedValue(tabIndex);
                setIsInitialized(true);
                handleSelect(tabIndex);
            }
        }
    }, [tabId, checklistSort, isInitialized, index]);

    useEffect(() => {
        setAllFields(prev => ({
            ...prev,
            [selectedValue]: field,
        }));
    }, [field]);

    useEffect(() => {
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { options: { value: string; color: string; bgcolor: string; selected: boolean }[]; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTmcValues: Record<string, { n: string; u: string; v: string }> = {};
        const initialPestValues: Record<string, string> = {};

        if (Array.isArray(field)) {
            field.forEach(item => {
                if (item?.text) initialInputTexts[item.text.name] = item.text.value;
                if (item?.checkbox) initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        options: item.radio.options.map(option => ({
                            ...option,
                            selected: option.selected,
                        })),
                        isContentVisible: item.radio.options.some(option => option.selected),
                    };
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) initialDropdownValues[item.select.name] = parseInt(selectedOption);
                }
                if (item?.tmc) {
                    initialTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n.value,
                        u: item.tmc.value.u.value,
                        v: item.tmc.value.v.value,
                    };
                }
                if (item?.pest) initialPestValues[item.pest.name] = item.pest.value;
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setTmcValues(initialTmcValues);
        setPestValues(initialPestValues);
    }, [field, selectedValue, index, itemsTabContent]);

    const transformData = (data: TransferField[]) => data.map(data => {
        if (data.type === 'radio') {
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
                },
            };
        }
        if (data.type === 'text') {
            return { text: { label: data.label, value: data.value, name: data.name } };
        }
        if (data.type === 'foto') {
            return { foto: { value: data.value || [], name: data.name } };
        }
        if (data.type === 'checkbox') {
            return { checkbox: { label: data.label, checked: data.checked, name: data.name } };
        }
        if (data.type === 'select') {
            return { select: { label: data.label, options: data.options, name: data.name } };
        }
        if (data.type === 'tmc') {
            return { tmc: { label: data.label, name: data.name, value: data.value } };
        }
        if (data.type === 'pest') {
            return { pest: { label: data.label, name: data.name, value: data.value } };
        }
    });

    const transferDataVisible = (data = [{}]) => {
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest = false;
        let selectCounter = 0;

        let isNoSelected = false;
        data.forEach(item => {
            if (item.radio) {
                isNoSelected = item.radio.options.some(option => option.value === '0' && option.selected);
            }
        });

        return data.map((item, index) => {
            if (!item || typeof item !== 'object' || Object.keys(item).length === 0) return null;

            const type = Object.keys(item)[0];
            const componentData = item[type];

            if (!componentData) return null;

            if (type !== 'radio' && isNoSelected) return null;

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
                                style={styles.textArea}
                                multiline={true}
                                numberOfLines={4}
                                onChangeText={(text) => handleChangeInputText(text, componentData.name)}
                                textAlignVertical="top"
                                value={inputTexts[componentData.name] || ''}
                                onBlur={() => handleBlurTextInput(componentData.name)}
                            />
                        </View>
                    );
                case 'foto':
                    const arrayPhoto = componentData.value || [];
                    return (
                        <ImagePickerWithCamera
                            key={`image-${index}`}
                            taskId={idTask}
                            initialImages={arrayPhoto}
                            path={`checklist/${idCheckList}/${componentData.name}`}
                            name={componentData.name}
                        />
                    );
                case 'checkbox':
                    return (
                        <View key={`checkbox-${index}`} style={styles.containerCheckBox}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <CustomSwitch
                                value={isEnabled[componentData.name]}
                                onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)}
                            />
                        </View>
                    );
                case 'select':
                    const selectedValue = selectedDropdownValues[componentData.name] || 0;
                    const options = Object.entries(componentData.options).map(([key, value]) => ({
                        label: value.value,
                        value: parseInt(key),
                        color: value.color,
                    }));
                    const selectedOption = options.find(option => option.value === selectedValue);
                    const selectedColor = selectedOption ? selectedOption.color : '#000000';
                    selectCounter++;

                    return (
                        <View key={`select-${index}`} style={[styles.selectContainer]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <Dropdown
                                style={[styles.dropdownTMC, { width: '40%', zIndex: 1000 - selectCounter }]}
                                data={options}
                                labelField="label"
                                valueField="value"
                                value={selectedValue}
                                onChange={(item) => handleSelectDropdown(item.value, componentData.name)}
                                placeholder="Выберите элемент"
                                placeholderStyle={{ color: '#000000', fontSize: 14 }}
                                selectedTextStyle={{ color: selectedColor, fontSize: 14 }}
                                containerStyle={{ backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }}
                                itemTextStyle={{ fontSize: 14 }}
                            />
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
                                    <TextInput
                                        style={styles.tmcTextInput}
                                        onChangeText={(text) => handleChangeTmc(text, componentData.name, 'n')}
                                        value={tmcValues[componentData.name]?.n || ''}
                                        onBlur={() => handleBlurTmc(componentData.name, 'n')}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.tmcTextInput}
                                        onChangeText={(text) => handleChangeTmc(text, componentData.name, 'u')}
                                        value={tmcValues[componentData.name]?.u || ''}
                                        onBlur={() => handleBlurTmc(componentData.name, 'u')}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={styles.tmcTextInput}
                                        onChangeText={(text) => handleChangeTmc(text, componentData.name, 'v')}
                                        value={tmcValues[componentData.name]?.v || ''}
                                        onBlur={() => handleBlurTmc(componentData.name, 'v')}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </>
                    );
                case 'pest':
                    return (
                        <>
                            {!isHeaderVisiblePest && (
                                <>
                                    <Text style={styles.tmcTitle}>{'Поймано вредителей'}</Text>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>{'Наименование'}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.tmcHeaderText}>{'Количество'}</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            {!isHeaderVisiblePest && (isHeaderVisiblePest = true)}
                            <View key={`tmc-${index}`} style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}>
                                <Text style={[styles.tmcText, { width: '50%' }]}>{`${componentData.label}`}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 20 }}>
                                    <TextInput
                                        style={styles.tmcTextInput}
                                        onChangeText={(text) => handleChangePest(text, componentData.name)}
                                        value={pestValues[componentData.name] || ''}
                                        onBlur={() => handleBlurPest(componentData.name)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </>
                    );
                default:
                    return null;
            }
        });
    };

    const handlePressRadioButton = async (name: string, optionIndex: number) => {
        const selectedOption = field.find(item => item.radio && item.radio.name === name)?.radio.options[optionIndex];
        if (!selectedOption) {
            console.error("Выбранная опция не найдена");
            return;
        }

        setRadioStates(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                options: prev[name].options.map((option, index) => ({
                    ...option,
                    selected: index === optionIndex,
                })),
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
            answers: [{ answer: name, value: selectedOption.value }],
        });
    };

    const handleSelect = (value: number) => {
        setSelectedValue(value);
        const fields = itemsTabContent[index]?.control_points[value]?.fields;
        const TMC = itemsTabContent[index]?.control_points[value]?.tmc;
        const pests = itemsTabContent[index]?.control_points[value]?.pests;

        const fieldsTMC = Array.isArray(TMC) ? TMC.map((data: any) => transformObjectToArrayTMC(data)).flat() : [];
        const fieldsPests = Array.isArray(pests) ? pests.map((data: any) => transformObjectToArrayPests(data)).flat() : [];
        const fieldItem = Array.isArray(fields) ? fields.map((field: any) => field) : [];
        const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

        const transformedField = transformData(combinedArray);

        if (allFields[value] && allFields[value].length > 0) {
            setField(allFields[value]);
        } else {
            setField(transformedField);
        }
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
            answers: [{ answer: name, value: value }],
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
            answers: [{ answer: hasCheckBox.checkbox.name, checked }],
        });
    };

    const handleChangeInputText = (text: string, name: string) => {
        setInputTexts(prev => ({ ...prev, [name]: text }));

        const updatedField = field.map(item => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: text } };
            }
            return item;
        });
        setField(updatedField);
    };

    const handleChangeTmc = (text: string, name: string, fieldType: 'n' | 'u' | 'v') => {
        setTmcValues(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [fieldType]: text,
            },
        }));

        const updatedField = field.map(item => {
            if (item.tmc && item.tmc.name === name) {
                return {
                    ...item,
                    tmc: {
                        ...item.tmc,
                        value: {
                            ...item.tmc.value,
                            [fieldType]: { ...item.tmc.value[fieldType], value: text },
                        },
                    },
                };
            }
            return item;
        });

        setField(updatedField);
    };

    const handleChangePest = (text: string, name: string) => {
        setPestValues(prev => ({ ...prev, [name]: text }));

        const updatedField = field.map(item => {
            if (item.pest && item.pest.name === name) {
                return { ...item, pest: { ...item.pest, value: text } };
            }
            return item;
        });

        setField(updatedField);
    };

    const handleNext = async () => {
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

    const handlePrevious = async () => {
        if (selectedValue > 0) {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
            setChecklists(getDataFromStorage('checklists'));
            const prevIndex = selectedValue - 1;
            setSelectedValue(prevIndex);
            handleSelect(prevIndex);
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
    };

    const handleBlurTextInput = async (name: string) => {
        const hasText = field.find(item => item.text && item.text.name === name);
        await postData(`checklist/${idCheckList}`, {
            answers: [{ answer: hasText.text.name, value: hasText.text.value }],
        });
    };

    const handleBlurTmc = async (name: string, fieldType: 'n' | 'u' | 'v') => {
        const tmcField = field.find(item => item.tmc && item.tmc.name === name);
        if (tmcField) {
            const req = JSON.stringify({
                p: tmcField.tmc.value['p'].value,
                v: tmcField.tmc.value['v'].value,
                u: tmcField.tmc.value['u'].value,
                n: tmcField.tmc.value['n'].value,
            });

            await postData(`checklist/${idCheckList}`, {
                answers: [{ answer: name, value: req }],
            });
        }
    };

    const handleBlurPest = async (name: string) => {
        const pestField = field.find(item => item.pest && item.pest.name === name);
        if (pestField) {
            const value = pestField.pest.value;
            await postData(`checklist/${idCheckList}`, {
                answers: [{ answer: name, value: value }],
            });
        }
    };

    return (
        <>
            <View style={styles.tab1Container}>
                {items.length > 0 ? (
                    <>
                        <View style={styles.text}>
                            <Text style={styles.title}>{'Параметр'}</Text>
                        </View>
                        {items.length > 0 && (
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
                        )}
                        <KeyboardAwareScrollView>
                            {transferDataVisible(field)}
                        </KeyboardAwareScrollView>
                    </>
                ) : (
                    <Text style={styles.errorText}>Данные отсутствуют</Text>
                )}
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
    selectContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
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
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    dropdown: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F5F7FB',
        marginBottom: 5,
    },
    dropdownTMC: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
    },
});

export default memo(Tab3ContentEdit);
