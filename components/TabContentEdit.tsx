import React, { useEffect, useState, memo, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '@rneui/themed';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ImagePickerWithCamera from '@/components/ImagePickerWithCamera';
import CustomSwitch from '@/components/CustomSwitch';
import { Checklist, Zone } from '@/types/Checklist';
import { FormField, TransferField } from '@/types/Field';
import { postData } from '@/services/api';
import { useModal } from '@/context/ModalContext';
import { ShowSelectTMC } from '@/components/showSelectTMC';
import { router } from 'expo-router';
import { DotSolid } from "@/components/icons/Icons";
import { TextInput as NativeTextInput } from 'react-native';

type TabContentEditType = {
    id: string | string[];
    checklistSort?: Checklist;
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    onReload?: () => void;
    idCheckList?: string;
    tabId?: string;
    zoneId?: string;
    isFirstTab?: boolean;
    isLastTab?: boolean;
};

const TabContentEdit = ({
                            id,
                            checklistSort,
                            index,
                            idTask = '0',
                            onNextTab,
                            onPreviousTab,
                            onReload,
                            idCheckList = '0',
                            tabId,
                            zoneId = '0',
                            itemsTabContent = [],
                            isFirstTab = true,
                            isLastTab = false,
                        }: TabContentEditType) => {
    const [selectedValue, setSelectedValue] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [tmcValues, setTmcValues] = useState<Record<string, { p: string; n: string; u: string; v: string }>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});
    const [radioStates, setRadioStates] = useState<
        Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>
    >({});
    const [allFields, setAllFields] = useState<Record<string, TransferField[]>>({});
    const [isFieldValid, setIsFieldValid] = useState<Record<string, boolean>>({});
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number | null>>({});
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { showModal, hideModal } = useModal();
    const [validParams, setValidParams] = useState<Record<number, boolean>>({});
    const pestInputRefs = useRef<Record<string, NativeTextInput | null>>({});
    const tmcInputRefs = useRef<Record<string, Record<'p' | 'n' | 'u' | 'v', NativeTextInput | null>>>({});

    // Инициализация isMounted
    useEffect(() => {
        setIsMounted(true);
        console.log('Component mounted, isMounted set to true');
    }, []);

    // Элементы выпадающего списка
    const items = useMemo(
        () =>
            itemsTabContent[index]?.param?.map((data: any, idx: number) => {
                if (!data?.name) {
                    console.warn(`Missing name in control_points[${idx}]`, data);
                    return null;
                }
                return {
                    label: data.name.toString() || `Элемент ${idx + 1}`,
                    value: idx,
                    dotColor: data.badge.color,
                };
            })
                .filter((item): item is { label: string; value: number; dotColor: string } => !!item) || [],
        [itemsTabContent, index]
    );

    // Инициализация selectedValue на основе tabId
    useEffect(() => {
        if (!tabId || items.length === 0) {
            setSelectedValue(0);
            setIsInitialized(true);
            console.log('No tabId or empty items, selectedValue set to 0');
            return;
        }
        const paramIndex = itemsTabContent[index]?.param?.findIndex((cp: any) => cp.id === tabId);
        console.log('tabId:', tabId, 'paramIndex:', paramIndex, 'items:', items);
        if (paramIndex !== -1 && paramIndex !== selectedValue) {
            setSelectedValue(paramIndex);
            setIsInitialized(true);
            console.log('SelectedValue set to', paramIndex);
        } else {
            setSelectedValue(0);
            setIsInitialized(true);
            console.log('SelectedValue set to 0 (default)');
        }
    }, [tabId, index, itemsTabContent, items]);

    // Трансформация TMC
    const transformObjectToArrayTMC = (originalObject: any) => {
        const { name, fields, id } = originalObject;
        const fieldName = fields?.p?.name?.replace(/\[[^\]]+\]$/, '') || `tmc_${id}`;
        const result = [{
            name: fieldName,
            label: name || 'Без названия',
            id: id || '',
            type: 'tmc',
            value: {
                p: { value: fields?.p?.value !== undefined ? fields.p.value.toString() : '' },
                n: { value: fields?.n?.value !== undefined ? fields.n.value.toString() : '' },
                u: { value: fields?.u?.value !== undefined ? fields.u.value.toString() : '' },
                v: { value: fields?.v?.value !== undefined ? fields.v.value.toString() : '' },
            },
        }];
        console.log('Transformed TMC:', result); // Для отладки
        return result;
    };

    // Трансформация Pests
    const transformObjectToArrayPests = (originalObject: any) => {
        const { name, id, field } = originalObject;
        return [{
            type: 'pest',
            name: field?.name || `pest_${id}`,
            value: field?.value || '',
            label: name || 'Без названия',
        }];
    };

    // Трансформация данных
    const transformData = (data: FormField[]): TransferField[] => {
        return data
            .map((field) => {
                if (field.type === 'radio') {
                    return {
                        radio: {
                            label: field.label,
                            name: field.name,
                            options: field.options.map((opt: any) => ({ ...opt })),
                        },
                    };
                }
                if (field.type === 'text') {
                    return { text: { label: field.label, value: field.value, name: field.name } };
                }
                if (field.type === 'foto') {
                    return { foto: { value: field.value || [], name: field.name } };
                }
                if (field.type === 'checkbox') {
                    return {
                        checkbox: { label: field.label, checked: field.checked, name: field.name },
                    };
                }
                if (field.type === 'select') {
                    const options = Array.isArray(field.options)
                        ? field.options.map((opt: any) => ({
                            value: opt.value,
                            text: opt.text,
                            selected: opt.selected || false,
                            color: opt.color || '#000000',
                        }))
                        : Object.entries(field.options).map(([key, opt]: [string, any]) => ({
                            value: key,
                            text: opt.text || opt.value,
                            selected: opt.selected || false,
                            color: opt.color || '#000000',
                        }));
                    return {
                        select: {
                            label: field.label,
                            options,
                            name: field.name,
                            value: options.find((opt) => opt.selected)?.value || null,
                        },
                    };
                }
                if (field.type === 'pest') {
                    return {
                        pest: { label: field.label, name: field.name, value: field.value || '' },
                    };
                }
                if (field.type === 'tmc') {
                    return {
                        tmc: {
                            label: field.label || '',
                            name: field.name,
                            value: field.value || { p: { value: '' }, n: { value: '' }, u: { value: '' }, v: { value: '' } },
                        },
                    };
                }
                return null;
            })
            .filter((item): item is TransferField => item !== null);
    };

    // Сохранение текущего состояния
    const saveCurrentState = (value: number) => {
        setAllFields((prev) => ({
            ...prev,
            [value]: field,
        }));
        const isContentHidden = transferDataVisible(field).isContentHidden;
        const isCurrentParamValid = areAllFieldsValid(isContentHidden);
        setValidParams((prev) => ({
            ...prev,
            [value]: isCurrentParamValid,
        }));
        //console.log('Saved state for value:', value, 'Fields:', field, 'Valid:', isCurrentParamValid);
    };

    // Загрузка полей
    const loadFields = (value: number) => {
        console.log('TMC data from server:', itemsTabContent[index]?.param?.[value].tmc);
        console.log('TMC values from server:', itemsTabContent[index]?.param?.[value].tmc?.map(item => item.value));

        if (!itemsTabContent[index]?.param?.[value]) {
            console.log('No params found for value:', value);
            return;
        }

        const savedFields = allFields[value];

        if (savedFields) {
            setField(savedFields);
            const updatedInputTexts: Record<string, string> = {};
            const updatedIsEnabled: Record<string, boolean> = {};
            const updatedRadioStates: Record<
                string,
                { yes: boolean; no: boolean; isContentVisible: boolean }
            > = {};
            const updatedTmcValues: Record<string, { p: string; n: string; u: string; v: string }> = {};
            const updatedPestValues: Record<string, string> = {};
            const updatedDropdownValues: Record<string, number | null> = {};
            const updatedFieldValid: Record<string, boolean> = {};

            savedFields.forEach((item) => {
                if (item?.foto) {
                    updatedFieldValid[item.foto.name] =
                        Array.isArray(item.foto.value) && item.foto.value.length > 0;
                }
                if (item?.text) {
                    updatedInputTexts[item.text.name] = item.text.value || '';
                    updatedFieldValid[item.text.name] = (item.text.value || '').length >= 5;
                }
                if (item?.checkbox) {
                    updatedIsEnabled[item.checkbox.name] = item.checkbox.checked || false;
                }
                if (item?.radio) {
                    updatedRadioStates[item.radio.name] = {
                        yes: item.radio.options.some((opt) => opt.value === '1' && opt.selected),
                        no: item.radio.options.some((opt) => opt.value === '0' && opt.selected),
                        isContentVisible: item.radio.options.some(
                            (opt) => opt.selected && opt.value === '1',
                        ),
                    };
                    updatedFieldValid[item.radio.name] = item.radio.options.some((opt) => opt.selected);
                }
                if (item?.select) {
                    const options = Array.isArray(item.select.options)
                        ? item.select.options
                        : item.select.options;
                    const selected = options.find((opt: any) => opt.selected);
                    updatedDropdownValues[item.select.name] = selected
                        ? parseInt(selected.value)
                        : item.select.value
                            ? parseInt(item.select.value)
                            : null;
                    updatedFieldValid[item.select.name] = !!selected || !!item.select.value;
                }
                if (item?.tmc && item.tmc.name !== 'placeholder_tmc') {
                    updatedTmcValues[item.tmc.name] = {
                        p: item.tmc.value.p?.value !== undefined ? item.tmc.value.p.value.toString() : '',
                        n: item.tmc.value.n?.value !== undefined ? item.tmc.value.n.value.toString() : '',
                        u: item.tmc.value.u?.value !== undefined ? item.tmc.value.u.value.toString() : '',
                        v: item.tmc.value.v?.value !== undefined ? item.tmc.value.v.value.toString() : '',
                    };
                    updatedFieldValid[`${item.tmc.name}_p`] = true; // p всегда валидно
                    updatedFieldValid[`${item.tmc.name}_n`] = !!item.tmc.value.n?.value;
                    updatedFieldValid[`${item.tmc.name}_u`] = !!item.tmc.value.u?.value;
                    updatedFieldValid[`${item.tmc.name}_v`] = !!item.tmc.value.v?.value;
                }
                if (item?.pest) {
                    updatedPestValues[item.pest.name] = item.pest.value || '';
                    updatedFieldValid[item.pest.name] = !!item.pest.value;
                }
            });

            setInputTexts((prev) => ({ ...prev, ...updatedInputTexts }));
            setIsEnabled((prev) => ({ ...prev, ...updatedIsEnabled }));
            setRadioStates((prev) => ({ ...prev, ...updatedRadioStates }));
            setTmcValues((prev) => ({ ...prev, ...updatedTmcValues }));
            setPestValues((prev) => ({ ...prev, ...updatedPestValues }));
            setSelectedDropdownValues((prev) => ({ ...prev, ...updatedDropdownValues }));
            setIsFieldValid((prev) => ({ ...prev, ...updatedFieldValid }));
            console.log('Updated states:', {
                tmcValues: updatedTmcValues,
            });
        } else {
            const fields = itemsTabContent[index].param[value]?.fields || [];
            const TMC = itemsTabContent[index].param[value]?.tmc || [];
            const pests = itemsTabContent[index].param[value]?.pests || [];
            const isTmcUsed = itemsTabContent[index].param[value]?.tmc_used === '1';

            let fieldsTMC: any[] = [];
            if (isTmcUsed) {
                fieldsTMC =
                    TMC.length === 0
                        ? [{ type: 'tmc', name: 'placeholder_tmc', label: '' }]
                        : Array.isArray(TMC)
                            ? TMC.map(transformObjectToArrayTMC).flat()
                            : [];
            }

            const fieldsPests = Array.isArray(pests)
                ? pests.map(transformObjectToArrayPests).flat()
                : [];
            // Изменяем порядок: сначала fieldsPests, затем fieldsTMC
            const combinedArray = [...fields, ...fieldsPests, ...fieldsTMC];

            const transformedField = transformData(combinedArray);
            setField(transformedField);

            const initialInputTexts: Record<string, string> = {};
            const initialCheckboxStates: Record<string, boolean> = {};
            const initialRadioStates: Record<
                string,
                { yes: boolean; no: boolean; isContentVisible: boolean }
            > = {};
            const initialTmcValues: Record<string, { p: string; n: string; u: string; v: string }> = {};
            const initialPestValues: Record<string, string> = {};
            const initialDropdownValues: Record<string, number | null> = {};
            const initialFieldValid: Record<string, boolean> = {};

            transformedField.forEach((item) => {
                if (item?.foto) {
                    initialFieldValid[item.foto.name] =
                        Array.isArray(item.foto.value) && item.foto.value.length > 0;
                }
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value || '';
                    initialFieldValid[item.text.name] = (item.text.value || '').length >= 5;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked || false;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.options.some((opt) => opt.value === '1' && opt.selected),
                        no: item.radio.options.some((opt) => opt.value === '0' && opt.selected),
                        isContentVisible: item.radio.options.some(
                            (opt) => opt.selected && opt.value === '1',
                        ),
                    };
                    initialFieldValid[item.radio.name] = item.radio.options.some((opt) => opt.selected);
                }
                if (item?.select) {
                    const options = Array.isArray(item.select.options)
                        ? item.select.options
                        : item.select.options;
                    const selected = options.find((opt: any) => opt.selected);
                    initialDropdownValues[item.select.name] = selected
                        ? parseInt(selected.value)
                        : item.select.value
                            ? parseInt(item.select.value)
                            : null;
                    initialFieldValid[item.select.name] = !!selected || !!item.select.value;
                }
                if (item?.tmc && item.tmc.name !== 'placeholder_tmc') {
                    initialTmcValues[item.tmc.name] = {
                        p: item.tmc.value.p?.value !== undefined ? item.tmc.value.p.value.toString() : '',
                        n: item.tmc.value.n?.value !== undefined ? item.tmc.value.n.value.toString() : '',
                        u: item.tmc.value.u?.value !== undefined ? item.tmc.value.u.value.toString() : '',
                        v: item.tmc.value.v?.value !== undefined ? item.tmc.value.v.value.toString() : '',
                    };
                    initialFieldValid[`${item.tmc.name}_p`] = true; // p всегда валидно
                    initialFieldValid[`${item.tmc.name}_n`] = !!item.tmc.value.n?.value;
                    initialFieldValid[`${item.tmc.name}_u`] = !!item.tmc.value.u?.value;
                    initialFieldValid[`${item.tmc.name}_v`] = !!item.tmc.value.v?.value;
                }
                if (item?.pest) {
                    initialPestValues[item.pest.name] = item.pest.value || '';
                    initialFieldValid[item.pest.name] = !!item.pest.value;
                }
            });

            setInputTexts((prev) => ({ ...prev, ...initialInputTexts }));
            setIsEnabled((prev) => ({ ...prev, ...initialCheckboxStates }));
            setRadioStates((prev) => ({ ...prev, ...initialRadioStates }));
            setTmcValues((prev) => ({ ...prev, ...initialTmcValues }));
            setPestValues((prev) => ({ ...prev, ...initialPestValues }));
            setSelectedDropdownValues((prev) => ({ ...prev, ...initialDropdownValues }));
            setIsFieldValid((prev) => ({ ...prev, ...initialFieldValid }));
            setAllFields((prev) => ({
                ...prev,
                [value]: transformedField,
            }));
            console.log('Initialized tmcValues:', initialTmcValues);
        }
    };

    useEffect(() => {
        if (!isLoading && isInitialized) {
            loadFields(selectedValue);
        }
    }, [selectedValue, itemsTabContent, index, isLoading, isInitialized]);

    // Валидация полей
    useEffect(() => {
        if (!isMounted) return;

        const updatedFieldValid: Record<string, boolean> = {};
        field.forEach((item) => {
            if (item?.text) {
                updatedFieldValid[item.text.name] = (inputTexts[item.text.name] || '').length >= 5;
            }
            if (item?.select) {
                updatedFieldValid[item.select.name] = selectedDropdownValues[item.select.name] !== null && selectedDropdownValues[item.select.name] !== undefined;
            }
            if (item?.tmc && item.tmc.name !== 'placeholder_tmc') {
                updatedFieldValid[`${item.tmc.name}_p`] = !!tmcValues[item.tmc.name]?.p;
                updatedFieldValid[`${item.tmc.name}_n`] = !!tmcValues[item.tmc.name]?.n;
                updatedFieldValid[`${item.tmc.name}_u`] = !!tmcValues[item.tmc.name]?.u;
                updatedFieldValid[`${item.tmc.name}_v`] = !!tmcValues[item.tmc.name]?.v;
            }
            if (item?.pest) {
                updatedFieldValid[item.pest.name] = !!pestValues[item.pest.name];
            }
            if (item?.foto) {
                updatedFieldValid[item.foto.name] = Array.isArray(item.foto.value) && item.foto.value.length > 0;
            }
            if (item?.radio) {
                updatedFieldValid[item.radio.name] = item.radio.options.some((opt) => opt.selected);
            }
        });
        setIsFieldValid((prev) => {
            //console.log('Updated isFieldValid:', updatedFieldValid, 'Previous isFieldValid:', prev);
            return { ...prev, ...updatedFieldValid };
        });

        // Проверяем валидность текущего параметра
        const isContentHidden = transferDataVisible(field).isContentHidden;
        const isCurrentParamValid = areAllFieldsValid(isContentHidden);
        setValidParams((prev) => ({
            ...prev,
            [selectedValue]: isCurrentParamValid,
        }));
    }, [field, inputTexts, selectedDropdownValues, tmcValues, pestValues, radioStates, isMounted, selectedValue]);

    // Отправка обновлений на сервер
    const sendFieldUpdate = async (name: string, value: any, type: string) => {
        try {
            let payload;
            if (type === 'tmc') {
                payload = { answer: name, value };
                console.log('payload tmc', payload);
            } else if (type === 'radio') {
                payload = { answer: name, value };
            } else if (type === 'text') {
                payload = { answer: name, value };
            } else if (type === 'checkbox') {
                payload = { answer: name, checked: value };
            } else if (type === 'select') {
                payload = { answer: name, value: value.toString() };
            } else if (type === 'pest') {
                payload = { answer: name, value };
            }

            if (payload) {
                await postData(`checklist/${idCheckList}`, { answers: [payload] });
                console.log('Sent field update:', payload);
            }
        } catch (error) {
            console.error('Ошибка при обновлении поля:', error);
        }
    };

    // Обработчики
    const handleSelect = (value: number) => {
        saveCurrentState(selectedValue);
        setSelectedValue(value);
        //console.log('Selected value changed to:', value);
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
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));

        sendFieldUpdate(name, selectedOption.value, 'radio');
       // console.log('Radio button pressed:', name, selectedOption.value);
    };

    const handleChangeInputText = (text: string, name: string) => {
        setInputTexts((prev) => ({ ...prev, [name]: text }));
        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = text.length >= 5;
                //console.log(`Text input changed: ${name}, value: ${text}, valid: ${isValid}`);
                return { ...prev, [name]: isValid };
            });
        }
    };

    const handleBlurTextInput = (name: string) => {
        const textValue = inputTexts[name] || '';
        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = textValue.length >= 5;
                //console.log(`Text input blurred: ${name}, value: ${textValue}, valid: ${isValid}`);
                return { ...prev, [name]: isValid };
            });
        }

        const updatedField = field.map((item) => {
            if (item.text && item.text.name === name) {
                return { ...item, text: { ...item.text, value: textValue } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));

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
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));

        sendFieldUpdate(name, checked, 'checkbox');
       // console.log('Checkbox changed:', name, checked);
    };

    const handleSelectDropdown = (value: number, name: string) => {
        setSelectedDropdownValues((prev) => ({ ...prev, [name]: value }));
        if (isMounted) {
            setIsFieldValid((prev) => {
                //console.log(`Dropdown selected: ${name}, value: ${value}, valid: true`);
                return { ...prev, [name]: true };
            });
        }

        const updatedField = field.map((item) => {
            if (item.select && item.select.name === name) {
                const updatedOptions = Array.isArray(item.select.options)
                    ? item.select.options.map((opt: any) => ({
                        ...opt,
                        selected: parseInt(opt.value) === value,
                    }))
                    : Object.entries(item.select.options).reduce(
                        (acc, [key, opt]: [string, any]) => {
                            acc[key] = { ...opt, selected: parseInt(key) === value };
                            return acc;
                        },
                        {} as Record<string, any>
                    );
                return { ...item, select: { ...item.select, options: updatedOptions } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));

        sendFieldUpdate(name, value, 'select');
    };

    const handleChangeTmc = (text: string, name: string, fieldType: 'n' | 'u' | 'v') => {
        setTmcValues((prev) => {
            const current = prev[name] || { p: '', n: '', u: '', v: '' };
            return {
                ...prev,
                [name]: { ...current, [fieldType]: text },
            };
        });
        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = !!text;
                console.log(`TMC changed: ${name}_${fieldType}, value: ${text}, valid: ${isValid}`);
                return { ...prev, [`${name}_${fieldType}`]: isValid };
            });
        }
    };

    const handleBlurTmc = (name: string, fieldType: 'n' | 'u' | 'v') => {
        const tmcValue = tmcValues[name]?.[fieldType] || '';
        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = !!tmcValue;
                console.log(`TMC blurred: ${name}_${fieldType}, value: ${tmcValue}, valid: ${isValid}`);
                return { ...prev, [`${name}_${fieldType}`]: isValid };
            });
        }

        const updatedField = field.map((item) => {
            if (item.tmc && item.tmc.name === name) {
                return {
                    ...item,
                    tmc: {
                        ...item.tmc,
                        value: {
                            ...item.tmc.value,
                            [fieldType]: { ...item.tmc.value[fieldType], value: tmcValue },
                        },
                    },
                };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));

        const fullTmcValue = {
            p: tmcValues[name]?.p || '', // Используем исходное значение p
            n: tmcValues[name]?.n || '',
            u: tmcValues[name]?.u || '',
            v: tmcValues[name]?.v || '',
        };

        // Проверка для поля n при потере фокуса
        if (fieldType === 'n') {
            const p = parseFloat(fullTmcValue.p) || 0;
            const n = parseFloat(tmcValue) || 0;

            if (n > p) {
                Keyboard.dismiss();
                // Модальное окно для n > p
                showModal(
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Предыдущий остаток ТМЦ={p}. Текущий остаток не может быть более {p}. Введите верные данные!
                        </Text>
                        <View style={[styles.modalButtonContainer, { justifyContent: 'center' }]}>
                            <TextButton
                                text="Закрыть"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={() => {
                                    // Устанавливаем значение n равным p и возвращаем фокус
                                    setTmcValues((prev) => ({
                                        ...prev,
                                        [name]: { ...prev[name], n: p.toString() },
                                    }));
                                    setField((prev) =>
                                        prev.map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, n: { value: p.toString() } },
                                                    },
                                                }
                                                : item
                                        )
                                    );
                                    setAllFields((prev) => ({
                                        ...prev,
                                        [selectedValue]: prev[selectedValue].map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, n: { value: p.toString() } },
                                                    },
                                                }
                                                : item
                                        ),
                                    }));
                                    setIsFieldValid((prev) => ({ ...prev, [`${name}_n`]: true }));
                                    tmcInputRefs.current[name]?.n?.focus(); // Возвращаем фокус
                                    hideModal();
                                }}
                            />
                        </View>
                    </View>,
                    {
                        overlay: { alignItems: 'center', justifyContent: 'center' },
                        overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                    },
                    () => {
                        // Действия при клике вне модального окна
                        setTmcValues((prev) => ({
                            ...prev,
                            [name]: { ...prev[name], n: p.toString() },
                        }));
                        setField((prev) =>
                            prev.map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, n: { value: p.toString() } },
                                        },
                                    }
                                    : item
                            )
                        );
                        setAllFields((prev) => ({
                            ...prev,
                            [selectedValue]: prev[selectedValue].map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, n: { value: p.toString() } },
                                        },
                                    }
                                    : item
                            ),
                        }));
                        setIsFieldValid((prev) => ({ ...prev, [`${name}_n`]: true }));
                        tmcInputRefs.current[name]?.n?.focus();
                        hideModal();
                        console.log('Модальное окно закрыто по клику вне области');
                    }
                );
            } else if (n < p) {
                Keyboard.dismiss();
                // Модальное окно для n < p
                showModal(
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Предыдущий остаток ТМЦ={p}, Вы подтверждаете, что {p - n} ед. препарата было съедено?
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TextButton
                                text="Нет"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={() => {
                                    // Устанавливаем значение n равным p и возвращаем фокус
                                    setTmcValues((prev) => ({
                                        ...prev,
                                        [name]: { ...prev[name], n: p.toString() },
                                    }));
                                    setField((prev) =>
                                        prev.map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, n: { value: p.toString() } },
                                                    },
                                                }
                                                : item
                                        )
                                    );
                                    setAllFields((prev) => ({
                                        ...prev,
                                        [selectedValue]: prev[selectedValue].map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, n: { value: p.toString() } },
                                                    },
                                                }
                                                : item
                                        ),
                                    }));
                                    setIsFieldValid((prev) => ({ ...prev, [`${name}_n`]: true }));
                                    tmcInputRefs.current[name]?.n?.focus(); // Возвращаем фокус
                                    hideModal();
                                }}
                            />
                            <TextButton
                                text="Да"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#017EFA"
                                onPress={() => {
                                    // Отправляем данные на сервер
                                    sendFieldUpdate(name, fullTmcValue, 'tmc');
                                    hideModal();
                                }}
                            />
                        </View>
                    </View>,
                    {
                        overlay: { alignItems: 'center', justifyContent: 'center' },
                        overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                    },
                    () => {
                        // Действия при клике вне модального окна (аналогично кнопке "Нет")
                        setTmcValues((prev) => ({
                            ...prev,
                            [name]: { ...prev[name], n: p.toString() },
                        }));
                        setField((prev) =>
                            prev.map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, n: { value: p.toString() } },
                                        },
                                    }
                                    : item
                            )
                        );
                        setAllFields((prev) => ({
                            ...prev,
                            [selectedValue]: prev[selectedValue].map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, n: { value: p.toString() } },
                                        },
                                    }
                                    : item
                            ),
                        }));
                        setIsFieldValid((prev) => ({ ...prev, [`${name}_n`]: true }));
                        tmcInputRefs.current[name]?.n?.focus();
                        hideModal();
                        console.log('Модальное окно закрыто по клику вне области');
                    }
                );
            } else {
                // Если n === p, отправляем данные на сервер
                sendFieldUpdate(name, fullTmcValue, 'tmc');
            }
        }
        // Проверка для поля u при потере фокуса
        else if (fieldType === 'u') {
            const n = parseFloat(fullTmcValue.n) || 0;
            const u = parseFloat(tmcValue) || 0;

            if (u > n) {
                Keyboard.dismiss();
                // Модальное окно для u > n
                showModal(
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Утилизировано не может превышать текущий остаток. Введите правильное значение!
                        </Text>
                        <View style={[styles.modalButtonContainer, { justifyContent: 'center' }]}>
                            <TextButton
                                text="Закрыть"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={() => {
                                    // Устанавливаем значение u равным 0 и возвращаем фокус
                                    setTmcValues((prev) => ({
                                        ...prev,
                                        [name]: { ...prev[name], u: '0' },
                                    }));
                                    setField((prev) =>
                                        prev.map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, u: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        )
                                    );
                                    setAllFields((prev) => ({
                                        ...prev,
                                        [selectedValue]: prev[selectedValue].map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, u: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        ),
                                    }));
                                    setIsFieldValid((prev) => ({ ...prev, [`${name}_u`]: true }));
                                    tmcInputRefs.current[name]?.u?.focus(); // Возвращаем фокус
                                    hideModal();
                                }}
                            />
                        </View>
                    </View>,
                    {
                        overlay: { alignItems: 'center', justifyContent: 'center' },
                        overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                    },
                    () => {
                        // Действия при клике вне модального окна
                        setTmcValues((prev) => ({
                            ...prev,
                            [name]: { ...prev[name], u: '0' },
                        }));
                        setField((prev) =>
                            prev.map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, u: { value: '0' } },
                                        },
                                    }
                                    : item
                            )
                        );
                        setAllFields((prev) => ({
                            ...prev,
                            [selectedValue]: prev[selectedValue].map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, u: { value: '0' } },
                                        },
                                    }
                                    : item
                            ),
                        }));
                        setIsFieldValid((prev) => ({ ...prev, [`${name}_u`]: true }));
                        tmcInputRefs.current[name]?.u?.focus();
                        hideModal();
                        console.log('Модальное окно закрыто по клику вне области');
                    }
                );
            } else {
                // Если u <= n, отправляем данные на сервер
                sendFieldUpdate(name, fullTmcValue, 'tmc');
            }
        }
        // Проверка для поля v при потере фокуса
        else if (fieldType === 'v') {
            const p = parseFloat(fullTmcValue.p) || 0;
            const n = parseFloat(fullTmcValue.n) || 0;
            const u = parseFloat(fullTmcValue.u) || 0;
            const v = parseFloat(tmcValue) || 0;
            const total = n - u + v;

            if (total === 0) {
                Keyboard.dismiss();
                // Модальное окно для нулевого остатка
                showModal(
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Сейчас в ККТ нет ТМЦ. Вы подтверждаете это?</Text>
                        <View style={styles.modalButtonContainer}>
                            <TextButton
                                text="Нет"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={() => {
                                    // Устанавливаем значение v равным 0 и возвращаем фокус
                                    setTmcValues((prev) => ({
                                        ...prev,
                                        [name]: { ...prev[name], v: '0' },
                                    }));
                                    setField((prev) =>
                                        prev.map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, v: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        )
                                    );
                                    setAllFields((prev) => ({
                                        ...prev,
                                        [selectedValue]: prev[selectedValue].map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, v: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        ),
                                    }));
                                    setIsFieldValid((prev) => ({ ...prev, [`${name}_v`]: true }));
                                    tmcInputRefs.current[name]?.v?.focus(); // Возвращаем фокус
                                    hideModal();
                                }}
                            />
                            <TextButton
                                text="Да"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#017EFA"
                                onPress={() => {
                                    // Отправляем данные на сервер с исходным p
                                    sendFieldUpdate(name, fullTmcValue, 'tmc');
                                    hideModal();
                                }}
                            />
                        </View>
                    </View>,
                    {
                        overlay: { alignItems: 'center', justifyContent: 'center' },
                        overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                    },
                    () => {
                        // Действия при клике вне модального окна (аналогично кнопке "Нет")
                        setTmcValues((prev) => ({
                            ...prev,
                            [name]: { ...prev[name], v: '0' },
                        }));
                        setField((prev) =>
                            prev.map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, v: { value: '0' } },
                                        },
                                    }
                                    : item
                            )
                        );
                        setAllFields((prev) => ({
                            ...prev,
                            [selectedValue]: prev[selectedValue].map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, v: { value: '0' } },
                                        },
                                    }
                                    : item
                            ),
                        }));
                        setIsFieldValid((prev) => ({ ...prev, [`${name}_v`]: true }));
                        tmcInputRefs.current[name]?.v?.focus();
                        hideModal();
                        console.log('Модальное окно закрыто по клику вне области');
                    }
                );
            } else if (total < 0) {
                Keyboard.dismiss();
                // Модальное окно для отрицательного остатка
                showModal(
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Остаток препарата не может быть меньше 0, введите правильное значение</Text>
                        <View style={[styles.modalButtonContainer, { justifyContent: 'center' }]}>
                            <TextButton
                                text="Закрыть"
                                width={125}
                                height={40}
                                textSize={14}
                                textColor="#FFFFFF"
                                backgroundColor="#5D6377"
                                onPress={() => {
                                    // Устанавливаем значение v равным 0 и возвращаем фокус
                                    setTmcValues((prev) => ({
                                        ...prev,
                                        [name]: { ...prev[name], v: '0' },
                                    }));
                                    setField((prev) =>
                                        prev.map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, v: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        )
                                    );
                                    setAllFields((prev) => ({
                                        ...prev,
                                        [selectedValue]: prev[selectedValue].map((item) =>
                                            item.tmc && item.tmc.name === name
                                                ? {
                                                    ...item,
                                                    tmc: {
                                                        ...item.tmc,
                                                        value: { ...item.tmc.value, v: { value: '0' } },
                                                    },
                                                }
                                                : item
                                        ),
                                    }));
                                    setIsFieldValid((prev) => ({ ...prev, [`${name}_v`]: true }));
                                    tmcInputRefs.current[name]?.v?.focus(); // Возвращаем фокус
                                    hideModal();
                                }}
                            />
                        </View>
                    </View>,
                    {
                        overlay: { alignItems: 'center', justifyContent: 'center' },
                        overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                        modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                    },
                    () => {
                        // Действия при клике вне модального окна
                        setTmcValues((prev) => ({
                            ...prev,
                            [name]: { ...prev[name], v: '0' },
                        }));
                        setField((prev) =>
                            prev.map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, v: { value: '0' } },
                                        },
                                    }
                                    : item
                            )
                        );
                        setAllFields((prev) => ({
                            ...prev,
                            [selectedValue]: prev[selectedValue].map((item) =>
                                item.tmc && item.tmc.name === name
                                    ? {
                                        ...item,
                                        tmc: {
                                            ...item.tmc,
                                            value: { ...item.tmc.value, v: { value: '0' } },
                                        },
                                    }
                                    : item
                            ),
                        }));
                        setIsFieldValid((prev) => ({ ...prev, [`${name}_v`]: true }));
                        tmcInputRefs.current[name]?.v?.focus();
                        hideModal();
                        console.log('Модальное окно закрыто по клику вне области');
                    }
                );
            } else {
                // Если остаток положительный, отправляем данные на сервер с исходным p
                sendFieldUpdate(name, fullTmcValue, 'tmc');
            }
        }
    };

    const handleChangePest = (text: string, name: string) => {
        setPestValues((prev) => ({ ...prev, [name]: text }));
        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = !!text;
               // console.log(`Pest changed: ${name}, value: ${text}, valid: ${isValid}`);
                return { ...prev, [name]: isValid };
            });
        }
    };

    const handleBlurPest = (name: string) => {
        const pestValue = pestValues[name] || '';
        const numericValue = parseInt(pestValue, 10);

        if (isMounted) {
            setIsFieldValid((prev) => {
                const isValid = !!pestValue;
                console.log(`Pest blurred: ${name}, value: ${pestValue}, valid: ${isValid}`);
                return { ...prev, [name]: isValid };
            });
        }

        // Проверка, если значение больше 0
        if (numericValue > 0) {
            Keyboard.dismiss();
            showModal(
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Вы уверены, что в ККТ обнаружены вредители?</Text>
                    <View style={styles.modalButtonContainer}>
                        <TextButton
                            text="Нет"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#5D6377"
                            onPress={() => {
                                // Устанавливаем значение 0 и возвращаем фокус
                                setPestValues((prev) => ({ ...prev, [name]: '0' }));
                                setField((prev) =>
                                    prev.map((item) =>
                                        item.pest && item.pest.name === name
                                            ? { ...item, pest: { ...item.pest, value: '0' } }
                                            : item
                                    )
                                );
                                setAllFields((prev) => ({
                                    ...prev,
                                    [selectedValue]: field.map((item) =>
                                        item.pest && item.pest.name === name
                                            ? { ...item, pest: { ...item.pest, value: '0' } }
                                            : item
                                    ),
                                }));
                                setIsFieldValid((prev) => ({ ...prev, [name]: true }));
                                pestInputRefs.current[name]?.focus(); // Возвращаем фокус
                                hideModal();
                            }}
                        />
                        <TextButton
                            text="Да"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#017EFA"
                            onPress={() => {
                                // Отправляем данные на сервер
                                const updatedField = field.map((item) => {
                                    if (item.pest && item.pest.name === name) {
                                        return { ...item, pest: { ...item.pest, value: pestValue } };
                                    }
                                    return item;
                                });
                                setField(updatedField);
                                setAllFields((prev) => ({
                                    ...prev,
                                    [selectedValue]: updatedField,
                                }));
                                sendFieldUpdate(name, pestValue, 'pest');
                                hideModal();
                            }}
                        />
                    </View>
                </View>,
                {
                    overlay: { alignItems: 'center', justifyContent: 'center' },
                    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                },
                () => {
                    // Устанавливаем значение 0 и возвращаем фокус
                    setPestValues((prev) => ({ ...prev, [name]: '0' }));
                    setField((prev) =>
                        prev.map((item) =>
                            item.pest && item.pest.name === name
                                ? { ...item, pest: { ...item.pest, value: '0' } }
                                : item
                        )
                    );
                    setAllFields((prev) => ({
                        ...prev,
                        [selectedValue]: field.map((item) =>
                            item.pest && item.pest.name === name
                                ? { ...item, pest: { ...item.pest, value: '0' } }
                                : item
                        ),
                    }));
                    setIsFieldValid((prev) => ({ ...prev, [name]: true }));
                    pestInputRefs.current[name]?.focus(); // Возвращаем фокус
                    hideModal();
                }
            );
        } else {
            // Если значение не больше 0, обновляем поле и отправляем данные
            const updatedField = field.map((item) => {
                if (item.pest && item.pest.name === name) {
                    return { ...item, pest: { ...item.pest, value: pestValue } };
                }
                return item;
            });
            setField(updatedField);
            setAllFields((prev) => ({
                ...prev,
                [selectedValue]: updatedField,
            }));
            sendFieldUpdate(name, pestValue, 'pest');
        }
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
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));
       // console.log('Image uploaded:', name, newImage);
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
        setAllFields((prev) => ({
            ...prev,
            [selectedValue]: updatedField,
        }));
        //console.log('Image removed:', name, removedImage);
    };

    const handleCloseModalTMC = () => {
        hideModal();
       // console.log('TMC modal closed');
    };

    const handleAddModalTmc = () => {
        const paramId = itemsTabContent[index]?.param?.[selectedValue]?.id || '';
        onReload?.();
        router.push({
            pathname: '/checklist',
            params: {
                id: '20',
                idCheckList: idCheckList,
                typeCheckList: '3',
                statusVisible: 'edit',
                tabId: zoneId,
                tabIdTMC: paramId,
            },
        });
        hideModal();
        console.log('TMC modal added, navigating with paramId:', paramId);
    };

    const handleLoadTMC = async () => {
        const paramId = itemsTabContent[index]?.param?.[selectedValue]?.id || '';
        showModal(
            <ShowSelectTMC
                idChecklist={idCheckList}
                idTMC={paramId}
                onClosePress={handleCloseModalTMC}
                onAddPress={handleAddModalTmc}
            />,
            {
                overlay: { alignItems: 'center', justifyContent: 'center' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                modalContent: { paddingTop: 0, paddingRight: 0 },
            }
        );
       // console.log('TMC modal opened with paramId:', paramId);
    };

    // Рендеринг полей
    const transferDataVisible = (data: TransferField[] = []) => {
        if (!Array.isArray(data)) data = [];
        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest = false;
        let selectCounter = 0;

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
                                        backgroundColor={option.selected ? option.bgcolor : '#5D6377'}
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
                                    !isFieldValid[componentData.name] &&
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
                                !isFieldValid[componentData.name] &&
                                inputTexts[componentData.name] !== undefined && (
                                    <Text style={styles.errorText}>Минимум 5 символов</Text>
                                )}
                        </View>
                    );
                case 'foto':
                    return (
                        <View key={`image-${idx}`} style={{ marginBottom: 17 }}>
                            <ImagePickerWithCamera
                                taskId={idTask}
                                initialImages={componentData.value || []}
                                path={`checklist/${idCheckList}/${componentData.name}`}
                                name={componentData.name}
                                onImageUploaded={(newImage) => handleImageUploaded(componentData.name, newImage)}
                                onImageRemoved={(removedImage) => handleImageRemoved(componentData.name, removedImage)}
                                viewGallery={true}
                                borderColor={isMounted && !isFieldValid[componentData.name] ? 'red' : 'transparent'}
                            />
                        </View>
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
                case 'select':
                    const selectedValue = selectedDropdownValues[componentData.name] ?? null;
                    const options = Array.isArray(componentData.options)
                        ? componentData.options.map((opt: any) => ({
                            label: opt.text || opt.value, // Используем text или value для отображения
                            value: parseInt(opt.value),
                            color: opt.color || '#000000',
                        }))
                        : Object.entries(componentData.options).map(([key, opt]: [string, any]) => ({
                            label: opt.value, // Используем opt.value как текст для отображения
                            value: parseInt(key), // Ключ объекта как значение
                            color: opt.color || '#000000',
                        }));
                    const selectedOption = options.find((option) => option.value === selectedValue);
                    const selectedColor = selectedOption ? selectedOption.color : '#000000';
                    selectCounter++;
                    //console.log(`Rendering Dropdown for ${componentData.name}:`, {
                    //    selectedValue,
                    //    options,
                    //    selectedColor,
                    //});

                    return (
                        <View key={`select-${idx}`} style={[styles.selectContainer, { zIndex: 1000 - selectCounter }]}>
                            <Text style={[styles.label, { color: '#1C1F37' }]}>{componentData.label}</Text>
                            <Dropdown
                                style={[
                                    styles.dropdownTMC,
                                    isMounted && !isFieldValid[componentData.name] && {
                                        borderColor: 'red',
                                        borderWidth: 1,
                                    },
                                ]}
                                data={options}
                                labelField="label"
                                valueField="value"
                                value={selectedValue}
                                onChange={(item) => handleSelectDropdown(item.value, componentData.name)}
                                placeholder="Выбрать"
                                placeholderStyle={{ color: '#000000', fontSize: 14 }}
                                selectedTextStyle={{ color: selectedColor, fontSize: 14 }}
                                containerStyle={{ backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }}
                                itemTextStyle={{ fontSize: 14 }}
                            />
                        </View>
                    );
                case 'pest':
                    return (
                        <View key={`pest-${idx}`}>
                            {!isHeaderVisiblePest && (
                                <>
                                    <Text style={styles.tmcTitle}>Поймано вредителей</Text>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>Наименование</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.tmcHeaderText}>Количество</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            {!isHeaderVisiblePest && (isHeaderVisiblePest = true)}
                            <View style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}>
                                <Text style={[styles.tmcText, { width: '50%' }]}>{componentData.label}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 20 }}>
                                    <View>
                                        <TextInput
                                            style={[
                                                styles.tmcTextInput,
                                                isMounted &&
                                                !isFieldValid[componentData.name] && {
                                                    borderColor: 'red',
                                                    borderWidth: 1,
                                                },
                                            ]}
                                            onChangeText={(text) => handleChangePest(text, componentData.name)}
                                            value={pestValues[componentData.name] || ''}
                                            onBlur={() => handleBlurPest(componentData.name)}
                                            keyboardType="numeric"
                                            selectTextOnFocus={true}
                                            onFocus={() => {
                                                if (!pestValues[componentData.name]) {
                                                    handleChangePest('0', componentData.name);
                                                }
                                            }}
                                            ref={(ref) => (pestInputRefs.current[componentData.name] = ref)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                case 'tmc':
                    return (
                        <View key={`tmc-${idx}`}>
                            {!isHeaderVisibleTmc && (
                                <>
                                    <View style={styles.tmcTitleContainer}>
                                        <Text style={styles.tmcTitle}>Наличие препаратов в ТК</Text>
                                        <Button
                                            TouchableComponent={TouchableOpacity as any}
                                            icon={{
                                                name: 'plus',
                                                type: 'font-awesome',
                                                size: 10,
                                                color: '#5D6377',
                                            }}
                                            containerStyle={{
                                                marginLeft: 10,
                                                backgroundColor: '#CFCFCF',
                                                borderRadius: 6,
                                            }}
                                            buttonStyle={{
                                                width: 25,
                                                height: 25,
                                                paddingHorizontal: 0,
                                                backgroundColor: '#F5F7FB',
                                            }}
                                            onPress={handleLoadTMC}
                                        />
                                    </View>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>Наименование</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={styles.tmcHeaderText}>В наличии</Text>
                                            <Text style={styles.tmcHeaderText}>Утилизировано</Text>
                                            <Text style={styles.tmcHeaderText}>Внесено</Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            {!isHeaderVisibleTmc && (isHeaderVisibleTmc = true)}
                            {componentData.name !== 'placeholder_tmc' && (
                                <View style={[styles.tmcContainer, { marginBottom: 17, alignItems: 'center' }]}>
                                    <Text style={[styles.tmcText, { width: '50%' }]}>{componentData.label}</Text>
                                    <View style={{ width: '44%', flexDirection: 'row', justifyContent: 'space-between', marginRight: 12 }}>
                                        <View>
                                            <TextInput
                                                style={[
                                                    styles.tmcTextInput,
                                                    isMounted && !isFieldValid[`${componentData.name}_n`] && {
                                                        borderColor: 'red',
                                                        borderWidth: 1,
                                                    },
                                                ]}
                                                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'n')}
                                                value={tmcValues[componentData.name]?.n || ''}
                                                onBlur={() => handleBlurTmc(componentData.name, 'n')}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                                onFocus={() => {
                                                    if (!tmcValues[componentData.name]?.n) {
                                                        handleChangeTmc('0', componentData.name, 'n');
                                                    }
                                                }}
                                                ref={(ref) => {
                                                    if (!tmcInputRefs.current[componentData.name]) {
                                                        tmcInputRefs.current[componentData.name] = { p: null, n: null, u: null, v: null };
                                                    }
                                                    tmcInputRefs.current[componentData.name]!.n = ref;
                                                }}
                                            />
                                        </View>
                                        <View>
                                            <TextInput
                                                style={[
                                                    styles.tmcTextInput,
                                                    isMounted && !isFieldValid[`${componentData.name}_u`] && {
                                                        borderColor: 'red',
                                                        borderWidth: 1,
                                                    },
                                                ]}
                                                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'u')}
                                                value={tmcValues[componentData.name]?.u || ''}
                                                onBlur={() => handleBlurTmc(componentData.name, 'u')}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                                onFocus={() => {
                                                    if (!tmcValues[componentData.name]?.u) {
                                                        handleChangeTmc('0', componentData.name, 'u');
                                                    }
                                                }}
                                                ref={(ref) => {
                                                    if (!tmcInputRefs.current[componentData.name]) {
                                                        tmcInputRefs.current[componentData.name] = { p: null, n: null, u: null, v: null };
                                                    }
                                                    tmcInputRefs.current[componentData.name]!.u = ref;
                                                }}
                                            />
                                        </View>
                                        <View>
                                            <TextInput
                                                style={[
                                                    styles.tmcTextInput,
                                                    isMounted && !isFieldValid[`${componentData.name}_v`] && {
                                                        borderColor: 'red',
                                                        borderWidth: 1,
                                                    },
                                                ]}
                                                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'v')}
                                                value={tmcValues[componentData.name]?.v || ''}
                                                onBlur={() => handleBlurTmc(componentData.name, 'v')}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                                onFocus={() => {
                                                    if (!tmcValues[componentData.name]?.v) {
                                                        handleChangeTmc('0', componentData.name, 'v');
                                                    }
                                                }}
                                                ref={(ref) => {
                                                    if (!tmcInputRefs.current[componentData.name]) {
                                                        tmcInputRefs.current[componentData.name] = { p: null, n: null, u: null, v: null };
                                                    }
                                                    tmcInputRefs.current[componentData.name]!.v = ref;
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                default:
                    return null;
            }
        });

        return { renderedComponents, isContentHidden };
    };

    // Проверка валидности полей
    const areAllFieldsValid = (isContentHidden: boolean) => {
        if (!isMounted) return false;

        // Если контент скрыт из-за выбора "Нет" в радио-кнопке, считаем валидным
        if (isContentHidden) {
            const radioFields = field.filter((item) => item.radio);
            return radioFields.every((item) => isFieldValid[item.radio.name]);
        }

        const requiredFields = field.filter(
            (item) => item.text || item.select || item.tmc || item.pest || item.foto || item.radio,
        );

        if (requiredFields.length === 0) return false;

        const isValid = requiredFields.every((item) => {
            if (item.text) return isFieldValid[item.text.name];
            if (item.select) return isFieldValid[item.select.name];
            if (item.tmc && item.tmc.name !== 'placeholder_tmc') {
                return (
                    isFieldValid[`${item.tmc.name}_n`] &&
                    isFieldValid[`${item.tmc.name}_u`] &&
                    isFieldValid[`${item.tmc.name}_v`]
                );
            }
            if (item.pest) return isFieldValid[item.pest.name];
            if (item.foto) return isFieldValid[item.foto.name];
            if (item.radio) return isFieldValid[item.radio.name];
            return true;
        });
        //console.log('All fields valid:', isValid, 'isFieldValid:', isFieldValid);
        return isValid;
    };

    // Навигация
    const handleNext = async () => {
        saveCurrentState(selectedValue);

        if (selectedValue < items.length - 1) {
            setSelectedValue((prev) => prev + 1);
            console.log('Navigating to next parameter:', selectedValue + 1);
        } else if (!isLastTab) {
            onNextTab?.();
            console.log('Navigating to next tab');
        }
    };

    const handlePrevious = async () => {
        saveCurrentState(selectedValue);

        if (selectedValue > 0) {
            setSelectedValue((prev) => prev - 1);
            console.log('Navigating to previous parameter:', selectedValue - 1);
        } else if (!isFirstTab) {
            onPreviousTab?.();
            console.log('Navigating to previous tab');
        }
    };

// Новые обработчики для кнопок
// Новые обработчики для кнопок
    const onPressNext = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) {
            showModal(
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Необходимо заполнить все поля</Text>
                    <View style={[styles.modalButtonContainer, { justifyContent: 'center' }]}>
                        <TextButton
                            text="Закрыть"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#5D6377"
                            onPress={() => {
                                hideModal();
                                handleNext(); // Выполняем переход после закрытия
                            }}
                        />
                    </View>
                </View>,
                {
                    overlay: { alignItems: 'center', justifyContent: 'center' },
                    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                },
                () => {
                    // Действия при клике вне модального окна
                    hideModal();
                    handleNext();
                    console.log('Модальное окно закрыто по клику вне области');
                }
            );
            console.log('Validation failed, showing modal');
            return;
        }
        await handleNext();
    };

    const onPressPrevious = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) {
            showModal(
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Необходимо заполнить все поля</Text>
                    <View style={[styles.modalButtonContainer, { justifyContent: 'center' }]}>
                        <TextButton
                            text="Закрыть"
                            width={125}
                            height={40}
                            textSize={14}
                            textColor="#FFFFFF"
                            backgroundColor="#5D6377"
                            onPress={() => {
                                hideModal();
                                handlePrevious(); // Выполняем переход после закрытия
                            }}
                        />
                    </View>
                </View>,
                {
                    overlay: { alignItems: 'center', justifyContent: 'center' },
                    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    modalContent: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10 },
                },
                () => {
                    // Действия при клике вне модального окна
                    hideModal();
                    handlePrevious();
                    console.log('Модальное окно закрыто по клику вне области');
                }
            );
            console.log('Validation failed, showing modal');
            return;
        }
        await handlePrevious();
    };

    // Кастомизация выпадающего списка
    const renderRightIcon = () => {
        const selectedItem = items.find((item) => item.value === selectedValue);
        return (
            <View style={styles.rightIconContainer}>
                {selectedItem && (
                    <View style={styles.dot}>
                        <DotSolid color={validParams[selectedValue] ? '#30DA88' : selectedItem.dotColor} />
                    </View>
                )}
                <Text style={styles.arrow}>▼</Text>
            </View>
        );
    };

    const renderItem = (item: { label: string; value: number; dotColor: string }) => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
                <View style={styles.dot}>
                    <DotSolid color={validParams[item.value] ? '#30DA88' : item.dotColor} />
                </View>
            </View>
        );
    };

    // Рендеринг
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
                            renderRightIcon={renderRightIcon}
                            renderItem={renderItem}
                        />
                    </View>
                    <KeyboardAwareScrollView>
                        {transferDataVisible(field).renderedComponents}
                    </KeyboardAwareScrollView>
                    <Footer>
                        <View
                            style={[
                                styles.footerContainer,
                                {
                                    justifyContent:
                                        isFirstTab && selectedValue === 0
                                            ? 'flex-end' // Только "Далее"
                                            : isLastTab && selectedValue === items.length - 1
                                                ? 'flex-start' // Только "Назад"
                                                : 'space-between', // Обе кнопки
                                },
                            ]}
                        >
                            {!(isFirstTab && selectedValue === 0) && (
                                <TextButton
                                    text="Назад"
                                    width={125}
                                    height={40}
                                    textSize={14}
                                    textColor="#FFFFFF"
                                    backgroundColor="#5D6377"
                                    onPress={onPressPrevious}
                                    enabled={true}
                                    touchable={true}
                                />
                            )}
                            {!(isLastTab && selectedValue === items.length - 1) && (
                                <TextButton
                                    text="Далее"
                                    width={125}
                                    height={40}
                                    textSize={14}
                                    textColor="#FFFFFF"
                                    backgroundColor="#017EFA"
                                    onPress={onPressNext}
                                    enabled={true}
                                    touchable={true}
                                />
                            )}
                        </View>
                    </Footer>
                </>
            ) : (
                <Text style={styles.errorText}>Данные отсутствуют</Text>
            )}
        </View>
    );
};

// Стили
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
    selectContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
        marginBottom: 17,
    },
    tmcContainer: {
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    tmcTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
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
        fontWeight: '500',
        color: '#919191',
    },
    tmcTextInput: {
        width: 40,
        height: 30,
        backgroundColor: '#F5F7FB',
        borderRadius: 4,
        fontSize: 12,
        color: '#1C1F37',
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingHorizontal: 4,
        paddingVertical: 0,
        lineHeight: 14,
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
    },
    dropdownTMC: {
        height: 40,
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
        width: '40%',
    },
    dropdownText: {
        color: '#000000',
        fontSize: 14,
    },
    dropdownItemText: {
        color: '#1C1F37',
        fontSize: 14,
        fontWeight: '400',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rightIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        marginRight: 8,
    },
    arrow: {
        fontSize: 14,
        color: '#5D6377',
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 14,
    },
    modalContainer: {
        alignItems: 'center',
        padding: 20,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#1C1F37',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // По умолчанию для двух кнопок
        width: '100%',
    },
});

export default memo(TabContentEdit);
