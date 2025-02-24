import {StyleSheet, Text, ScrollView, View, TextInput} from "react-native";
import {CustomHeaderScreen} from "@/components/CustomHeaderScreen";
import {router, useLocalSearchParams} from "expo-router";
import {useFocusEffect} from "@react-navigation/native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, {useCallback} from "react";
import type {Checklist} from "@/types/Checklist";
import type {Task} from "@/types/Task";
import {useApi} from "@/context/ApiContext";
import TaskCard from "@/components/TaskCard";
import ServiceCardContainer from "@/components/ServiceCardContainer";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import Footer from "@/components/Footer";
import {TextButton} from "@/components/TextButton";

const StartTaskScreen = () => {
    const { checklists, tasks, isLoading, error, fetchData, postData } = useApi();
    const checkList = checklists || [];
    const params = useLocalSearchParams();
    const taskId = params.taskId as string;
    const taskFiltered = (tasks || []).filter((task: Task) => {
        return task.id === taskId;
    });
    const task = taskFiltered[0];


    useFocusEffect(
        useCallback(() => {
            const loadChecklist = async () => {
                await fetchData<Checklist>(`checklist/${taskId}/`, 'checklists');
            };
            //const loadTasks = async () => {
            //    await fetchData<Task[]>(`task/`, 'tasks');
            //};

            loadChecklist();
            //loadTasks();

            return () => {
                // Опционально: выполнить очистку, если необходимо
            };
        }, [fetchData, taskId])
    );


    const handleBack = () => {
        router.push({
            pathname: '/details',
            params: {
                taskId: taskId,
            }
        });
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid={true}
            extraScrollHeight={100} // Добавьте дополнительный отступ для клавиатуры
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }} // Растягиваем контент на весь экран
        >
            <CustomHeaderScreen onPress={handleBack} text={ `Отчет по заданию №${taskId}`} />
            <View style={styles.containerTitleCheckList}>
                <Text style={styles.titleCheckList}>Чек-лист</Text>
            </View>
            <View style={styles.containerCheckList}>
            {isLoading ? (
                <Text>Загрузка...</Text>
            ) : error ? (
                <Text>Ошибка: {error}</Text>
            ) : checkList.length > 0 ? (
                checkList.map((data, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                        <TaskCard
                            onPress={() => {}}
                            title={data.name}
                            status={'completed'}
                        />
                    </View>
                ))
            ) : (
                <Text>Нет данных для отображения</Text>
            )}
            </View>
            <View style={styles.containerTitleCheckList}>
                <Text style={styles.titleCheckList}>Результат выполнения работ</Text>
            </View>
            <View style={styles.containerTask}>
                <ServiceCardContainer
                    task={task.services}
                    visible={'edit'}
                />
            </View>
            <View style={styles.containerTitleCheckList}>
                <Text style={styles.titleCheckList}>Отчетный документ по заданию</Text>
            </View>
                <ImagePickerWithCamera/>
            <View style={[styles.containerTextArea, {marginBottom: 11}]}>
                <Text style={styles.titleTextArea}>Комментарий исполнителя</Text>
                <TextInput
                    style={styles.textArea}
                    multiline={true} // Разрешаем многострочный ввод
                    numberOfLines={4} // Минимальное количество строк (на iOS не всегда работает)
                    onChangeText={() => {}} // Обновляем состояние при изменении текста
                    textAlignVertical="top" // Выравнивание текста сверху (актуально для Android)
                />
            </View>
            <View style={[styles.containerTextArea, {marginBottom: 19}]}>
                <Text style={styles.titleTextArea}>Пожелания клиента</Text>
                <TextInput
                    style={styles.textArea}
                    multiline={true} // Разрешаем многострочный ввод
                    numberOfLines={4} // Минимальное количество строк (на iOS не всегда работает)
                    onChangeText={() => {}} // Обновляем состояние при изменении текста
                    textAlignVertical="top" // Выравнивание текста сверху (актуально для Android)
                />
            </View>

            <Footer>
                <TextButton
                    text={'Завершить задание'}
                    width={302}
                    height={39}
                    textSize={16}
                    textColor={'#FFFFFF'}
                    backgroundColor={'#017EFA'}
                    enabled={true}
                    onPress={() =>{}}
                />
            </Footer>


        </KeyboardAwareScrollView>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerTitleCheckList: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    titleCheckList: {
        fontSize: 14,
        fontWeight: '600',
        color: "#1B2B65",
    },
    containerCheckList: {
        paddingHorizontal: 8,
        paddingTop: 10,
    },
    containerTask: {
        paddingHorizontal: 8,
        paddingBottom:10,

    },
    containerTextArea: {
        paddingHorizontal: 20,
    },
    titleTextArea: {
        marginBottom: 11,
        color: '#939393',
        fontSize: 12,
        fontWeight: '600',
    },
    textArea: {
        height: 63, // Высота текстового поля
        borderRadius: 6,
        padding: 10,
        fontSize: 12,
        textAlignVertical: 'top', // Выравнивание текста сверху (актуально для Android)
        backgroundColor: '#F5F7FB',
    },

})
export default StartTaskScreen;
