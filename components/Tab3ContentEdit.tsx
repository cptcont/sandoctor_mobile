import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checklist, Zone } from '@/types/Checklist';
import { TransferField } from '@/types/Field';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ImagePickerWithCamera from '@/components/ImagePickerWithCamera';
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
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists') || []);    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [tmcValues, setTmcValues] = useState<Record<string, { n: string; u: string; v: string }>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});
    const [radioStates, setRadioStates] = useState<
        Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>
    >({});
    const [allFields, setAllFields] = useState({});
    const [isFieldValid, setIsFieldValid] = useState<Record<string, boolean>>({});
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number | null>>({});
    const [isMounted, setIsMounted] = useState(false);

    const items = useMemo(() =>
            itemsTabContent[index]?.control_points?.map((data: any, idx: number) => ({
                label: data.name.toString(),
                value: idx,
            })) || [],
        [itemsTabContent, index]);

    const transformObjectToArrayTMC = useCallback((originalObject: any) => {
        const { name, fields } = originalObject;
        const fieldName = fields.p.name.replace(/\[[^\]]+\]$/, '');
        return [{
            name: fieldName,
            label: name,
            type: 'tmc',
            value: fields,
        }];
    }, []);

    const transformObjectToArrayPests = useCallback((originalObject: any) => {
        const { name, id, field } = originalObject;
        return [{
            type: 'pest',
            name: field.name,
            value: field.value,
            label: name,
        }];
    }, []);

    const transformData = useCallback((data: TransferField[]) =>
        data.map((data) => {
            if (data.type === 'radio') {
                return { radio: { label: data.label, name: data.name, options: data.options.map((opt) => ({ ...opt })) } };
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
        }), []);

    const loadFields = useCallback((value: number) => {
        console.log('loadFields called with value:', value);
        if (!itemsTabContent[index]?.control_points?.[value]) return;

        const fields = itemsTabContent[index].control_points[value]?.fields || [];
        const TMC = itemsTabContent[index].control_points[value]?.tmc || [];
        const pests = itemsTabContent[index].control_points[value]?.pests || [];

        const fieldsTMC = Array.isArray(TMC) ? TMC.map(transformObjectToArrayTMC).flat() : [];
        const fieldsPests = Array.isArray(pests) ? pests.map(transformObjectToArrayPests).flat() : [];
        const fieldItem = Array.isArray(fields) ? fields : [];
        const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

        const transformedField = transformData(combinedArray);
        setField(transformedField);

        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number | null> = {};
        const initialTmcValues: Record<string, { n: string; u: string; v: string }> = {};
        const initialPestValues: Record<string, string> = {};

        transformedField.forEach((item) => {
            if (item?.text) initialInputTexts[item.text.name] = item.text.value || '';
            if (item?.checkbox) initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
            if (item?.radio) {
                initialRadioStates[item.radio.name] = {
                    yes: item.radio.options.some((opt) => opt.value === '1' && opt.selected),
                    no: item.radio.options.some((opt) => opt.value === '0' && opt.selected),
                    isContentVisible: item.radio.options.some((opt) => opt.selected && opt.value === '1'),
                };
            }
            if (item?.select) {
                const selected = Object.keys(item.select.options).find((key) => item.select.options[key].selected);
                initialDropdownValues[item.select.name] = selected ? parseInt(selected) : null;
            }
            if (item?.tmc) {
                initialTmcValues[item.tmc.name] = {
                    n: item.tmc.value.n.value || '',
                    u: item.tmc.value.u.value || '',
                    v: item.tmc.value.v.value || '',
                };
            }
            if (item?.pest) initialPestValues[item.pest.name] = item.pest.value || '';
        });

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setTmcValues(initialTmcValues);
        setPestValues(initialPestValues);

        setAllFields((prev) => ({ ...prev, [value]: transformedField }));
    }, [index, itemsTabContent, transformObjectToArrayTMC, transformObjectToArrayPests, transformData]);

    useEffect(() => {
        loadFields(selectedValue);
    }, [selectedValue, loadFields]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const initialFieldValid: Record<string, boolean> = {};
        field.forEach((item) => {
            if (item?.text) initialFieldValid[item.text.name] = !!item.text.value;
            if (item?.select) {
                const selected = Object.keys(item.select.options).find((key) => item.select.options[key].selected);
                initialFieldValid[item.select.name] = selected !== undefined;
            }
            if (item?.tmc) {
                initialFieldValid[`${item.tmc.name}_n`] = !!item.tmc.value.n.value;
                initialFieldValid[`${item.tmc.name}_u`] = !!item.tmc.value.u.value;
                initialFieldValid[`${item.tmc.name}_v`] = !!item.tmc.value.v.value;
            }
            if (item?.pest) initialFieldValid[item.pest.name] = !!item.pest.value;
        });
        setIsFieldValid(initialFieldValid);
    }, [field, isMounted]);

    useEffect(() => {
        if (tabId && items.length > 0 && !isInitialized) {
            const controlPointIndex = itemsTabContent[index]?.control_points.findIndex(
                (cp: any) => cp.id === tabId
            );
            if (controlPointIndex !== -1) {
                setSelectedValue(controlPointIndex);
                setIsInitialized(true);
            }
        }
    }, [tabId, index, itemsTabContent, isInitialized, items]);

    const transferDataVisible = useMemo(() => (data = [{}]) => {
        if (!data || !Array.isArray(data) || data.length === 0) data = [{}];

        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest = false;
        let selectCounter = 0;

        const renderedComponents = data.map((item, index) => {
            if (!item || Object.keys(item).length === 0) return null;

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
                                    isMounted && !isFieldValid[componentData.name] && { borderColor: 'red', borderWidth: 1 },
                                ]}
                                multiline
                                numberOfLines={4}
                                onChangeText={(text) => handleChangeInputText(text, componentData.name)}
                                textAlignVertical="top"
                                value={inputTexts[componentData.name] || ''}
                                onBlur={() => handleBlurTextInput(componentData.name)}
                            />
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
                                value={isEnabled[componentData.name]}
                                onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)}
                            />
                        </View>
                    );
                case 'select':
                    const selectedValue = selectedDropdownValues[componentData.name] ?? null;
                    const options = Object.entries(componentData.options).map(([key, value]: [string, any]) => ({
                        label: value.value,
                        value: parseInt(key),
                        color: value.color,
                    }));
                    const selectedOption = options.find((option) => option.value === selectedValue);
                    const selectedColor = selectedOption ? selectedOption.color : '#000000';
                    selectCounter++;

                    return (
                        <View key={`select-${index}`} style={[styles.selectContainer]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <Dropdown
                                style={[
                                    styles.dropdownTMC,
                                    { width: '40%', zIndex: 1000 - selectCounter },
                                    isMounted && selectedValue === null && { borderColor: 'red', borderWidth: 1 },
                                ]}
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
                            <View
                                key={`tmc-${index}`}
                                style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}
                            >
                                <Text style={[styles.tmcText, { width: '50%' }]}>{componentData.label}</Text>
                                <View style={{ width: '44%', flexDirection: 'row', justifyContent: 'space-between', marginRight: 12 }}>
                                    <TextInput
                                        style={[
                                            styles.tmcTextInput,
                                            isMounted && !isFieldValid[`${componentData.name}_n`] && { borderColor: 'red', borderWidth: 1 },
                                        ]}
                                        onChangeText={(text) => handleChangeTmc(text, componentData.name, 'n')}
                                        value={tmcValues[componentData.name]?.n || ''}
                                        onBlur={() => handleBlurTmc(componentData.name, 'n')}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={[
                                            styles.tmcTextInput,
                                            isMounted && !isFieldValid[`${componentData.name}_u`] && { borderColor: 'red', borderWidth: 1 },
                                        ]}
                                        onChangeText={(text) => handleChangeTmc(text, componentData.name, 'u')}
                                        value={tmcValues[componentData.name]?.u || ''}
                                        onBlur={() => handleBlurTmc(componentData.name, 'u')}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={[
                                            styles.tmcTextInput,
                                            isMounted && !isFieldValid[`${componentData.name}_v`] && { borderColor: 'red', borderWidth: 1 },
                                        ]}
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
                            <View
                                key={`pest-${index}`}
                                style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}
                            >
                                <Text style={[styles.tmcText, { width: '50%' }]}>{componentData.label}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 20 }}>
                                    <TextInput
                                        style={[
                                            styles.tmcTextInput,
                                            isMounted && !isFieldValid[componentData.name] && { borderColor: 'red', borderWidth: 1 },
                                        ]}
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

        return { renderedComponents, isContentHidden };
    }, [field, inputTexts, isEnabled, radioStates, tmcValues, pestValues, selectedDropdownValues, isMounted, isFieldValid, idTask, idCheckList]);

    const handlePressRadioButton = useCallback(async (name: string, optionIndex: number) => {
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
        await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: selectedOption.value }] });
    }, [field, idCheckList]);

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

    const handleSelectDropdown = useCallback(async (value: number, name: string) => {
        setSelectedDropdownValues((prev) => ({ ...prev, [name]: value }));
        setIsFieldValid((prev) => ({ ...prev, [name]: true }));

        const updatedField = field.map((item) => {
            if (item.select && item.select.name === name) {
                const updatedOptions = Object.keys(item.select.options).reduce((acc, key) => {
                    acc[key] = { ...item.select.options[key], selected: parseInt(key) === value };
                    return acc;
                }, {});
                return { ...item, select: { ...item.select, options: updatedOptions } };
            }
            return item;
        });

        setField(updatedField);
        await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value }] });
    }, [field, idCheckList]);

    const handleChangeCheckBox = useCallback(async (checked: boolean, name: string) => {
        setIsEnabled((prev) => ({ ...prev, [name]: checked }));
        const updatedField = field.map((item) => {
            if (item.checkbox && item.checkbox.name === name) {
                return { ...item, checkbox: { ...item.checkbox, checked } };
            }
            return item;
        });
        setField(updatedField);
        await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, checked }] });
    }, [field, idCheckList]);

    const handleChangeInputText = useCallback((text: string, name: string) => {
        setInputTexts((prev) => ({ ...prev, [name]: text }));
        if (isMounted) setIsFieldValid((prev) => ({ ...prev, [name]: !!text }));
    }, [isMounted]);

    const handleChangeTmc = useCallback((text: string, name: string, fieldType: 'n' | 'u' | 'v') => {
        setTmcValues((prev) => ({ ...prev, [name]: { ...prev[name], [fieldType]: text } }));
        if (isMounted) setIsFieldValid((prev) => ({ ...prev, [`${name}_${fieldType}`]: !!text }));
    }, [isMounted]);

    const handleChangePest = useCallback((text: string, name: string) => {
        setPestValues((prev) => ({ ...prev, [name]: text }));
        if (isMounted) setIsFieldValid((prev) => ({ ...prev, [name]: !!text }));
    }, [isMounted]);

    const areAllFieldsValid = useCallback((isContentHidden: boolean) => {
        if (!isMounted || isContentHidden) return true;

        const requiredFields = field.filter((item) => item.text || item.select || item.tmc || item.pest);
        return requiredFields.every((item) => {
            if (item.text) return isFieldValid[item.text.name];
            if (item.select) return isFieldValid[item.select.name];
            if (item.tmc) {
                return (
                    isFieldValid[`${item.tmc.name}_n`] &&
                    isFieldValid[`${item.tmc.name}_u`] &&
                    isFieldValid[`${item.tmc.name}_v`]
                );
            }
            if (item.pest) return isFieldValid[item.pest.name];
            return true;
        });
    }, [field, isFieldValid, isMounted]);

    const handleNext = useCallback(async () => {
        console.log('handleNext called with selectedValue:', selectedValue);
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) {
            console.log('Validation failed in handleNext');
            return;
        }

        try {
            if (selectedValue < items.length - 1) {
                const nextIndex = selectedValue + 1;
                setSelectedValue(nextIndex);
            } else if (!isLastTab && onNextTab) {
                console.log('Fetching data before next tab...');
                await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
                const updatedChecklists = getDataFromStorage('checklists') || [];
                setChecklists(updatedChecklists);
                console.log('Data fetched, moving to next tab:', updatedChecklists);
                onNextTab();
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
        }
    }, [selectedValue, items.length, isLastTab, onNextTab, idCheckList, field, transferDataVisible, areAllFieldsValid]);

    const handlePrevious = useCallback(async () => {
        console.log('handlePrevious called with selectedValue:', selectedValue);
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) {
            console.log('Validation failed in handlePrevious');
            return;
        }

        try {
            if (selectedValue > 0) {
                const prevIndex = selectedValue - 1;
                setSelectedValue(prevIndex);
            } else if (!isFirstTab && onPreviousTab) {
                console.log('Fetching data before previous tab...');
                await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists');
                const updatedChecklists = getDataFromStorage('checklists') || [];
                setChecklists(updatedChecklists);
                console.log('Data fetched, moving to previous tab:', updatedChecklists);
                onPreviousTab();
            }
        } catch (error) {
            console.error('Error in handlePrevious:', error);
        }
    }, [selectedValue, isFirstTab, onPreviousTab, idCheckList, field, transferDataVisible, areAllFieldsValid]);

    const handleBlurTextInput = useCallback(async (name: string) => {
        const textValue = inputTexts[name] || '';
        if (isMounted) setIsFieldValid((prev) => ({ ...prev, [name]: !!textValue }));
        await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: textValue }] });

        const updatedField = field.map((item) => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: textValue } };
            }
            return item;
        });
        setField(updatedField);
    }, [inputTexts, isMounted, idCheckList, field]);

    const handleBlurTmc = useCallback(async (name: string, fieldType: 'n' | 'u' | 'v') => {
        const tmcField = field.find((item) => item.tmc && item.tmc.name === name);
        if (tmcField) {
            const updatedField = field.map((item) => {
                if (item.tmc && item.tmc.name === name) {
                    return {
                        ...item,
                        tmc: {
                            ...item.tmc,
                            value: { ...item.tmc.value, [fieldType]: { ...item.tmc.value[fieldType], value: tmcValues[name][fieldType] } },
                        },
                    };
                }
                return item;
            });
            setField(updatedField);

            const req = JSON.stringify({
                p: tmcField.tmc.value['p'].value,
                v: tmcField.tmc.value['v'].value,
                u: tmcField.tmc.value['u'].value,
                n: tmcField.tmc.value['n'].value,
            });
            await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: req }] });
        }
    }, [field, tmcValues, idCheckList]);

    const handleBlurPest = useCallback(async (name: string) => {
        const pestField = field.find((item) => item.pest && item.pest.name === name);
        if (pestField) {
            const updatedField = field.map((item) => {
                if (item.pest && item.pest.name === name) {
                    return { ...item, pest: { ...item.pest, value: pestValues[name] } };
                }
                return item;
            });
            setField(updatedField);
            await postData(`checklist/${idCheckList}`, { answers: [{ answer: name, value: pestValues[name] }] });
        }
    }, [field, pestValues, idCheckList]);

    const { isContentHidden } = transferDataVisible(field);
    const isNavigationEnabled = areAllFieldsValid(isContentHidden);

    return (
        <View style={styles.tab1Container}>
            {items.length > 0 ? (
                <>
                    <View style={styles.text}>
                        <Text style={styles.title}>{'Параметр'}</Text>
                    </View>
                    {items.length > 0 && (
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
                    )}
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
        fontSize: 12,
        marginTop: 5,
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
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default memo(Tab3ContentEdit);
