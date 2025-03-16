import React, { useEffect, useState,memo } from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView,} from 'react-native';
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

} from '@/services/api'
import CustomSwitch from "@/components/CustomSwitch";

type Tab1ContentEditType = {
    id: string | string[];
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    idCheckList?: string;
};

const Tab1ContentEdit = ({
                             id,
                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             idCheckList
                         }: Tab1ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);
    const { showPopup } = usePopup();
    const [field, setField] = useState<TransferField[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});
    const [radioStates, setRadioStates] = useState<Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }>>({});
    const [allFields, setAllFields] = useState({});
    const [radioStatesStatus, setRadioStatesStatus] = useState<boolean>(true);

    const checkList =  (checklists || []).filter((checklist: Checklist) => {return checklist.id === id;}).flat()[0];
    const itemsTabContent:Zone[] = checkList.zones;
    const items = itemsTabContent[index].param.map((data: any, index: any) => (
        { label: data.name.toString(), value: index}
    ));

    useEffect(() => {
        // Проверка на существование itemsTabContent[index]?.param[0]?.fields
        const fields = itemsTabContent[index]?.param[0]?.fields;
        const fieldItem = Array.isArray(fields) ? fields.map((field:any) => field) : [];

        const transformedField = transformData(fieldItem);
//        console.log(transformedField);
        const initialFields = {};
        if (Array.isArray(itemsTabContent[index]?.param)) {
            itemsTabContent[index].param.forEach((param:any, idx:number) => {
                if (Array.isArray(param.fields)) {
                    const fieldItem = param.fields.map((field:any) => field);
                    initialFields[idx] = transformData(fieldItem);
                }
            });
        }

        setAllFields(initialFields);
        setField(initialFields[0]);

        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};

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
                    setRadioStatesStatus(item.radio.yes);
                }
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);

    }, []);

    useEffect(() => {
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
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};
        const initialRadioStates: Record<string, { yes: boolean; no: boolean; isContentVisible: boolean }> = {};

        if (Array.isArray(field)) {
            field.forEach(item => {
                if (item.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                }
                if (item.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
                if (item.radio) {
                    initialRadioStates[item.radio.name] = {
                        yes: item.radio.yes,
                        no: item.radio.no,
                        isContentVisible: item.radio.yes,
                    };
                }
            });
        }

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);
        setRadioStates(initialRadioStates);

    }, [field, selectedValue, index, itemsTabContent]);

    const handleSelect = (value: number | null) => {
        if (value !== null) {
            setSelectedValue(value);
            const fieldItem = itemsTabContent[index].param[value].fields.map((field: Field) => field);
            const transformedField = transformData(fieldItem);

            if (allFields[value]) {
                setField(allFields[value]);
            } else {
                setAllFields(prev => ({
                    ...prev,
                    [selectedValue]:transformedField , // Сохраняем текущий field перед переходом
                }));
                setField(transformedField);
            }
        }
    };

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
    })

    const transferDataVisible = (data = [{}]) => {
        // Проверка на пустой объект, отсутствие данных или не массив
        if (!data || typeof data !== 'object' || !Array.isArray(data) || data.length === 0) {
            data = [{}];
        }
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
                                    enabled={radioStates[componentData.name]?.yes || false}
                                    onPress={() => handlePressButtonYes(componentData.name)}
                                />
                                <TextButton
                                    text={'Нет'}
                                    width={142}
                                    height={29}
                                    textSize={14}
                                    textColor={'#FFFFFF'}
                                    backgroundColor={'#30DA88'}
                                    enabled={radioStates[componentData.name]?.no || false}
                                    onPress={() => handlePressButtonNo(componentData.name)}
                                />
                            </View>
                        </View>
                    );

                case 'text':
                    //const inputText = componentData.value;
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
                            <CustomSwitch value={isEnabled[componentData.name]} onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)} />
                        </View>
                    )
                case 'select':

                default:
                    return null;
            }
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
    }

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

    const handlePrevious = () => {

        if (selectedValue > 0) {
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

//        console.log('hasText', hasText.text.value);
    }

    return (
        <>
            <View style={styles.tab1Container}>
                <View style={styles.text}>
                    <Text style={styles.title}>{'Параметр'}</Text>
                </View>
                <View style={{ marginBottom: 23 }}>
                    <Dropdown
                        key={selectedValue}
                        items={items}
                        defaultValue={selectedValue}
                        onSelect={handleSelect}
                    />
                </View>
                <KeyboardAwareScrollView>
                    {transferDataVisible(field)}
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
    }
});

export default Tab1ContentEdit;
