import React, { useEffect, useState,memo } from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView,} from 'react-native';
import Dropdown from '@/components/Dropdown';
import { Checklist, Zone, Field, Checklists} from "@/types/Checklist";
import Footer from "@/components/Footer";
import {TextButton} from "@/components/TextButton";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import {usePopup} from "@/context/PopupContext";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,
    updateDataFromStorage
} from '@/services/api'
import CustomSwitch from "@/components/CustomSwitch";

type Tab2ContentEditType = {
    id: string | string[];
    index: number;
    itemsTabContent?: Zone[];
    idTask?: string;
    onNextTab?: () => void;
    onPreviousTab?: () => void;
    idCheckList?: string;
};

interface Field {}

const Tab2ContentEdit = ({
                             id,

                             index,
                             idTask = '0',
                             onNextTab,
                             onPreviousTab,
                             idCheckList
                         }: Tab2ContentEditType) => {
    const [selectedValue, setSelectedValue] = useState(0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleYes, setVisibleYes] = useState<boolean>(false);
    const [visibleNo, setVisibleNo] = useState<boolean>(true);
    const [checkBoxChecked, setCheckBoxChecked] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>('');
    const { showPopup } = usePopup();
    const [field, setField] = useState([]);
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    //const [inputTexts, setInputTexts] = useState<string[]>([]);
    //const [isEnabled, setIsEnabled] = useState<boolean[]>([true]);
    const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
    const [isEnabled, setIsEnabled] = useState<Record<string, boolean>>({});

    //const [itemsTabContent,setItemsTabContent] = useState<Zones[]>([]);
    //const [items, setItems] = useState([]);

    const checkList =  (checklists || []).filter((checklist: Checklist) => {return checklist.id === id;}).flat()[0];
    const itemsTabContent:Zone[] = checkList.zones;
    const dropDownIndex = itemsTabContent[index].param.length - 1;
    const items = itemsTabContent[index].param.map((data: any, index: any) => (
        { label: data.name.toString(), value: index}
    ));



    //console.log ('itemsTabContent', itemsTabContent)
    //console.log ('checkList', checkList)

    useEffect(() => {

        const fieldItem = Array.isArray(itemsTabContent[index]?.param[0]?.fields)
            ? itemsTabContent[index].param[0].fields.map((field: Field) => field)
            : [];

        const transformedField = transformData(fieldItem);
        setField(transformedField);
        // Инициализация inputTexts и isEnabled
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};

        transformedField.forEach(item => {
            if (item.text) {
                initialInputTexts[item.text.name] = item.text.value;
                //console.log(initialInputTexts)
            }
            if (item.checkbox) {
                initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
            }
        });

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);

        // Остальная логика
        const hasRadio = transformedField.find(item => item.radio !== undefined);
        if (hasRadio) {
            setVisibleYes(hasRadio.radio.yes);
            setVisibleNo(hasRadio.radio.no);
        }
        //console.log('useEffect Start Field', transformedField);
    }, []);


    //useEffect(() => {
    //    const hasRadio = field.find(item => item.radio !== undefined);
    //    const hasCheckBox = field.find(item => item.checkbox !== undefined);
    //    if (hasRadio) {
    //        setVisibleYes(hasRadio.radio.yes)
    //        setVisibleNo(hasRadio.radio.no)
    //    }
    //    if (hasCheckBox) {
    //        setCheckBoxChecked(hasCheckBox.checked)
    //    }
    //console.log('useEffect Field', field);
    //console.log('useEffect setVisibleYes', visibleYes);
    //console.log('useEffect setVisibleNo', visibleNo);

    //}, [selectedValue, index, itemsTabContent]);

    useEffect(() => {
        const initialInputTexts: Record<string, string> = {};
        const initialCheckboxStates: Record<string, boolean> = {};

        field.forEach(item => {
            if (item.text) {
                initialInputTexts[item.text.name] = item.text.value;
                //console.log(initialInputTexts)
            }
            if (item.checkbox) {
                initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
            }
        });

        setInputTexts(initialInputTexts);
        setIsEnabled(initialCheckboxStates);

        // Остальная логика
        const hasRadio = field.find(item => item.radio !== undefined);
        if (hasRadio) {
            setVisibleYes(hasRadio.radio.yes);
            setVisibleNo(hasRadio.radio.no);
        }
    }, [field, selectedValue, index, itemsTabContent]);

    useEffect(() => {
        const updatedCheckList = checklists.find((checklist: Checklist) => checklist.id === id);
        if (updatedCheckList) {
            const updatedItemsTabContent = updatedCheckList.zones;
            const updatedFieldItem = Array.isArray(updatedItemsTabContent[index]?.param[0]?.fields)
                ? updatedItemsTabContent[index].param[0].fields.map((field: Field) => field)
                : [];
            //const updatedFieldItem = updatedItemsTabContent[index].param[selectedValue].fields.map((field: Field) => field);
            const transformedField = transformData(updatedFieldItem);
            setField(transformedField);

            // Инициализация inputTexts и isEnabled
            const initialInputTexts: Record<string, string> = {};
            const initialCheckboxStates: Record<string, boolean> = {};

            transformedField.forEach(item => {
                if (item.text) {
                    initialInputTexts[item.text.name] = item.text.value;
                    //console.log(initialInputTexts)
                }
                if (item.checkbox) {
                    initialCheckboxStates[item.checkbox.name] = item.checkbox.checked;
                }
            });

            setInputTexts(initialInputTexts);
            setIsEnabled(initialCheckboxStates);

            // Остальная логика
            const hasRadio = transformedField.find(item => item.radio !== undefined);
            if (hasRadio) {
                setVisibleYes(hasRadio.radio.yes);
                setVisibleNo(hasRadio.radio.no);
            }
        }
    }, [checklists]);



    const handleSelect = (value: number | null) => {
        if (value !== null) {
            setSelectedValue(value);
            const fieldItem = itemsTabContent[index].param[value].fields.map((field: Field) => field)
            const transformedField = transformData(fieldItem);
            setField(transformedField);
            //console.log('handleSelectField', field);

        }
    };

    const transformData= (data) => data.map(data => {
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


    const transferDataVisible = (data, visible: boolean) => {

        return data.map((item, index) => {
            const type = Object.keys(item)[0]; // Получаем тип компонента (radio, text, foto)
            const componentData = item[type]; // Получаем данные для компонента

            if (!visible && type !== 'radio') {
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
                                    enabled={visibleYes}
                                    onPress={handlePressButtonYes}
                                />
                                <TextButton
                                    text={'Нет'}
                                    width={142}
                                    height={29}
                                    textSize={14}
                                    textColor={'#FFFFFF'}
                                    backgroundColor={'#30DA88'}
                                    enabled={visibleNo}
                                    onPress={handlePressButtonNo}
                                />
                            </View>
                        </View>
                    );

                case 'text':
                    //const inputText = componentData.value;
                    return (
                        <KeyboardAwareScrollView
                            key={`text-${index}`}
                            style={[styles.text, { marginBottom: 17 }]}
                            enableOnAndroid={true}
                            extraScrollHeight={100}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ flexGrow: 1 }}
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
                        </KeyboardAwareScrollView>
                    );

                case 'foto':
                    const arrayPhoto = componentData.value || [];
                    return (
                        <ImagePickerWithCamera
                            key={`image-${index}`}
                            taskId={idTask}
                            initialImages={arrayPhoto}
                            path={`checklist/${idCheckList}/${componentData.name}`}
                        />
                    );
                case 'checkbox':
                    return (
                        <View key={`checkbox-${index}`} style={styles.containerCheckBox}>
                            <Text style={[styles.title, { color: '#1C1F37' }]}>{`${componentData.label}`}</Text>
                            <CustomSwitch value={isEnabled[componentData.name]} onValueChange={(checked) => handleChangeCheckBox(checked, componentData.name)} />
                        </View>
                    )

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

    const handlePressButtonYes = async () => {
        setVisibleYes(true);
        setVisibleNo(false);
        const hasRadio = field.find(item => item.radio !== undefined);
        const updatedField = field.map(item => {
            if (item.radio) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        yes: true, // Устанавливаем "Да"
                        no: false, // Устанавливаем "Нет"
                    },
                };
            }
            return item;
        });

        setField(updatedField);

        const response = await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasRadio.radio.name, value: true },
            ],
        });

        console.log('Response', response);
    }

    const handlePressButtonNo = async () => {
        setVisibleYes(false);
        setVisibleNo(true);
        const hasRadio = field.find(item => item.radio !== undefined);
        const updatedField = field.map(item => {
            if (item.radio) {
                return {
                    ...item,
                    radio: {
                        ...item.radio,
                        yes: false, // Устанавливаем "Да"
                        no: true, // Устанавливаем "Нет"
                    },
                };
            }
            return item;
        });

        setField(updatedField);
        await postData(`checklist/${idCheckList}`, {
            answers: [
                { answer: hasRadio.radio.name, value: false },
            ],
        });


    }

    const handleNext = async () => {
        if (selectedValue < items.length - 1) {
            await fetchDataSaveStorage(`checklist/${idCheckList}`, 'checklists')
            setChecklists(getDataFromStorage('checklists'));
            const nextIndex = selectedValue + 1;
            setSelectedValue(nextIndex);
        } else {
            onNextTab?.();
        }
    }

    const handlePrevious = () => {

        if (selectedValue > 0) {
            const prevIndex = selectedValue - 1;
            setSelectedValue(prevIndex);

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
                <ScrollView>
                    {transferDataVisible(field, visibleYes)}
                </ScrollView>
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

export default Tab2ContentEdit;
