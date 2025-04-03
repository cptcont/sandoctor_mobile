import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Text, Button } from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { router, useLocalSearchParams } from "expo-router";
import { NavigationState, SceneMap, SceneRendererProps, TabView } from "react-native-tab-view";
import Tab from "@/components/Tab";
import type { Checklist, Zone } from "@/types/Checklist";
import Tab1Content from "@/components/Tab1Content";
import Tab2Content from "@/components/Tab2Content";
import Tab3Content from "@/components/Tab3Content";
import Tab2ContentEdit from "@/components/Tab2ContentEdit";
import Tab1ContentEdit from "@/components/Tab1ContentEdit";
import Tab3ContentEdit from "@/components/Tab3ContentEdit";
import {
    fetchDataSaveStorage,
    getDataFromStorage,
    postData,
    removeDataFromStorage,
    saveDataToStorage,
} from '@/services/api';
import type { Task } from "@/types/Task";
import { useFocusEffect } from "@react-navigation/native";

interface TabContent {
    key: string;
    title: string;
    content: React.ReactNode;
}

interface Route {
    key: string;
    title?: string;
    tabColor?: string;
}

const ChecklistScreen = memo(() => {
    const params = useLocalSearchParams();
    const { id, idCheckList, typeCheckList, statusVisible, tabId, tabIdTMC } = params;
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isFirstTab, setIsFirstTab] = useState(true); // Состояние для первого таба
    const [isLastTab, setIsLastTab] = useState(false);  // Состояние для последнего таба

    const loadChecklistsTask = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([
                fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists'),
                fetchDataSaveStorage<Task>(`task/${idCheckList}`, 'task'),
            ]);
            const loadedChecklists = getDataFromStorage('checklists') || [];
            setChecklists(loadedChecklists);
            console.log("Data loaded, checklists:", loadedChecklists);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные. Попробуйте ещё раз.');
            const cachedChecklists = getDataFromStorage('checklists') || [];
            if (cachedChecklists.length > 0) {
                setChecklists(cachedChecklists);
                setError('Использованы кэшированные данные из-за ошибки загрузки.');
            }
        } finally {
            setLoading(false);
        }
    }, [idCheckList]);

    const retryLoadData = useCallback(() => {
        loadChecklistsTask();
    }, [loadChecklistsTask]);

    useFocusEffect(
        useCallback(() => {
            loadChecklistsTask();
            return () => {
                // Очистка при необходимости
            };
        }, [loadChecklistsTask])
    );

    useEffect(() => {
        if (checklists.length > 0 && tabId) {
            const checkList = checklists.find((c) => c.id === id);
            if (checkList) {
                const tabIndex = checkList.zones.findIndex((zone: Zone) => zone.id === tabId);
                if (tabIndex !== -1) {
                    setIndex(tabIndex);
                    setIsFirstTab(tabIndex === 0);
                    setIsLastTab(tabIndex === checkList.zones.length - 1);
                }
            }
        }
    }, [tabId, checklists, id]);

    const updateCheckList = useCallback(async () => {
        await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists');
        setChecklists(getDataFromStorage('checklists') || []);
    }, [idCheckList]);

    useEffect(() => {
        if (statusVisible === 'edit') {
            updateCheckList();
        }
    }, [statusVisible, updateCheckList]);

    const checkList = checklists.find((checklist: Checklist) => checklist.id === id);

    const handleNextTab = useCallback(() => {
        if (index < routes.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
            setIsFirstTab(newIndex === 0);
            setIsLastTab(newIndex === routes.length - 1);
            updateCheckList();
        } else {
            console.log('Это последняя вкладка');
            setIsLastTab(true); // Убеждаемся, что состояние обновлено
        }
    }, [index, routes, updateCheckList]);

    const handlePreviousTab = useCallback(() => {
        if (index > 0) {
            const newIndex = index - 1;
            setIndex(newIndex);
            setIsFirstTab(newIndex === 0);
            setIsLastTab(newIndex === routes.length - 1);
            updateCheckList();
        } else {
            console.log('Это первая вкладка');
            setIsFirstTab(true); // Убеждаемся, что состояние обновлено
        }
    }, [index, routes, updateCheckList]);

    const handleTabChange = useCallback((newIndex: number) => {
        setIndex(newIndex);
        setIsFirstTab(newIndex === 0);
        setIsLastTab(newIndex === routes.length - 1);
        updateCheckList();
    }, [updateCheckList, routes.length]);

    const handleFinish = useCallback(() => {
        if (statusVisible === 'edit') {
            loadChecklistsTask();
            router.push({
                pathname: '/starttask',
                params: { taskId: idCheckList },
            });
        } else {
            router.push({
                pathname: '/details',
                params: { taskId: idCheckList },
            });
        }
    }, [statusVisible, idCheckList, loadChecklistsTask]);

    const tabsData: TabContent[] = useMemo(() => {
        if (!checkList || !checkList.zones || checkList.zones.length === 0) {
            console.log("No checklist or zones found, returning empty tabsData");
            return [];
        }
        return checkList.zones.map((zone: Zone, key: number) => {
            let tabContent = null;
            if (typeCheckList === '1' && statusVisible === 'view') {
                tabContent = <Tab1Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                    isFirstTab={isFirstTab}
                    isLastTab={isLastTab}
                />;
            }
            if (typeCheckList === '2' && statusVisible === 'view') {
                tabContent = <Tab2Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                    isFirstTab={isFirstTab}
                    isLastTab={isLastTab}
                />;
            }
            if (typeCheckList === '3' && statusVisible === 'view') {
                tabContent = <Tab3Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                    isFirstTab={isFirstTab}
                    isLastTab={isLastTab}
                />;
            }
            if (typeCheckList === '1' && statusVisible === 'edit') {
                tabContent = (
                    <Tab1ContentEdit
                        id={id}
                        index={index}
                        idTask={idCheckList}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        idCheckList={idCheckList}
                        itemsTabContent={checkList.zones}
                        isFirstTab={isFirstTab}
                        isLastTab={isLastTab}
                    />
                );
            }
            if (typeCheckList === '2' && statusVisible === 'edit') {
                tabContent = <Tab2ContentEdit
                    id={id}
                    index={index}
                    idTask={idCheckList}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                    idCheckList={idCheckList}
                    itemsTabContent={checkList.zones}
                    isFirstTab={isFirstTab}
                    isLastTab={isLastTab}
                />;
            }
            if (typeCheckList === '3' && statusVisible === 'edit') {
                tabContent = <Tab3ContentEdit
                    id={id}
                    index={index}
                    idTask={idCheckList}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                    idCheckList={idCheckList}
                    tabId={tabIdTMC}
                    itemsTabContent={checkList.zones}
                    isFirstTab={isFirstTab}
                    isLastTab={isLastTab}
                />;
            }

            return { key: `tab${key}`, title: zone.name, content: tabContent, tabColor: zone.badge.color };
        });
    }, [checkList, handleNextTab, handlePreviousTab, id, idCheckList, typeCheckList, statusVisible, tabIdTMC, isFirstTab, isLastTab]);

    const finalTabsData = useMemo(() => {
        return tabsData.length > 0 ? tabsData : [
            { key: 'tab0', title: 'Нет данных', content: <View><Text>Нет данных для отображения</Text></View> },
        ];
    }, [tabsData]);

    useEffect(() => {
        const newRoutes = finalTabsData.map(tab => ({
            key: tab.key,
            title: tab.title,
            tabColor: tab.tabColor
        }));
        setRoutes(prevRoutes => {
            if (JSON.stringify(prevRoutes) !== JSON.stringify(newRoutes)) {
                console.log("Updated routes:", newRoutes);
                return newRoutes;
            }
            return prevRoutes;
        });
    }, [finalTabsData]);

    const renderScene = SceneMap(
        finalTabsData.reduce((acc, tab) => {
            acc[tab.key] = () => tab.content;
            return acc;
        }, {} as { [key: string]: () => React.ReactNode })
    );

    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0);
    const { width: screenWidth } = useWindowDimensions();

    const renderTabBar = useCallback((
        props: SceneRendererProps & { navigationState: NavigationState<Route> }
    ) => {
        const needsEmptyTab = tabsWidth < screenWidth;
        return (
            <View style={styles.tabBarOuterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContainer}>
                    <View ref={tabsContainerRef} onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)} style={styles.tabsContainer}>
                        {props.navigationState.routes.map((route: Route, i: number) => {
                            const isActive = i === props.navigationState.index;
                            return (
                                <Tab
                                    key={route.key}
                                    label={route.title ?? ""}
                                    isActive={isActive}
                                    onPress={() => handleTabChange(i)}
                                    isLast={i === props.navigationState.routes.length - 1 && !needsEmptyTab}
                                    showDot={statusVisible === 'edit'}
                                    color={route.tabColor}
                                />
                            );
                        })}
                    </View>
                    {needsEmptyTab && <View style={[styles.emptyTab, { width: screenWidth - tabsWidth }]} />}
                </ScrollView>
            </View>
        );
    }, [tabsWidth, screenWidth, statusVisible, handleTabChange]);

    if (loading) {
        return <View style={styles.container}><Text>Загрузка данных...</Text></View>;
    }

    if (error && checklists.length === 0) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
                <Button title="Повторить загрузку" onPress={retryLoadData} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {statusVisible === 'edit' && (
                <CustomHeaderScreen
                    text={`${checkList?.name || 'Checklist'}`}
                    marginBottom={0}
                    onPress={handleFinish}
                    progress={checkList?.progress}
                    progressVisible={true}
                />
            )}
            {statusVisible === 'view' && (
                <CustomHeaderScreen text={`${checkList?.name || 'Checklist'}`} marginBottom={0} onPress={handleFinish} />
            )}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={handleTabChange}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    text: {
        marginBottom: 13,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
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
        paddingHorizontal: 12,
        paddingTop: 14,
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
    emptyTab: {
        height: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderLeftColor: '#ECECEC',
        borderLeftWidth: 1,
    },
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default ChecklistScreen;
