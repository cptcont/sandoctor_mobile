import React, { useEffect, useState,memo } from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView,} from 'react-native';
import Dropdown from '@/components/Dropdown';
import { Checklist, Zone, Checklists} from "@/types/Checklist";
import { FormField, TransferField } from "@/types/Field"
import Footer from "@/components/Footer";
import {TextButton} from "@/components/TextButton";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import {usePopup} from "@/context/PopupContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,

} from '@/services/api'
import CustomSwitch from "@/components/CustomSwitch";

type Tab3ContentEditType = {
    id: string | string[];
    checklistSort?: Checklist;
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    idCheckList?: string;
};



const Tab3ContentEdit = ({
                             id,
                             checklistSort,
                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             idCheckList
                         }: Tab3ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [tmcValues, setTmcValues] = useState<Record<string, string>>({});
    const [pestValues, setPestValues] = useState<Record<string, string>>({});
    const [radioStates, setRadioStates] = useState<Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>>({});
    const [allFields, setAllFields] = useState({});
    const [radioStatesStatus, setRadioStatesStatus] = useState<boolean>(true);
    const [selectedDropdownValues, setSelectedDropdownValues] = useState<Record<string, number>>({});

    let checkList:Checklist = {}

    const checkListData =  (checklists || []).filter((checklist: Checklist) => {return checklist.id === id ;}).flat()[0];
    if (checkListData) {
        const { id, name, progress, type, zones } = checkListData;
        checkList = { id, name, progress, type, zones };
    }
    //console.log('checkListData', checkList);
    const itemsTabContent:Zone[] = checkList.zones;
    console.log('checkListData', checkListData);
    console.log('itemsTabContent', itemsTabContent);
    const items = itemsTabContent[index].control_points.map((data: any, index: any) => (
        { label: data.name.toString(), value: index}
    ));

    const transformObjectToArrayTMC = (originalObject:object) => {
        const { name, fields } = originalObject;

        // Получаем имя из первого поля (например, "p")
        const fieldName = fields.p.name;

        // Удаляем последнюю часть (например, "[p]") из имени
        const baseName = fieldName.replace(/\[[^\]]+\]$/, "");

        const resultArray = [
            {
                name: baseName, // Преобразованное имя
                label: name, // Название из объекта
                type: 'tmc',
                value: fields, // Вложенный объект с полями
            },
        ];

        return resultArray;
    };
    const transformObjectToArrayPests = (originalObject:object) => {
        const { name, id, field } = originalObject;

        return [
            {
                type: "pest", // Заданный тип
                name: field.name, // Имя из поля field
                value: field.value, // Значение из поля field
                label: name, // Название из объекта
            },
        ];
    };
    useEffect(() => {
        // Проверка на существование itemsTabContent[index]?.param[0]?.fields
        const fields = itemsTabContent[index]?.control_points[0]?.fields;
        const TMC = itemsTabContent[index]?.control_points[0]?.tmc;
        const pests = itemsTabContent[index]?.control_points[0]?.pests;

        const fieldsTMC = Array.isArray(TMC) ? TMC.map((data: any,) => (transformObjectToArrayTMC(data))).flat():[];
        const fieldsPests = Array.isArray(pests) ? pests.map((data: any,) => (transformObjectToArrayPests(data))).flat(): [];
        const fieldItem = Array.isArray(fields) ? fields.map((field:any) => field) : [];
        const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

        const transformedField = transformData(combinedArray);

        //console.log('transformedField', transformedField);

        const initialFields = {};
        //if (Array.isArray(itemsTabContent[index]?.control_points)) {
        //    itemsTabContent[index].control_points.forEach((param:any, idx:number) => {
        //        if (Array.isArray(param.fields)) {
        //            const fieldItem = param.fields.map((field:any) => field);
        //            initialFields[idx] = transformData(combinedArray);
        //        }
        //    });
        //}
        initialFields['0'] = transformData(combinedArray);
        console.log('initialFields', initialFields);
        setAllFields(initialFields);
        setField(initialFields[0]);

        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTmcValues: Record<string, string> = {};
        const initialPestValues: Record<string, string> = {};

        if (Array.isArray(transformedField)) {
            transformedField.forEach(item => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.yes,
                        no: item.radio.no,
                        isContentVisible: item.radio.yes,
                    };
                    console.log('RADIO', item.radio.no);
                    setRadioStatesStatus(item.radio.yes);
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) {
                        initialDropdownValues[item.select.name] = parseInt(selectedOption);
                    }
                }
                if (item?.tmc) {
                    initialTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n.value,
                        u: item.tmc.value.u.value,
                        v: item.tmc.value.v.value,
                    };
                }
                if (item?.pest) {
                    initialPestValues[item.pest.name] = item.pest.value; // Пример для pest
                }

            });
        }
        console.log("initialPestValues", initialPestValues)

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setTmcValues(initialTmcValues);
        setPestValues(initialPestValues);
        return () => {
            setAllFields({});
        };
    }, []);

    useEffect(() => {
        let nameRadio = '';
        if (Array.isArray(field)) {
            field.forEach(item => {
                if (item.radio) {
                    nameRadio = item.radio.name;
                }
            });
        }
        if (radioStates[nameRadio]) {
            setRadioStatesStatus(radioStates[nameRadio].isContentVisible);
        }
    }, [radioStates]);

    useEffect(() => {
        setAllFields(prev => ({
            ...prev,
            [selectedValue]: field
        }));
    }, [field]);

    useEffect(() => {
        //console.log ('useEffect field, selectedValue, index, itemsTabContent')
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};
        const initialDropdownValues: Record<string, number> = {};
        const initialTmcValues: Record<string, string> = {};
        const initialPestValues: Record<string, string> = {};

        if (Array.isArray(field)) {
            field.forEach(item => {
                if (item?.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                }
                if (item?.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
                if (item?.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.yes,
                        no: item.radio.no,
                        isContentVisible: item.radio.yes,
                    };
                    console.log('RADIO', item.radio.no);
                }
                if (item?.select) {
                    const selectedOption = Object.keys(item.select.options).find(key => item.select.options[key].selected);
                    if (selectedOption) {
                        initialDropdownValues[item.select.name] = parseInt(selectedOption);
                    }
                }
                if (item?.tmc) {
                    initialTmcValues[item.tmc.name] = {
                        n: item.tmc.value.n.value,
                        u: item.tmc.value.u.value,
                        v: item.tmc.value.v.value,
                    };
                }
                if (item?.pest) {
                    initialPestValues[item.pest.name] = item.pest.value; // Пример для pest
                }

            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);
        setSelectedDropdownValues(initialDropdownValues);
        setTmcValues(initialTmcValues);
        setPestValues(initialPestValues);

    }, [allFields, selectedValue, index, itemsTabContent]);


    const transformData= (data:TransferField[]) => data.map(data => {
        if (data.type === "radio" && data.type) {
            return { radio: {
                    label: data.label,
                    yes: data.options['1'].selected,
                    no: data.options['0'].selected,
                    name: data.name,
                }}
        }
        if (data.type === "text" && data.type) {
            return { text: {
                    label: data.label,
                    value: data.value,
                    name: data.name,
                }
            }
        }
        if (data.type === "foto" && data.type) {
            return { foto: {
                    value: data.value,
                    name: data.name,
                }
            }
        }
        if (data.type === "checkbox" && data.type) {
            return {checkbox: {
                    label: data.label,
                    checked: data.checked,
                    name: data.name,
                }
            }
        }
        if (data.type === "select" && data.type) {
            return {select: {
                    label: data.label,
                    options: data.options,
                    name: data.name,
                }
            }
        }
        if (data.type === "tmc" && data.type) {
            return {tmc: {
                    label: data.label,
                    name: data.name,
                    value: data.value,
                }

            }
        }
        if (data.type === "pest" && data.type) {
            return {pest: {
                    label: data.label,
                    name: data.name,
                    value: data.value,
                }
            }
        }
    })



    const transferDataVisible = (data = [{}]) => {
        // Проверка на пустой объект, отсутствие данных или не массив
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }
        let isHeaderVisibleTmc = false;
        let isHeaderVisiblePest  = false;
        let selectCounter = 0;

        return data.map((item, index) => {
            if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
                return null;
            }

            const type = Object.keys(item)[0]; // Получаем тип компонента (radio, text, foto)
            const componentData = item[type]; // Получаем данные для компонента

            if (!componentData) {
                return null;
            }
            if (type !== 'radio' && (!radioStatesStatus)) {
                return null;
            }

            switch (type) {
                case 'radio':
                    return (
                        <View key={`radio-${index}`} style={[styles.text, { marginBottom: 17 }]}>
                            <Text style={[styles.title, { color: '#1C1F37'}]}>{`${componentData.label}`}</Text>
                            <View style={styles.buttonContainer}>
                                <TextButton
                                    text={'Да'}
                                    width={142}
                                    height={29}
                                    textSize={14}
                                    textColor={'#FFFFFF'}
                                    backgroundColor={'#FD1F9B'}
                                    enabled={radioStates[componentData.name]?.yes}
                                    onPress={() => handlePressButtonYes(componentData.name)}
                                />
                                <TextButton
                                    text={'Нет'}
                                    width={142}
                                    height={29}
                                    textSize={14}
                                    textColor={'#FFFFFF'}
                                    backgroundColor={'#30DA88'}
                                    enabled={radioStates[componentData.name]?.no}
                                    onPress={() => handlePressButtonNo(componentData.name)}
                                />
                            </View>
                        </View>
                    );

                case 'text':
                    //const inputText = componentData.value;
                    return (
                        <View
                            key={`text-${index}`}
                            style={[styles.text, { marginBottom: 17 }]}
                        >
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
                            <CustomSwitch value={isEnabled[componentData.name]} onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)} />
                        </View>
                    )
                case 'select':
                    const selectedValue = selectedDropdownValues[componentData.name] || 0;
                    const options = Object.entries(componentData.options).map(([key, value]) => ({
                        label: value.value,
                        value: parseInt(key),
                        color: value.color // Добавляем цвет в объект options
                    }));

                    // Находим выбранный элемент
                    const selectedOption = options.find(option => option.value === selectedValue);

                    // Извлекаем цвет выбранного элемента
                    const selectedColor = selectedOption ? selectedOption.color : '#000000'; // По умолчанию черный цвет, если элемент не найден

                    selectCounter++;

                    return (
                        <View key={`select-${index}`} style={[styles.selectContainer, { }]}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <View style={{width:'40%', zIndex: 1000-selectCounter}}>
                            <Dropdown
                                key={selectedValue}
                                items={options}
                                defaultValue={selectedValue}
                                onSelect={(value) => handleSelectDropdown(value, componentData.name)}
                                bdColor={'#FFFFFF'}
                                bgColor={'#FFFFFF'}
                                textColor={selectedColor}
                                zIndex={1000 + selectCounter}
                                zIndexInverse={2000 - selectCounter}
                            />
                            </View>
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
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                                            <Text style={styles.tmcHeaderText}>{'В наличии'}</Text>
                                            <Text style={styles.tmcHeaderText}>{'Утилизировано'}</Text>
                                            <Text style={styles.tmcHeaderText}>{'Внесено'}</Text>
                                        </View>
                                    </View>

                                </>
                            )}
                            {!isHeaderVisibleTmc && (isHeaderVisibleTmc = true)}
                        <View key={`tmc-${index}`} style={[styles.tmcContainer, { marginBottom: 17, alignItems:'center' }]}>

                            <Text style={[styles.tmcText, { width:'50%' }]}>{`${componentData.label}`}</Text>
                            <View style={{width: '44%', flexDirection: 'row', justifyContent: 'space-between',marginRight: 12}}>
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
                    )
                case 'pest':
                    return (
                        <>
                            {!isHeaderVisiblePest && (
                                <>
                                    <Text style={styles.tmcTitle}>{'Вредители'}</Text>
                                    <View style={styles.tmcHeaderContainer}>
                                        <Text style={styles.tmcHeaderText}>{'Наименование'}</Text>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                                            <Text style={styles.tmcHeaderText}>{'Обнаружено'}</Text>
                                        </View>
                                    </View>

                                </>
                            )}
                            {!isHeaderVisiblePest && (isHeaderVisiblePest = true)}
                            <View key={`tmc-${index}`} style={[styles.tmcContainer, { marginBottom: 17, alignItems:'center' }]}>

                                <Text style={[styles.tmcText, { width:'50%' }]}>{`${componentData.label}`}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between',marginRight: 20}}>
                                    <TextInput
                                        style={styles.tmcTextInput}
                                        onChangeText={(text) => handleChangePest(text, componentData.name)}
                                        value={pestValues[componentData.name]}
                                        onBlur={() => handleBlurPest(componentData.name)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </>
                    )

                default:
                    return null;
            }
        });
    };

    const handleSelect = (value: string | number | null) => {
        if (value !== null) {
            setSelectedValue(value);
            const fields = itemsTabContent[index]?.control_points[value]?.fields;
            const TMC = itemsTabContent[index]?.control_points[value]?.tmc;
            const pests = itemsTabContent[index]?.control_points[value]?.pests;

            const fieldsTMC = Array.isArray(TMC) ? TMC.map((data: any,) => (transformObjectToArrayTMC(data))).flat():[];
            const fieldsPests = Array.isArray(pests) ? pests.map((data: any,) => (transformObjectToArrayPests(data))).flat(): [];
            const fieldItem = Array.isArray(fields) ? fields.map((field:any) => field) : [];
            const combinedArray = [...fieldItem, ...fieldsTMC, ...fieldsPests];

            const transformedField = transformData(combinedArray);
            console.log('value', value);
            console.log('allFields', allFields);
            console.log('allFields[value]', allFields[value]);
            console.log('selectedValue', selectedValue);

            if (allFields[value]) {
                setField(allFields[value]);
            } else {
               // setAllFields(prev => ({
               //     ...prev,
               //     [value]:transformedField , // Сохраняем текущий field перед переходом
               // }));
                setField(transformedField);
            }
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
            answers: [
                { answer: name, value: value },
            ],
        });
    };

    const handleChangeCheckBox = async (checked:boolean, name:string) => {
        setIsEnabled(prev => ({ ...prev, [name]: checked }));

        const updatedField = field.map(item => {
            if (item.checkbox && item.checkbox.name === name) {
                return { ...item, checkbox: { ...item.checkbox, checked: checked } };
            }
            return item;
        });
        setField(updatedField);

        const hasCheckBox = field.find(item => item.checkbox && item.checkbox.name === name);
        const response = await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasCheckBox.checkbox.name, checked: checked },
            ],
        });
    }

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

    const handleChangeTmc = async (text: string, name: string, fields: 'n' | 'u' | 'v') => {
        // Обновляем состояние для конкретного поля (n, u, v)
        setTmcValues(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [fields]: text, // Обновляем только одно поле
            },
        }));

        // Обновляем поле в состоянии field
        const updatedField = field.map(item => {
            if (item.tmc && item.tmc.name === name) {
                return {
                    ...item,
                    tmc: {
                        ...item.tmc,
                        value: {
                            ...item.tmc.value,
                            [fields]: { ...item.tmc.value[fields], value: text }, // Обновляем значение поля
                        },
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        // Отправляем данные на сервер
        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: text },
            ],
        });
    };

    const handleChangePest = async (text: string, name: string) => {
        setInputTexts((prev) => ({ ...prev, [name]: text }));

        const updatedField = field.map((item) => {
            if (item.pest && item.pest.name === name) {
                return { ...item, pest: { ...item.pest, value: text } };
            }
            return item;
        });

        setField(updatedField);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: text },
            ],
        });
    };



    const handlePressButtonYes = async (name: string) => {
        setRadioStates(prev => ({
            ...prev,
            [name]: { yes: true, no: false, isContentVisible: true }, // Показываем контент
        }));

        const updatedField = field.map(item => {
            if (item.radio && item.radio.name === name) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        yes: true,
                        no: false,
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: true },
            ],
        });

    }

    const handlePressButtonNo = async (name: string) => {
        setRadioStates(prev => ({
            ...prev,
            [name]: { yes: false, no: true, isContentVisible: false }, // Скрываем контент
        }));

        const updatedField = field.map(item => {
            if (item.radio && item.radio.name === name) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        yes: false,
                        no: true,
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: name, value: false },
            ],
        });
    }

    const handleNext = async () => {
        if (selectedValue < items.length - 1) {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists')
            setChecklists(getDataFromStorage('checklists'));
            const nextIndex = selectedValue + 1;
            setSelectedValue(nextIndex);
            handleSelect(nextIndex);
        } else {
            onNextTab?.();
        }
    }

    const handlePrevious = async () => {

        if (selectedValue > 0) {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists')
            setChecklists(getDataFromStorage('checklists'));

            const prevIndex = selectedValue - 1;
            setSelectedValue(prevIndex);
            handleSelect(prevIndex);

        } else {

            onPreviousTab?.();

        }
    }

    const handleBlurTextInput = async (name: string) => {
        const hasText = field.find(item => item.text && item.text.name === name);

        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasText.text.name, value: hasText.text.value },
            ],
        });

        console.log('hasText', hasText.text.value);
    }

    const handleBlurTmc = async (name: string, fields: 'n' | 'u' | 'v') => {
        // Получаем текущее значение из состояния
        //const currentValue = tmcValues[name]?.[field] || '';
        //console.log(`TMC Field Updated`);
        //console.log(`TMC name ${name} Field ${fields}`);
        // Находим соответствующий элемент в field
        const tmcField = field.find(item => item.tmc && item.tmc.name === name);
        //console.log(`TMC tmcField ${tmcField}`);
        if (tmcField) {
            // Извлекаем имя из структуры value (например, n.name)
            //const fieldName = tmcField.tmc.value;
            //const value = tmcField.tmc.value[fields].value;
            //console.log('value', value);
            //console.log('fieldName', fieldName);

            const req = JSON.stringify ({
                    p: tmcField.tmc.value['p'].value,
                    v: tmcField.tmc.value['v'].value,
                    u: tmcField.tmc.value['u'].value,
                    n: tmcField.tmc.value['n'].value,
                    })
            console.log('req', req);


            // Отправляем данные на сервер
           const response = await postData(`checklist/${idCheckList}`, {
                answers: [
                    { answer: name, value: req },
                ],
            });

            console.log(`TMC Field Updated: ${response} {answer: ${name}, value: ${req}`);
        }

    };

    const handleBlurPest = async (name: string) => {
        // Получаем текущее значение из состояния
        //const currentValue = pestValues[name] || '';

        // Находим соответствующий элемент в field
        const pestField = field.find(item => item.pest && item.pest.name === name);

        if (pestField) {
            // Извлекаем имя из структуры
            const value = pestField.pest.value;

            // Отправляем данные на сервер
            await postData(`checklist/${idCheckList}`, {
                answers: [
                    { answer: name, value: value },
                ],
            });

            //console.log(`Pest Field Updated: ${fieldName} = ${currentValue}`);
        }
    };



    return (
        <>
            <View style={styles.tab1Container}>
                {items.length > 0 ? (<>
                <View style={styles.text}>
                    <Text style={styles.title}>{'Параметр'}</Text>
                </View>
                    {items.length > 0 && (
                    <Dropdown
                        key={selectedValue}
                        items={items}
                        defaultValue={selectedValue}
                        onSelect={handleSelect}
                    />
                    )}
                <KeyboardAwareScrollView>
                    {transferDataVisible(field)}
                </KeyboardAwareScrollView>
                </>) : (
            <Text style={styles.errorText}>Данные отсутствуют</Text> // Сообщение об ошибке
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
                    />
                    <TextButton
                        text={'Далее'}
                        width={125}
                        height={40}
                        textSize={14}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        onPress={handleNext}
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
        marginBottom:12,
        paddingBottom:10,
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
        color: 'red', // Цвет текста
        fontSize: 14, // Размер текста
        textAlign: 'center', // Выравнивание текста
        marginTop: 10, // Отступ сверху
    },


});

export default Tab3ContentEdit;
