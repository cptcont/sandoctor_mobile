import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    ActivityIndicator,
} from 'react-native';
import {
    TabView,
    SceneMap,
    NavigationState,
    SceneRendererProps,
    Route,
} from 'react-native-tab-view';
import { CustomHeaderScreen } from '@/components/CustomHeaderScreen';
import ArrivalCard from '@/components/ArrivalCard';
import Footer from '@/components/Footer';
import { TextButton } from '@/components/TextButton';
import ContactCard from '@/components/ContactCard';
import ActorsCard from '@/components/ActorsCard';
import ServiceCardContainer from '@/components/ServiceCardContainer';
import TaskCard from '@/components/TaskCard';
import ReportCard from '@/components/ReportCard';
import { router, useLocalSearchParams } from 'expo-router';
import Tab from '@/components/Tab';
import type { Checklist } from '@/types/Checklist';
import type { Task } from '@/types/Task';
import { useFocusEffect } from '@react-navigation/native';
import { useModal } from '@/context/ModalContext';
import CancelTaskModal from '@/components/CancelTaskModal';
import StartTaskModal from '@/components/StartTaskModal';
import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
} from '@/services/api';

const DetailsScreen = () => {
    const params = useLocalSearchParams();
    const taskId = params.taskId as string;
    const previousScreen = params.screenPath as string | undefined;
    const [index, setIndex] = useState(0);
    const { width: screenWidth } = useWindowDimensions();
    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0);
    const [statusEnabledCancel, setStatusEnabledCancel] = useState<boolean>(true);
    const [statusEnabledStart, setStatusEnabledStart] = useState<boolean>(true);
    const [statusEnabledNext, setStatusEnabledNext] = useState<boolean>(true);
    const [task, setTask] = useState<Task | null>(null);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showModal, isModalVisible, hideModal } = useModal();

    const loadChecklistsTask = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                fetchDataSaveStorage<Checklist>(`checklist/${taskId}`, 'checklists'),
                fetchDataSaveStorage<Task>(`task/${taskId}`, 'task'),
            ]);
            setTask(getDataFromStorage('task'));
            setChecklists(getDataFromStorage('checklists'));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const changeCondition = async () => {
        await postData(`task/${taskId}/`, {
            condition_id: 2,
            cancel_reason: 0,
            cancel_comment: '',
        });
    };

    useFocusEffect(
        useCallback(() => {
            loadChecklistsTask();
            setIndex(0);
            return () => {};
        }, [taskId])
    );

    useEffect(() => {
        if (task) {

            if (task.condition.id === '3' || task.condition.id === '4') {
                setStatusEnabledCancel(false);
                setStatusEnabledStart(false);
                setStatusEnabledNext(false);
            }
            if (task.condition.id === '1') {
                setStatusEnabledCancel(true);
                setStatusEnabledStart(true);
                setStatusEnabledNext(false);
            }
            if (task.condition.id === '2') {
                setStatusEnabledCancel(false);
                setStatusEnabledStart(false);
                setStatusEnabledNext(true);
            }
        }
    }, [task]);

    const handleSubmit = async (
        type: string,
        conditionId: number,
        cancelReason: number,
        cancelComment: string
    ) => {
        if (type === 'cancel') {
            await postData(`task/${taskId}/`, {
                condition_id: conditionId,
                cancel_reason: cancelReason,
                cancel_comment: cancelComment,
            });
            router.push('/');
        }
        if (type === 'start') {
            await postData(`task/${taskId}/`, {
                condition_id: conditionId,
                cancel_reason: cancelReason,
                cancel_comment: cancelComment,
            });
            router.push({
                pathname: '/starttask',
                params: { taskId },
            });
        }
    };

    const handleTaskOnPress = (idCheckList: string, typeCheckList: string) => {
        router.push({
            pathname: '/checklist',
            params: {
                id: idCheckList,
                idCheckList: taskId,
                typeCheckList,
                statusVisible: 'view',
                tabId: '',
                tabIdTMC: '',
            },
        });
    };

    const handleFinish = () => {
        console.log('previousScreen',previousScreen);
        const path = `${previousScreen}`
        router.push(path);

    };

    const handleStart = () => {
        router.push({
            pathname: '/starttask',
            params: { taskId },
        });
    };

    // Формируем список вкладок в зависимости от условий
    const routes = useMemo(() => {
        // Если task.condition.id === '4', возвращаем только вкладку "Отчет"
        if (task?.condition.id === '4') {
            return [{ key: 'tab4', title: 'Отчет' }];
        }

        const baseRoutes = [{ key: 'tab1', title: 'Детали' }, { key: 'tab2', title: 'Услуги' }];

        // Если checklists не пустой и task.condition.id !== '2', добавляем вкладку "Чек-лист"
        if (checklists.length > 0 && task?.condition.id !== '2') {
            baseRoutes.push({ key: 'tab3', title: 'Чек-лист' });
        }

        // Если task.condition.id !== '2' и task.condition.id !== '1', добавляем вкладку "Отчет"
        if (task?.condition.id !== '2' && task?.condition.id !== '1') {
            baseRoutes.push({ key: 'tab4', title: 'Отчет' });
        }

        return baseRoutes;
    }, [task, checklists]);

    const renderScene = SceneMap({
        tab1: () => (
            <View style={styles.tab1Container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {task && (
                        <>
                            <View style={{ marginBottom: 15 }}>
                                <ArrivalCard
                                    destination={task.point}
                                    address={task.adress}
                                    route={task.comment}
                                    arrivalDate={task.date_begin_work
                                        .split(' ')[0]
                                        .split('-')
                                        .reverse()
                                        .join('.')}
                                    arrivalTime={`с ${task.time_work} до ${task.time_end_work}`}
                                />
                            </View>
                            {task.condition.id !== '3' && task.condition.id !== '4' && (
                                <View style={{ marginBottom: 15 }}>
                                    <ContactCard contacts={task.contacts} />
                                </View>
                            )}
                            <View>
                                <ActorsCard executors={task.executors} />
                            </View>
                            {task.condition.id === '1' && (
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <View style={{ marginRight: 13 }}>
                                        <TextButton
                                            text={'Отменить'}
                                            width={170}
                                            height={52}
                                            textSize={14}
                                            textColor={'#FD1F9B'}
                                            backgroundColor={'#FFEAF6'}
                                            enabled={statusEnabledCancel}
                                            touchable={statusEnabledCancel}
                                            onPress={toggleCancelTaskModal}
                                        />
                                    </View>
                                    <TextButton
                                        text={'Приступить'}
                                        width={170}
                                        height={52}
                                        textSize={14}
                                        textColor={'#30DA88'}
                                        backgroundColor={'#EAFBF3'}
                                        enabled={statusEnabledStart}
                                        touchable={statusEnabledStart}
                                        onPress={toggleStartTaskModal}
                                    />
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
                {task?.condition.id === '2' && (
                    <Footer>
                        <TextButton
                            text={'Продолжить заполнение отчёта'}
                            width={302}
                            height={39}
                            textSize={16}
                            textColor={'#FFFFFF'}
                            backgroundColor={'#017EFA'}
                            enabled={statusEnabledNext}
                            touchable={statusEnabledNext}
                            onPress={handleStart}
                        />
                    </Footer>
                )}
            </View>
        ),
        tab2: () => (
            <View style={styles.content}>
                {task && <ServiceCardContainer task={task.services} />}
            </View>
        ),
        tab3: () => (
            <View style={styles.tab3Container}>
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
        ),
        tab4: () => (
            <View style={styles.tab4Container}>
                {task && (
                    <ReportCard
                        image={task.photos}
                        workingTime={`${task.report.time_start} - ${task.report.time_end}`}
                        time={`task.report.work_len`}
                        executorComment={task.report.comment_exec}
                        customerComment={task.report.comment_client}
                    />
                )}
            </View>
        ),
    });

    const renderTabBar = (
        props: SceneRendererProps & { navigationState: NavigationState<Route> }
    ) => {
        const needsEmptyTab = tabsWidth < screenWidth;
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
                            setTabsWidth(width);
                        }}
                        style={styles.tabsContainer}
                    >
                        {props.navigationState.routes.map((route: Route, i: number) => {
                            const isActive = i === props.navigationState.index;
                            return (
                                <Tab
                                    key={route.key}
                                    label={route.title ?? ''}
                                    isActive={isActive}
                                    onPress={() => setIndex(i)}
                                    isLast={
                                        i === props.navigationState.routes.length - 1 && !needsEmptyTab
                                    }
                                />
                            );
                        })}
                    </View>
                    {needsEmptyTab && (
                        <View
                            style={[styles.emptyTab, { width: screenWidth - tabsWidth }]}
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
            />,
            {
                overlay: { alignItems: 'center', justifyContent: 'center' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                modalContent: { paddingTop: 0, paddingRight: 0 },
            }
        );
    };

    const toggleCancelTaskModal = () => {
        showModal(
            <CancelTaskModal
                visible={isModalVisible}
                onClose={hideModal}
                onSubmit={handleSubmit}
            />,
            {
                overlay: { alignItems: 'center', justifyContent: 'center' },
                overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                modalContent: { paddingTop: 0, paddingRight: 0 },
            }
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#017EFA" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {task && (
                <CustomHeaderScreen
                    text={`Задание №${task.id}`}
                    status={{
                        text: task.condition.name,
                        color: task.condition.color,
                        bgColor: task.condition.bgcolor,
                    }}
                    marginBottom={0}
                    onPress={handleFinish}
                />
            )}
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
        height: 30,
    },
    tabBarContainer: {
        flexDirection: 'row',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default DetailsScreen;
