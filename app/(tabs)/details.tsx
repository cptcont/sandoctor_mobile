import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
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
import { stringify, parse } from 'flatted';

interface Status {
    name: string;
}

interface Service {
    id: string;
    service_name: string;
    status: Status;
}

const DetailsScreen = () => {
    const params = useLocalSearchParams();
    const task = parse(params.task as string);
    const taskServicesArray = Array.isArray(task.services) ? task.services : [task.services];
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'tab1', title: 'Детали' },
        { key: 'tab2', title: 'Услуги' },
        { key: 'tab3', title: 'Чек-лист' },
        { key: 'tab4', title: 'Отчет' },
    ]);

    const { width: screenWidth } = useWindowDimensions(); // Динамическая ширина экрана
    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0); // Ширина контейнера табов

    const handleSanTechOnPress = () => {
        router.push({
            pathname: '/checklist',
            params: { id: '1', title: title.sanTeh },
        });
    };

    const handleVisualOnPress = () => {
        router.push({
            pathname: '/checklist',
            params: { id: '2', title: title.visual },
        });
    };

    const handlePointOnPress = () => {
        router.push({
            pathname: '/checklist',
            params: { id: '3', title: title.point },
        });
    };

    const handleServiceOnPress = (service: Service) => {
        router.push({
            pathname: '/checklist',
            params: { id: service.id, title: service.service_name },
        });
    };

    const handleFinish = () => {
        router.push('/');
    };

    const title = {
        sanTeh: 'Сантехнический осмотр объекта',
        visual: 'Визуальный осмотр вредителей',
        point: 'Осмотр точек контроля',
    };

    const renderScene = SceneMap({
        tab1: () => (
            <View style={styles.tab1Container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={{ marginBottom: 25 }}>
                        <ArrivalCard
                            destination={`${task.point}`}
                            address={`${task.adress}`}
                            route={`${task.comment}`}
                            arrivalDate={`${task.date_begin_work.split('-').reverse().join('.')}`}
                            arrivalTime={`с ${task.time_begin_work} до ${task.time_end_work}`}
                        />
                    </View>
                    <View style={{ marginBottom: 25 }}>
                        <ContactCard name={`${task.contacts[0].fio}`} post={`${task.contacts[0].position}`} tel1={`${task.contacts[0].phone_1}`} />
                    </View>
                    <View>
                        <ActorsCard name_1={`${task.executors[0].user}`} />
                    </View>
                </ScrollView>
                <Footer>
                    <TextButton
                        text={'Продолжить заполнение отчёта'}
                        type={'primary'}
                        size={302}
                    />
                </Footer>
            </View>
        ),
        tab2: () => (
            <View style={styles.content}>
                <ServiceCardContainer
                    title={'Услуга'}
                    task={taskServicesArray}
                />
            </View>
        ),
        tab3: () => (
            <View style={styles.tab3Container}>
                <View style={{ marginBottom: 10 }}>
                    <TaskCard onPress={handleSanTechOnPress} title={title.sanTeh} status={'completed'} />
                </View>
                <View style={{ marginBottom: 10 }}>
                    <TaskCard onPress={handleVisualOnPress} title={title.visual} status={'completed'} />
                </View>
                <View style={{ marginBottom: 10 }}>
                    <TaskCard onPress={handlePointOnPress} title={title.point} status={'completed'} />
                </View>
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

    return (
        <View style={styles.container}>
            <CustomHeaderScreen text={`Задание №${task.id}`} marginBottom={0} onPress={handleFinish} />

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
