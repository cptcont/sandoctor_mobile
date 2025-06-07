import { StyleSheet, Text, View, TextInput, ActivityIndicator } from "react-native";
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import type { Checklist } from "@/types/Checklist";
import type { Task } from "@/types/Task";
import TaskCard from "@/components/TaskCard";
import ServiceCardContainer from "@/components/ServiceCardContainer";
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { fetchDataSaveStorage, getDataFromStorage, postData } from "@/services/api";

const StartTaskScreen = () => {
    const params = useLocalSearchParams();
    const [task, setTask] = useState<Task | null>(null);
    const [checklists, setChecklists] = useState<Checklist[] | null>(null);
    const [textCommentClient, setTextCommentClient] = useState<string>("");
    const [textCommentExec, setTextCommentExec] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const taskId = params.taskId as string;
    const [photoKey, setPhotoKey] = useState<string>(task?.photos?.length.toString() || "0");


    console.log('StartTaskScreen taskId', taskId);
    const fetchData = async () => {
        try {
            setLoading(true);
            await fetchDataSaveStorage<Checklist>(`checklist/${taskId}`, "checklists");
            await fetchDataSaveStorage<Task>(`task/${taskId}`, "task");
            const updatedTask = (await getDataFromStorage("task")) as Task;
            const updatedChecklists = (await getDataFromStorage("checklists")) as Checklist[];
            setTask(updatedTask);
            setChecklists(updatedChecklists);
            setTextCommentClient(updatedTask.report.comment_client || "");
            setTextCommentExec(updatedTask.report.comment_exec || "");
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                // Очистка, если необходимо
            };
        }, [taskId])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#017EFA" />
            </View>
        );
    }

    if (!task || !checklists) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Данные не найдены</Text>
            </View>
        );
    }

    const handleTaskOnPress = (idCheckList: string, typeCheckList: string) => {
        console.log("Нажата задача с id:", idCheckList, "и типом:", typeCheckList);
        router.push({
            pathname: "/checklist",
            params: {
                id: `${idCheckList}`,
                idCheckList: `${taskId}`,
                typeCheckList: typeCheckList,
                statusVisible: "edit",
                tabId: "0",
                tabIdTMC: "0",
            },
        });
    };

    const handleBack = async () => {
        await fetchDataSaveStorage<Checklist>(`checklist/${taskId}`, "checklists");
        await fetchDataSaveStorage<Task>(`task/${taskId}`, "task");
        router.push({
            pathname: "/details",
            params: {
                taskId: taskId,
            },
        });
    };

    const handleChangeTextCommentClient = (text: string) => {
        setTextCommentClient(text);
    };

    const handleChangeTextCommentExec = (text: string) => {
        setTextCommentExec(text);
    };

    const handleBlurCommentClient = async () => {
        try {
            await postData(`task/${taskId}/`, { report: { comment_client: textCommentClient } });
            setTask((prev) => prev ? { ...prev, report: { ...prev.report, comment_client: textCommentClient } } : null);
        } catch (error) {
            console.error("Ошибка при сохранении комментария клиента:", error);
        }
    };

    const handleBlurCommentExec = async () => {
        try {
            await postData(`task/${taskId}/`, { report: { comment_exec: textCommentExec } });
            setTask((prev) => prev ? { ...prev, report: { ...prev.report, comment_exec: textCommentExec } } : null);
        } catch (error) {
            console.error("Ошибка при сохранении комментария исполнителя:", error);
        }
    };

    const handleUpdateImage = async () => {
        await fetchDataSaveStorage<Task>(`task/${taskId}`, "task");
        const updatedTask = (await getDataFromStorage("task")) as Task;
        setTask(updatedTask);
        setPhotoKey(updatedTask.photos.length.toString());
    };

    const handleSubmit = async () => {
        try {
            await postData(`task/${taskId}/`, { condition_id: 3, cancel_reason: "", cancel_comment: "" });
            router.push({
                pathname: "/",
                params: {},
            });
        } catch (error) {
            console.error("Ошибка при завершении задания:", error);
        }
    };

    const checklistProgress = () => {
        return checklists.every((item) => item.progress === 100);
    };

    const serviceCardStatus = () => {
        return task.services.every((item) => item.status.id !== '0');
    };

    const photosCheck = () => {
        return task.photos.length > 0;
    };

    const isCommentClientValid = () => {
        return textCommentClient.length >= 5;
    };

    const isFormValid = () => {
        return checklistProgress() && serviceCardStatus() && photosCheck() && isCommentClientValid();
    };

    console.log('progress', checklistProgress(), serviceCardStatus(), photosCheck(), isCommentClientValid());

    return (
        <>
            <CustomHeaderScreen onPress={handleBack} text={`Отчет по заданию №${taskId}`} />
            <KeyboardAwareScrollView>
                {checklists.length > 0 && (<>
                    <View style={styles.containerTitleCheckList}>
                    <Text style={styles.titleCheckList}>Чек-лист</Text>
                    </View>
                    <View style={styles.containerCheckList}>
                        {checklists.map((data, index) => (
                            <View key={index} style={{ marginBottom: 10 }}>
                                <TaskCard
                                    onPress={() => handleTaskOnPress(data.id, data.type)}
                                    title={data.name}
                                    idStatus={0}
                                    bgColor={data.badge.color}
                                />
                            </View>
                        ))}
                    </View>
                </>)}
                <View style={styles.containerTitleCheckList}>
                    <Text style={styles.titleCheckList}>Результат выполнения работ</Text>
                </View>
                <View style={styles.containerTask}>
                    <ServiceCardContainer
                        task={task.services}
                        visible={"edit"}
                        onServicesStatusChange={(status) => {
                            console.log("Статус услуг:", status);
                        }}
                        taskId={taskId}
                    />
                </View>
                <View style={styles.containerTitleCheckList}>
                    <Text style={styles.titleCheckList}>Отчетный документ по заданию</Text>
                </View>
                <ImagePickerWithCamera
                    key={photoKey}
                    taskId={taskId}
                    initialImages={task.photos}
                    path={`task/${taskId}`}
                    onImageUploaded={handleUpdateImage}
                    borderColor={photosCheck() ? '#DADADA' : 'red'}
                    viewGallery={true}
                    backgroundColor={'#ffffff'}
                />
                <View style={[styles.containerTextArea, { marginBottom: 11 }]}>
                    <Text style={styles.titleTextArea}>Комментарий исполнителя</Text>
                    <TextInput
                        style={[styles.textArea, !isCommentClientValid() && styles.errorBorder]}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={handleChangeTextCommentClient}
                        textAlignVertical="top"
                        value={textCommentClient}
                        onBlur={handleBlurCommentClient}
                    />
                </View>
                <View style={[styles.containerTextArea, { marginBottom: 19 }]}>
                    <Text style={styles.titleTextArea}>Пожелания клиента</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={handleChangeTextCommentExec}
                        textAlignVertical="top"
                        value={textCommentExec}
                        onBlur={handleBlurCommentExec}
                    />
                </View>
                <Footer>
                    <TextButton
                        text={"Завершить задание"}
                        width={302}
                        height={39}
                        textSize={16}
                        textColor={"#FFFFFF"}
                        backgroundColor={"#017EFA"}
                        enabled={isFormValid()}
                        touchable={true}
                        onPress={handleSubmit}
                    />
                </Footer>
            </KeyboardAwareScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    containerTitleCheckList: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#DADADA",
    },
    titleCheckList: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1B2B65",
    },
    containerCheckList: {
        paddingHorizontal: 8,
        paddingTop: 10,
    },
    containerTask: {
        paddingHorizontal: 8,
        paddingBottom: 10,
    },
    containerTextArea: {
        paddingHorizontal: 20,
    },
    titleTextArea: {
        marginBottom: 11,
        color: "#939393",
        fontSize: 12,
        fontWeight: "600",
    },
    textArea: {
        height: 63,
        borderRadius: 6,
        padding: 10,
        fontSize: 12,
        textAlignVertical: "top",
        backgroundColor: "#F5F7FB",
    },
    errorBorder: {
        borderWidth: 1,
        borderColor: "red",
        borderRadius: 6,
    },
});

export default StartTaskScreen;
