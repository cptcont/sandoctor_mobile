import React, { useEffect, useState, memo, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button } from '@rneui/themed';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ImagePickerWithCamera from '@/components/ImagePickerWithCamera';
import CustomSwitch from '@/components/CustomSwitch';
import { Checklist, Zone } from '@/types/Checklist';
import { FormField, TransferField } from '@/types/Field';
import { storage } from '@/storage/storage';
import { postData } from '@/services/api';
import { useModal } from '@/context/ModalContext';
import { ShowSelectTMC } from "@/components/showSelectTMC";
import { router } from "expo-router";

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
    tabType?: 'param' | 'control_points';
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
                            tabType = 'param',
                        }: TabContentEditType) => {
    const [selectedValue, setSelectedValue] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [tmcValues, setTmcValues] = useState<Record<string, { n: string; u: string; v: string }>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});
    const [radioStates, setRadioStates] = useState<
        Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>
    >({});
    const [allFields, setAllFields] = useState<Record<string, TransferField[]>>({});
    const [isFieldValid, setIsFieldValid] = useState<Record<string, boolean>>({});
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number | null>>({});
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showModal, hideModal } = useModal();

    const getStorageKey = (key: string) => `checklist_${idCheckList}_${key}`;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const storedChecklists = storage.getString(getStorageKey('checklists'));
                const storedAllFields = storage.getString(getStorageKey('allFields'));

                setChecklists(storedChecklists ? JSON.parse(storedChecklists) : []);
                setAllFields(storedAllFields ? JSON.parse(storedAllFields) : {});

                const response = await postData(`checklist/${idCheckList}`, {});
                if (response?.data) {
                    setChecklists(response.data);
                    storage.set(getStorageKey('checklists'), JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            } finally {
                setIsMounted(true);
                setIsLoading(false);
            }
        };

        loadInitialData();

        return () => {
            storage.delete(getStorageKey('checklists'));
            storage.delete(getStorageKey('allFields'));
        };
    }, [idCheckList]);

    useEffect(() => {
        if (isMounted) {
            storage.set(getStorageKey('checklists'), JSON.stringify(checklists));
            storage.set(getStorageKey('allFields'), JSON.stringify(allFields));
        }
    }, [checklists, allFields, isMounted]);

    const items = useMemo(
        () =>
            itemsTabContent[index]?.[tabType]?.map((data: any, idx: number) => ({
                label: data.name?.toString() || `Элемент ${idx}`,
                value: idx,
            })) || [],
        [itemsTabContent, index, tabType]
    );

    useEffect(() => {
        if (!tabId || items.length === 0) {
            setSelectedValue(0);
            return;
        }
        const itemIndex = itemsTabContent[index]?.[tabType]?.findIndex(
            (item: any) => item.id === tabId
        );
        if (itemIndex !== -1 && itemIndex !== selectedValue) {
            setSelectedValue(itemIndex);
            setIsInitialized(true);
        } else {
            setSelectedValue(0);
        }
    }, [tabId, index, itemsTabContent, items, tabType]);

    const transformObjectToArrayTMC = (originalObject: any) => {
        const { name, fields, id } = originalObject;
        const fieldName = fields?.p?.name?.replace(/\[[^\]]+\]$/, '') || `tmc_${id}`;
        return [{
            name: fieldName,
            label: name || 'Без названия',
            id: id || '',
            type: 'tmc',
            value: {
                n: { value: fields?.n?.value || '' },
                u: { value: fields?.u?.value || '' },
                v: { value: fields?.v?.value || '' },
            },
        }];
    };

    const transformObjectToArrayPests = (originalObject: any) => {
        const { name, id, field } = originalObject;
        return [{
            type: 'pest',
            name: field?.name || `pest_${id}`,
            value: field?.value || '',
            label: name || 'Без названия',
        }];
    };

    const transformData = (data: any[]): TransferField[] => {
        return data
            .map((field) => {
                if (field.type === 'radio') {
                    return { radio: { label: field.label, name: field.name, options: field.options.map((opt: any) => ({ ...opt })) } };
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
                if (field.type === 'select') {
                    const options = Array.isArray(field.options)
                        ? field.options
                        : Object.entries(field.options).map(([key, value]: [string, any]) => ({ ...value, value: parseInt(key) }));
                    return { select: { label: field.label, options, name: field.name } };
                }
                if (field.type === 'tmc') {
                    return {
                        tmc: {
                            label: field.label || '',
                            name: field.name,
                            value: field.value || { n: { value: '' }, u: { value: '' }, v: { value: '' } },
                        },
                    };
                }
                if (field.type === 'pest') {
                    return { pest: { label: field.label, name: field.name, value: field.value || '' } };
                }
                return null;
            })
            .filter((item): item is TransferField => item !== null);
    };

    const saveCurrentState = (value: number) => {
        setAllFields((prev) => {
            const newFields = { ...prev, [value]: field };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });
    };

    const loadFields = (value: number) => {
        if (!itemsTabContent[index]?.[tabType]?.[value]) return;

        const savedFields = allFields[value];

        if (savedFields) {
            setField(savedFields);

            const updatedInputTexts: Record<string, string> = {};
            const updatedIsEnabled: Record<string, boolean> = {};
            const updatedRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
            const updatedTmcValues: Record<string, { n: string; u: string; v: string }> = {};
            const updatedPestValues: Record<string, string> = {};
            const updatedDropdownValues: Record<string, number | null> = {};
            const updatedFieldValid: Record<string, boolean> = {};

            savedFields.forEach((item) => {
                if (item?.text) {
                    updatedInputTexts[item.text.name] = item.text.value || '';
                    updatedFieldValid[item.text.name] = tabType === 'param' ? (item.text.value?.length || 0) >= 5 : !!item.text.value;
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
                if (item?.select) {
                    const options = Array.isArray(item.select.options)
                        ? item.select.options
                        : Object.entries(item.select.options).map(([key, value]: [string, any]) => ({ ...value, value: parseInt(key) }));
                    const selected = options.find((opt: any) => opt.selected);
                    updatedDropdownValues[item.select.name] = selected ? parseInt(selected.value) : null;
                    updatedFieldValid[item.select.name] = !!selected;
                }
                if (item?.tmc) {
                    updatedTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n?.value || '',
                        u: item.tmc.value.u?.value || '',
                        v: item.tmc.value.v?.value || '',
                    };
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
        } else {
            const fields = itemsTabContent[index][tabType][value]?.fields || [];
            const TMC = tabType === 'control_points' ? itemsTabContent[index][tabType][value]?.tmc || [] : [];
            const pests = tabType === 'control_points' ? itemsTabContent[index][tabType][value]?.pests || [] : [];
            const isTmcUsed = tabType === 'control_points' && itemsTabContent[index][tabType][value]?.tmc_used === "1";

            let fieldsTMC: any[] = [];
            if (isTmcUsed) {
                if (TMC.length === 0) {
                    fieldsTMC = [{ type: 'tmc', name: 'placeholder_tmc', label: '' }];
                } else {
                    fieldsTMC = Array.isArray(TMC) ? TMC.map(transformObjectToArrayTMC).flat() : [];
                }
            }

            const fieldsPests = Array.isArray(pests) ? pests.map(transformObjectToArrayPests).flat() : [];
            const fieldItem = Array.isArray(fields) ? fields : [];
            const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

            console.log('Combined array for fields:', combinedArray);

            const transformedField = transformData(combinedArray);
            setField(transformedField);

            const initialInputTexts: Record<string, string> = {};
            const initialCheckboxStates: Record<string, boolean> = {};
            const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
            const initialTmcValues: Record<string, { n: string; u: string; v: string }> = {};
            const initialPestValues: Record<string, string> = {};
            const initialDropdownValues: Record<string, number | null> = {};
            const initialFieldValid: Record<string, boolean> = {};

            transformedField.forEach((item) => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value || '';
                    initialFieldValid[item.text.name] = tabType === 'param' ? (item.text.value?.length || 0) >= 5 : !!item.text.value;
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
                if (item?.select) {
                    const options = Array.isArray(item.select.options)
                        ? item.select.options
                        : Object.entries(item.select.options).map(([key, value]: [string, any]) => ({ ...value, value: parseInt(key) }));
                    const selected = options.find((opt: any) => opt.selected);
                    initialDropdownValues[item.select.name] = selected ? parseInt(selected.value) : null;
                    initialFieldValid[item.select.name] = !!selected;
                }
                if (item?.tmc && item.tmc.name !== 'placeholder_tmc') {
                    initialTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n?.value || '',
                        u: item.tmc.value.u?.value || '',
                        v: item.tmc.value.v?.value || '',
                    };
                    initialFieldValid[`${item.tmc.name}_n`] = !!item.tmc.value.n?.value;
                    initialFieldValid[`${item.tmc.name}_u`] = !!item.tmc.value.u?.value;
                    initialFieldValid[`${item.tmc.name}_v`] = !!item.tmc.value.v?.value;
                }
                if (item?.pest) {
                    initialPestValues[item.pest.name] = item.pest.value || '';
                    initialFieldValid[item.pest.name] = !!item.pest.value;
                }
            });

            console.log('Initial TMC values:', initialTmcValues);
            console.log('Initial Pest values:', initialPestValues);

            setInputTexts((prev) => ({ ...prev, ...initialInputTexts }));
            setIsEnabled((prev) => ({ ...prev, ...initialCheckboxStates }));
            setRadioStates((prev) => ({ ...prev, ...initialRadioStates }));
            setTmcValues((prev) => ({ ...prev, ...initialTmcValues }));
            setPestValues((prev) => ({ ...prev, ...initialPestValues }));
            setSelectedDropdownValues((prev) => ({ ...prev, ...initialDropdownValues }));
            setIsFieldValid((prev) => ({ ...prev, ...initialFieldValid }));

            setAllFields((prev) => {
                const newFields = { ...prev, [value]: transformedField };
                storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
                return newFields;
            });
        }
    };

    useEffect(() => {
        if (!isLoading) {
            loadFields(selectedValue);
        }
    }, [selectedValue, itemsTabContent, index, isLoading, tabType]);

    useEffect(() => {
        if (!isMounted) return;

        const updatedFieldValid: Record<string, boolean> = {};
        field.forEach((item) => {
            if (item?.text) {
                updatedFieldValid[item.text.name] = tabType === 'param'
                    ? (inputTexts[item.text.name]?.length || 0) >= 5
                    : !!inputTexts[item.text.name];
            }
            if (item?.select) {
                updatedFieldValid[item.select.name] = selectedDropdownValues[item.select.name] !== null;
            }
            if (item?.tmc && item.tmc.name !== 'placeholder_tmc') {
                updatedFieldValid[`${item.tmc.name}_n`] = !!tmcValues[item.tmc.name]?.n;
                updatedFieldValid[`${item.tmc.name}_u`] = !!tmcValues[item.tmc.name]?.u;
                updatedFieldValid[`${item.tmc.name}_v`] = !!tmcValues[item.tmc.name]?.v;
            }
            if (item?.pest) {
                updatedFieldValid[item.pest.name] = !!pestValues[item.pest.name];
            }
        });
        setIsFieldValid((prev) => ({ ...prev, ...updatedFieldValid }));
    }, [field, inputTexts, selectedDropdownValues, tmcValues, pestValues, isMounted, tabType]);

    const sendFieldUpdate = async (name: string, value: any, type: string) => {
        try {
            let payload;
            if (type === 'radio') {
                payload = { answer: name, value };
            } else if (type === 'text') {
                payload = { answer: name, value };
            } else if (type === 'checkbox') {
                payload = { answer: name, checked: value };
            } else if (type === 'select') {
                payload = { answer: name, value: value.toString() };
            } else if (type === 'tmc') {
                payload = { answer: name, value: JSON.stringify(value) };
            } else if (type === 'pest') {
                payload = { answer: name, value };
            }

            if (payload) {
                await postData(`checklist/${idCheckList}`, { answers: [payload] });
            }
        } catch (error) {
            console.error('Ошибка при обновлении поля:', error);
        }
    };

    const handleSelect = (value: number) => {
        saveCurrentState(selectedValue);
        setSelectedValue(value);
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
            setIsFieldValid((prev) => ({
                ...prev,
                [name]: tabType === 'param' ? text.length >= 5 : !!text,
            }));
        }
    };

    const handleBlurTextInput = (name: string) => {
        const textValue = inputTexts[name] || '';
        if (isMounted) {
            setIsFieldValid((prev) => ({
                ...prev,
                [name]: tabType === 'param' ? textValue.length >= 5 : !!textValue,
            }));
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

    const handleSelectDropdown = (value: number, name: string) => {
        setSelectedDropdownValues((prev) => ({ ...prev, [name]: value }));
        if (isMounted) {
            setIsFieldValid((prev) => ({ ...prev, [name]: true }));
        }

        const updatedField = field.map((item) => {
            if (item.select && item.select.name === name) {
                const options = Array.isArray(item.select.options)
                    ? item.select.options
                    : Object.entries(item.select.options).map(([key, value]: [string, any]) => ({ ...value, value: parseInt(key) }));
                const updatedOptions = options.map((opt: any) => ({
                    ...opt,
                    selected: parseInt(opt.value) === value,
                }));
                return { ...item, select: { ...item.select, options: updatedOptions } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        sendFieldUpdate(name, value, 'select');
    };

    const handleChangeTmc = (text: string, name: string, fieldType: 'n' | 'u' | 'v') => {
        setTmcValues((prev) => {
            const current = prev[name] || { n: '', u: '', v: '' };
            return {
                ...prev,
                [name]: { ...current, [fieldType]: text },
            };
        });
        if (isMounted) {
            setIsFieldValid((prev) => ({ ...prev, [`${name}_${fieldType}`]: !!text }));
        }
    };

    const handleBlurTmc = (name: string, fieldType: 'n' | 'u' | 'v') => {
        const tmcValue = tmcValues[name]?.[fieldType] || '';
        if (isMounted) {
            setIsFieldValid((prev) => ({ ...prev, [`${name}_${fieldType}`]: !!tmcValue }));
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
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        const tmcField = field.find((item) => item.tmc && item.tmc.name === name);
        const fullTmcValue = {
            p: tmcField?.tmc?.value.p?.value || '',
            n: tmcValues[name]?.n || '',
            u: tmcValues[name]?.u || '',
            v: tmcValues[name]?.v || '',
        };
        sendFieldUpdate(name, fullTmcValue, 'tmc');
    };

    const handleChangePest = (text: string, name: string) => {
        setPestValues((prev) => ({ ...prev, [name]: text }));
        if (isMounted) {
            setIsFieldValid((prev) => ({ ...prev, [name]: !!text }));
        }
    };

    const handleBlurPest = (name: string) => {
        const pestValue = pestValues[name] || '';
        if (isMounted) {
            setIsFieldValid((prev) => ({ ...prev, [name]: !!pestValue }));
        }

        const updatedField = field.map((item) => {
            if (item.pest && item.pest.name === name) {
                return { ...item, pest: { ...item.pest, value: pestValue } };
            }
            return item;
        });

        setField(updatedField);
        setAllFields((prev) => {
            const newFields = { ...prev, [selectedValue]: updatedField };
            storage.set(getStorageKey('allFields'), JSON.stringify(newFields));
            return newFields;
        });

        sendFieldUpdate(name, pestValue, 'pest');
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

    const handleCloseModalTMC = () => {
        hideModal();
    };

    let arrayPhotos:any[] = [];

    const photosCheck = (arrayPhotos: any[] = []) => {
        // Проверяем, есть ли вообще поля типа 'foto' в текущем field
        const hasFotoFields = field.some(item => item?.foto !== undefined);

        // Если нет полей с фото - считаем проверку пройденной (true)
        if (!hasFotoFields) return true;

        // Если есть поля с фото - проверяем, что хотя бы одно фото загружено
        return arrayPhotos.length > 0;
    };

    const handleAddModalTmc = () => {
        const controlPointId = tabType === 'control_points' ? itemsTabContent[index]?.[tabType]?.[selectedValue]?.id || '' : '';
        onReload?.();
        router.push({
            pathname: '/checklist',
            params: {
                id: '20',
                idCheckList: idCheckList,
                typeCheckList: '3',
                statusVisible: 'edit',
                tabId: zoneId,
                tabIdTMC: controlPointId,
            },
        });
        hideModal();
    };

    const handleLoadTMC = async () => {
        const controlPointId = tabType === 'control_points' ? itemsTabContent[index]?.[tabType]?.[selectedValue]?.id || '' : '';
        showModal(
            <ShowSelectTMC
                idChecklist={idCheckList}
        idTMC={controlPointId}
        onClosePress={handleCloseModalTMC}
        onAddPress={handleAddModalTmc}
        />,
        {
            overlay: { alignItems: 'center', justifyContent: 'center' },
            overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            modalContent: { paddingTop: 0, paddingRight: 0 },
        }
    );
    };

    const transferDataVisible = (data: TransferField[] = []) => {
        if (!Array.isArray(data)) data = [];
        let isNoSelected = false;
        let isRadioUnselected = false;
        let isContentHidden = false;
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest = false;
        let selectCounter = 1000; // Начальный zIndex для Dropdown

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

            console.log(`Rendering ${type}:`, componentData);

            switch (type) {
                case 'radio':
                    const isAnyOptionSelected = componentData.options.some((option) => option.selected);
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
                    backgroundColor={isAnyOptionSelected ? option.bgcolor : '#5D6377'}
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
                <Text style={styles.errorText}>
                {tabType === 'param' ? 'Минимум 5 символов' : 'Поле обязательно'}
                </Text>
            )}
            </View>
        );
        case 'foto':

            arrayPhotos = componentData.value || [];

            return (
                <ImagePickerWithCamera
                    key={`image-${idx}`}
                    taskId={idTask}
                    initialImages={componentData.value || []}
                    path={`checklist/${idCheckList}/${componentData.name}`}
                    name={componentData.name}
                    onImageUploaded={(newImage) => handleImageUploaded(componentData.name, newImage)}
                    onImageRemoved={(removedImage) => handleImageRemoved(componentData.name, removedImage)}
                    viewGallery={true}
                    borderColor={photosCheck(componentData.value) ? '#DADADA' : 'red'}
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
        case 'select':
            const selectedValue = selectedDropdownValues[componentData.name] ?? null;
            const options = Array.isArray(componentData.options)
                ? componentData.options.map((opt: any) => ({
                    label: opt.value,
                    value: parseInt(opt.value),
                    color: opt.color || '#000000',
                }))
                : Object.entries(componentData.options).map(([key, value]: [string, any]) => ({
                    label: value.value,
                    value: parseInt(key),
                    color: value.color || '#000000',
                }));
            const selectedOption = options.find((option) => option.value === selectedValue);
            const selectedColor = selectedOption ? selectedOption.color : '#000000';

            return (
                <View key={`select-${idx}`} style={[styles.selectContainer]}>
            <Text style={[styles.label, { color: '#1C1F37' }]}>{componentData.label}</Text>
            <Dropdown
            style={[
                    styles.dropdownTMC,
            { width: '40%', zIndex: selectCounter-- },
            isMounted && selectedValue === null && { borderColor: 'red', borderWidth: 1 },
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
        case 'tmc':
            return (
                <View key={`tmc-${idx}`}>
            {!isHeaderVisibleTmc && (
                <>
                    <View style={styles.tmcTitleContainer}>
                <Text style={styles.tmcTitle}>Наличие препаратов в ТК</Text>
            <Button
                TouchableComponent={TouchableOpacity}
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
                        isMounted &&
                    !isFieldValid[`${componentData.name}_n`] && {
                        borderColor: 'red',
                        borderWidth: 1,
                    },
            ]}
                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'n')}
                value={tmcValues[componentData.name]?.n || ''}
                onBlur={() => handleBlurTmc(componentData.name, 'n')}
                keyboardType="numeric"
                />
                </View>
                <View>
                <TextInput
                    style={[
                            styles.tmcTextInput,
                        isMounted &&
                    !isFieldValid[`${componentData.name}_u`] && {
                        borderColor: 'red',
                        borderWidth: 1,
                    },
            ]}
                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'u')}
                value={tmcValues[componentData.name]?.u || ''}
                onBlur={() => handleBlurTmc(componentData.name, 'u')}
                keyboardType="numeric"
                />
                </View>
                <View>
                <TextInput
                    style={[
                            styles.tmcTextInput,
                        isMounted &&
                    !isFieldValid[`${componentData.name}_v`] && {
                        borderColor: 'red',
                        borderWidth: 1,
                    },
            ]}
                onChangeText={(text) => handleChangeTmc(text, componentData.name, 'v')}
                value={tmcValues[componentData.name]?.v || ''}
                onBlur={() => handleBlurTmc(componentData.name, 'v')}
                keyboardType="numeric"
                    />
                    </View>
                    </View>
                    </View>
            )}
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
                />
                </View>
                </View>
                </View>
                </View>
        );
        default:
            return null;
        }
        });

        return { renderedComponents, isContentHidden };
    };

    const areAllFieldsValid = (isContentHidden: boolean) => {
        if (!isMounted || isContentHidden) return true;

        const requiredFields = field.filter((item) => item.text || item.select || item.tmc || item.pest);
        return requiredFields.every((item) => {
            if (item.text) {
                return isFieldValid[item.text.name];
            }
            if (item.select) {
                return isFieldValid[item.select.name];
            }
            if (item.tmc && item.tmc.name !== 'placeholder_tmc') {
                return (
                    isFieldValid[`${item.tmc.name}_n`] &&
                    isFieldValid[`${item.tmc.name}_u`] &&
                    isFieldValid[`${item.tmc.name}_v`]
                );
            }
            if (item.pest) {
                return isFieldValid[item.pest.name];
            }
            return true;
        });
    };

    const handleNext = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) return;

        saveCurrentState(selectedValue);

        if (selectedValue < items.length - 1) {
            setSelectedValue((prev) => prev + 1);
        } else if (!isLastTab) {
            onNextTab?.();
        }
    };

    const handlePrevious = async () => {
        const { isContentHidden } = transferDataVisible(field);
        if (!areAllFieldsValid(isContentHidden)) return;

        saveCurrentState(selectedValue);

        if (selectedValue > 0) {
            setSelectedValue((prev) => prev - 1);
        } else if (!isFirstTab) {
            onPreviousTab?.();
        }
    };

    const { isContentHidden } = transferDataVisible(field);
    const isNavigationEnabled = areAllFieldsValid(isContentHidden);

    return (
        <View style={styles.tab1Container}>
            {isLoading ? (
                    <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                    </View>) : items.length > 0 ? (
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
                                        enabled={photosCheck(arrayPhotos) && isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                                        touchable={photosCheck(arrayPhotos) && isNavigationEnabled && (selectedValue > 0 || !isFirstTab)}
                                    />
                                    <TextButton
                                        text="Далее"
                                        width={125}
                                        height={40}
                                        textSize={14}
                                        textColor="#FFFFFF"
                                        backgroundColor="#017EFA"
                                        onPress={handleNext}
                                        enabled={photosCheck(arrayPhotos) && isNavigationEnabled && (selectedValue < items.length - 1 || !isLastTab)}
                                        touchable={photosCheck(arrayPhotos) && isNavigationEnabled && (selectedValue < items.length - 1 || !isLastTab)}
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
});

export default memo(TabContentEdit);
