import React, { useState, useRef, useCallback, useEffect } from 'react';
import {View, ScrollView, StyleSheet, useWindowDimensions, Text} from 'react-native';
import { TabView, SceneMap, NavigationState, SceneRendererProps, Route } from 'react-native-tab-view';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import ArrivalCard from "@/components/ArrivalCard";
import Footer from "@/components/Footer";
import { TextButton } from "@/components/TextButton";
import ContactCard from "@/components/ContactCard";
import ActorsCard from "@/components/ActorsCard";
import ServiceCardContainer from "@/components/ServiceCardContainer";
import TaskCard from "@/components/TaskCard";
import ReportCard from "@/components/ReportCard";
import { router, useLocalSearchParams } from "expo-router";
import Tab from "@/components/Tab";
import { useApi } from '@/context/ApiContext';
import type { Checklist } from '@/types/Checklist';
import type { Task } from '@/types/Task';
import { useFocusEffect } from '@react-navigation/native';
import {useModal} from "@/context/ModalContext";
import CancelTaskModal from "@/components/CancelTaskModal";
import StartTaskModal from "@/components/StartTaskModal";


const DetailsScreen = () => {
    const params = useLocalSearchParams();
    const taskId = params.taskId as string;
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'tab1', title: 'Детали' },
        { key: 'tab2', title: 'Услуги' },
        { key: 'tab3', title: 'Чек-лист' },
        { key: 'tab4', title: 'Отчет' },
    ]);
    const { checklists, tasks, isLoading, error, fetchData } = useApi();
    const { showModal, isModalVisible, hideModal } = useModal();
    const checkList = checklists || []; // Убедимся, что checkList всегда массив
    const { width: screenWidth } = useWindowDimensions(); // Динамическая ширина экрана
    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0); // Ширина контейнера табов
    const [statusEnabled, setStatusEnabled] = useState<boolean>(true);

    const taskFiltered = (tasks || []).filter((task: Task) => {
        return task.id === taskId;
    });
    const task = taskFiltered[0];

    useFocusEffect(
        useCallback(() => {
            const loadChecklist = async () => {
                await fetchData<Checklist>(`checklist/${taskId}/`, 'checklists');
            };
            const loadTasks = async () => {
                await fetchData<Task[]>(`task/`, 'tasks');
            };

            loadChecklist();
            loadTasks();

            return () => {
                // Опционально: выполнить очистку, если необходимо
            };
        }, [fetchData, taskId])
    );
    // Используем useEffect для обновления состояния statusEnabled
    useEffect(() => {
        if (task.condition.id === '3') {
            setStatusEnabled(false);
        } else {
            setStatusEnabled(true);
        }
    }, [task]); // Зависимость от task

    const handleSubmit = (type: string, reason: string, comment: string) => {
        console.log('Тип отмены:', type);
        console.log('Причина:', reason);
        console.log('Комментарий:', comment);
        hideModal()

    };

    const handleTaskOnPress = (idCheckList: string, typeCheckList: string) => {
        console.log('Нажата задача с id:', idCheckList, 'и типом:', typeCheckList);
        router.push({
            pathname: '/checklist',
            params: {
                id: `${idCheckList}`,
                idTask: `${taskId}`,
                idCheckList: idCheckList,
                typeCheckList: typeCheckList
            },
        });
    };

    const handleFinish = () => {
        router.push('/');
    };

    const renderScene = SceneMap({
        tab1: () => (
            <View style={styles.tab1Container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={{ marginBottom: 15 }}>
                        <ArrivalCard
                            destination={`${task.point}`}
                            address={`${task.adress}`}
                            route={`${task.comment}`}
                            arrivalDate={`${task.date_begin_work.split('-').reverse().join('.')}`}
                            arrivalTime={`с ${task.time_begin_work} до ${task.time_end_work}`}
                        />
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <ContactCard name={`${task.contacts[0].fio}`} post={`${task.contacts[0].position}`} tel1={`${task.contacts[0].phone_1}`} />
                    </View>
                    <View>
                        <ActorsCard name_1={`${task.executors[0].user}`} />
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{marginRight: 13}}>
                            <TextButton text={'Отменить задание'}
                                        width={170}
                                        height={52}
                                        textSize={14}
                                        textColor={'#FD1F9B'}
                                        backgroundColor={'#FFEAF6'}
                                        enabled={statusEnabled}
                                        onPress={toggleCancelTaskModal}
                            />
                        </View>
                        <TextButton text={'Приступить к выполнению'}
                                    width={170}
                                    height={52}
                                    textSize={14}
                                    textColor={'#30DA88'}
                                    backgroundColor={'#EAFBF3'}
                                    enabled={statusEnabled}
                                    onPress={toggleStartTaskModal}
                        />
                    </View>
                </ScrollView>
                <Footer>
                    <TextButton
                        text={'Продолжить заполнение отчёта'}
                        width={302}
                        height={39}
                        textSize={16}
                        textColor={'#FFFFFF'}
                        backgroundColor={'#017EFA'}
                        enabled={statusEnabled}
                        onPress={() => {}}
                    />
                </Footer>
            </View>
        ),
        tab2: () => (
            <View style={styles.content}>
                <ServiceCardContainer
                    title={'Услуга'}
                    task={task.services}
                />
            </View>
        ),
        tab3: () => (
            <View style={styles.tab3Container}>
                {isLoading ? (
                    <Text>Загрузка...</Text>
                ) : error ? (
                    <Text>Ошибка: {error}</Text>
                ) : checkList.length > 0 ? (
                    checkList.map((data, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                            <TaskCard
                                onPress={() => handleTaskOnPress(data.id, data.type)}
                                title={data.name}
                                status={'completed'}
                            />
                        </View>
                    ))
                ) : (
                    <Text>Нет данных для отображения</Text>
                )}
            </View>
        ),
        tab4: () => (
            <View style={styles.tab4Container}>
                <ReportCard
                    image={require('@/assets/images/example1.png')}
                    workingTime={'10:20 — 11:45'}
                    time={'11:45'}
                    executorComment={'Клиент не был готов к обработке'}
                    customerComment={'Нужно обязательно звонить перед выездом'}
                />
            </View>
        ),
    });

    const renderTabBar = (
        props: SceneRendererProps & { navigationState: NavigationState<Route> }
    ) => {
        const needsEmptyTab = tabsWidth < screenWidth; // Нужен ли пустой таб
        return (
            <View style={styles.tabBarOuterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarContainer}
                >
                    <View
                        ref={tabsContainerRef}
                        onLayout={(event) => {
                            const { width } = event.nativeEvent.layout;
                            setTabsWidth(width); // Обновляем ширину контейнера табов
                        }}
                        style={styles.tabsContainer}
                    >
                        {props.navigationState.routes.map((route: Route, i: number) => {
                            const isActive = i === props.navigationState.index;
                            return (
                                <Tab
                                    key={route.key}
                                    label={route.title ?? ""}
                                    isActive={isActive}
                                    onPress={() => setIndex(i)}
                                    isLast={i === props.navigationState.routes.length - 1 && !needsEmptyTab}
                                />
                            );
                        })}
                    </View>
                    {needsEmptyTab && (
                        <View
                            style={[
                                styles.emptyTab,
                                { width: screenWidth - tabsWidth },
                            ]}
                        />
                    )}
                </ScrollView>
            </View>
        );
    };

    const toggleStartTaskModal = () => {
        showModal(
            <StartTaskModal
                visible={isModalVisible}
                onClose={hideModal}
                onSubmit={handleSubmit}
            />, {
                overlay: { alignItems: 'center', justifyContent: 'center' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                modalContent: { paddingTop: 0, paddingRight: 0 },
            }
        );

    }

    const toggleCancelTaskModal = () => {
        // Показываем модальное окно с содержимым AvatarMenu
        showModal(
            <CancelTaskModal
                visible={isModalVisible}
                onClose={hideModal}
                onSubmit={handleSubmit}
            />, {
                overlay: { alignItems: 'center', justifyContent: 'center' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                modalContent: { paddingTop: 0, paddingRight: 0 },
            }
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeaderScreen text={`Задание №${task.id}`}
                                status={{
                                    text:task.condition.name,
                                    color:task.condition.color,
                                    bgColor: task.condition.bgcolor }}
                                marginBottom={0}
                                onPress={handleFinish} />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabBarOuterContainer: {
        height: 30, // Фиксированная высота для контейнера табов
    },
    tabBarContainer: {
        flexDirection: 'row', // Располагаем табы в строку
        backgroundColor: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
    },
    tab1Container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    tab3Container: {
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    tab4Container: {
        padding: 0,
    },
    scrollContent: {
        paddingTop: 14,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 10,
    },
    emptyTab: {
        height: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderLeftWidth: 1,
        borderLeftColor: '#ECECEC',
    },
});

export default DetailsScreen;
