import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Text, Button, ActivityIndicator } from 'react-native';
import { CustomHeaderScreen } from '@/components/CustomHeaderScreen';
import { router, useLocalSearchParams } from 'expo-router';
import { NavigationState, SceneMap, SceneRendererProps, TabView } from 'react-native-tab-view';
import Tab from '@/components/Tab';
import type { Checklist, Zone } from '@/types/Checklist';
import Tab1Content from '@/components/Tab1Content';
import Tab2Content from '@/components/Tab2Content';
import Tab3Content from '@/components/Tab3Content';
import Tab2ContentEdit from '@/components/Tab2ContentEdit';
import Tab1ContentEdit from '@/components/Tab1ContentEdit';
import Tab3ContentEdit from '@/components/Tab3ContentEdit';
import { fetchDataSaveStorage, getDataFromStorage } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';

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
    const { id, idCheckList, typeCheckList = '1', statusVisible = 'view', tabId = '0', tabIdTMC } = params;
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [index, setIndex] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isFirstTab, setIsFirstTab] = useState(true);
    const [isLastTab, setIsLastTab] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
    const [tabWidths, setTabWidths] = useState<number[]>([]);
    const [isInitialRender, setIsInitialRender] = useState(true);

    const scrollViewRef = useRef<ScrollView>(null);
    const tabsContainerRef = useRef<View>(null);
    const lastValidIndexRef = useRef<number>(0);

    const setIndexWithLog = (newIndex: number, force = false) => {
        if (!force && newIndex === 0 && lastValidIndexRef.current !== 0) {
            return false;
        }
        lastValidIndexRef.current = newIndex;
        setIndex(newIndex);
        return true;
    };

    const loadChecklistsTask = async (forceFetch = false) => {
        const now = Date.now();
        if (!forceFetch && lastFetchTime && now - lastFetchTime < 5000) {
            return;
        }

        try {
            setInitialLoading(true);
            setError(null);
            await Promise.all([
                fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists'),
            ]);
            const loadedChecklists = getDataFromStorage('checklists') || [];
            if (!loadedChecklists.length) {
                setError('Нет данных для отображения');
            }
            setChecklists(loadedChecklists);
            setLastFetchTime(now);

            if (loadedChecklists.length > 0) {
                const checkList = loadedChecklists.find((c) => c.id === id);
                if (checkList?.zones?.length > 0) {
                    let newIndex = 0;
                    setIsFirstTab(true);
                    setIsLastTab(false);

                    if (tabId) {
                        const tabIndex = checkList.zones.findIndex((zone: Zone) => zone.id === tabId);
                        if (tabIndex !== -1) {
                            newIndex = tabIndex;
                            setIsFirstTab(tabIndex === 0);
                            setIsLastTab(tabIndex === checkList.zones.length - 1);
                        }
                    }
                    setIndexWithLog(newIndex);
                }
            }
        } catch (err) {
            setError('Не удалось загрузить данные. Попробуйте ещё раз.');
        } finally {
            setInitialLoading(false);
            setIsInitialRender(false);
        }
    };

    const retryLoadData = () => {
        loadChecklistsTask(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadChecklistsTask();
            return () => {};
        }, [idCheckList, id, tabId])
    );

    const updateCheckList = async () => {
        await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists');
        const updatedChecklists = getDataFromStorage('checklists') || [];
        setChecklists(updatedChecklists);
        setLastFetchTime(Date.now());
    };

    useEffect(() => {
        if (statusVisible === 'edit') {
            updateCheckList();
        }
    }, [statusVisible]);

    const checkList = useMemo(() => {
        return checklists.find((c) => c.id === id);
    }, [checklists, id]);

    const handleNextTab = async () => {
        if (index < routes.length - 1) {
            const newIndex = index + 1;
            if (setIndexWithLog(newIndex)) {
                setIsFirstTab(newIndex === 0);
                setIsLastTab(newIndex === routes.length - 1);
                if (!checkList?.zones?.[newIndex]) {
                    return;
                }
                setIsTabLoading(true);
                const nextTabId = checkList.zones[newIndex].id;
                await updateCheckList();
                setIsTabLoading(false);
            }
        }
    };

    const handlePreviousTab = async () => {
        if (index > 0) {
            const newIndex = index - 1;
            if (setIndexWithLog(newIndex)) {
                setIsFirstTab(newIndex === 0);
                setIsLastTab(newIndex === routes.length - 1);
                if (!checkList?.zones?.[newIndex]) {
                    return;
                }
                setIsTabLoading(true);
                const prevTabId = checkList.zones[newIndex].id;
                await updateCheckList();
                setIsTabLoading(false);
            }
        }
    };

    const handleTabChange = async (newIndex: number, isManual = false) => {
        if (!isManual && isInitialRender && newIndex === 0 && lastValidIndexRef.current !== 0) {
            return;
        }
        if (newIndex !== lastValidIndexRef.current && routes[newIndex]) {
            if (setIndexWithLog(newIndex, isManual)) {
                setIsFirstTab(newIndex === 0);
                setIsLastTab(newIndex === routes.length - 1);
                if (!checkList?.zones?.[newIndex]) {
                    return;
                }
                setIsTabLoading(true);
                const newTabId = checkList.zones[newIndex].id;
                await updateCheckList();
                setIsTabLoading(false);
            }
        }
    };

    const handleFinish = () => {
        if (statusVisible === 'edit') {
            router.push({ pathname: '/starttask', params: { taskId: idCheckList } });
        } else {
            router.push({ pathname: '/details', params: { taskId: idCheckList } });
        }
    };

    const tabsData = useMemo(() => {
        if (!checkList || !checkList.zones || checkList.zones.length === 0) {
            return [{ key: 'tab0', title: 'Нет данных', content: <Text>Нет данных для отображения</Text> }];
        }
        return checkList.zones.map((zone: Zone, key: number) => {
            let tabContent = null;
            if (typeCheckList === '1' && statusVisible === 'view') {
                tabContent = (
                    <Tab1Content
                        itemsTabContent={checkList.zones}
                        index={index}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        isFirstTab={isFirstTab}
                        isLastTab={isLastTab}
                    />
                );
            } else if (typeCheckList === '2' && statusVisible === 'view') {
                tabContent = (
                    <Tab2Content
                        itemsTabContent={checkList.zones}
                        index={index}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        isFirstTab={isFirstTab}
                        isLastTab={isLastTab}
                    />
                );
            } else if (typeCheckList === '3' && statusVisible === 'view') {
                tabContent = (
                    <Tab3Content
                        itemsTabContent={checkList.zones}
                        index={index}
                        tabId={tabIdTMC}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        isFirstTab={isFirstTab}
                        isLastTab={isLastTab}
                    />
                );
            } else if (typeCheckList === '1' && statusVisible === 'edit') {
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
            } else if (typeCheckList === '2' && statusVisible === 'edit') {
                tabContent = (
                    <Tab2ContentEdit
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
            } else if (typeCheckList === '3' && statusVisible === 'edit') {
                tabContent = (
                    <Tab3ContentEdit
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
                    />
                );
            }
            return {
                key: `tab${key}`,
                title: zone.name || 'Без названия',
                content: tabContent || <Text>Компонент не найден</Text>,
                tabColor: zone.badge?.color,
            };
        });
    }, [checkList, typeCheckList, statusVisible, index, isFirstTab, isLastTab, id, idCheckList, tabIdTMC]);

    const finalTabsData = useMemo(() => {
        return tabsData.length > 0
            ? tabsData
            : [{ key: 'tab0', title: 'Нет данных', content: <Text>Нет данных для отображения</Text> }];
    }, [tabsData]);

    const computedRoutes = useMemo(() => {
        return finalTabsData.map((tab) => ({
            key: tab.key,
            title: tab.title,
            tabColor: tab.tabColor,
        }));
    }, [finalTabsData]);

    useEffect(() => {
        if (JSON.stringify(routes) !== JSON.stringify(computedRoutes)) {
            setRoutes(computedRoutes);
            if (lastValidIndexRef.current < computedRoutes.length) {
                setIndex(lastValidIndexRef.current);
            }
            setTabWidths(new Array(computedRoutes.length).fill(0));
        }
    }, [computedRoutes]);

    const renderScene = useMemo(() => {
        const scenes = finalTabsData.reduce((acc, tab) => {
            acc[tab.key] = () => {
                if (isTabLoading) {
                    return (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#017EFA" />
                        </View>
                    );
                }
                if (!tab.content) {
                    return <Text>Компонент не найден</Text>;
                }
                return tab.content;
            };
            return acc;
        }, {} as { [key: string]: () => React.ReactNode });
        return SceneMap(scenes);
    }, [finalTabsData, isTabLoading]);

    const renderLazyPlaceholder = () => {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#017EFA" />
            </View>
        );
    };

    const [tabsWidth, setTabsWidth] = useState(0);
    const { width: screenWidth } = useWindowDimensions();

    const handleTabLayout = (index: number, event: any) => {
        const { width } = event.nativeEvent.layout;
        setTabWidths((prev) => {
            const newWidths = [...prev];
            newWidths[index] = width;
            return newWidths;
        });
    };

    useEffect(() => {
        if (scrollViewRef.current && tabWidths[index] > 0) {
            let offsetX = 0;
            for (let i = 0; i < index; i++) {
                offsetX += tabWidths[i] || 0;
            }
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: offsetX, animated: true });
            }, 100);
        }
    }, [index, tabWidths]);

    const renderTabBar = (
        props: SceneRendererProps & { navigationState: NavigationState<Route> }
    ) => {
        const needsEmptyTab = tabsWidth < screenWidth;
        return (
            <View style={styles.tabBarOuterContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarContainer}
                >
                    <View
                        ref={tabsContainerRef}
                        onLayout={(event) => {
                            const width = event.nativeEvent.layout.width;
                            setTabsWidth(width);
                        }}
                        style={styles.tabsContainer}
                    >
                        {props.navigationState.routes.map((route: Route, i: number) => {
                            const isActive = i === props.navigationState.index;
                            return (
                                <View key={route.key} onLayout={(event) => handleTabLayout(i, event)}>
                                    <Tab
                                        label={route.title ?? ''}
                                        isActive={isActive}
                                        onPress={() => handleTabChange(i, true)}
                                        isLast={i === props.navigationState.routes.length - 1 && !needsEmptyTab}
                                        showDot={statusVisible === 'edit'}
                                        color={route.tabColor}
                                    />
                                </View>
                            );
                        })}
                    </View>
                    {needsEmptyTab && <View style={[styles.emptyTab, { width: screenWidth - tabsWidth }]} />}
                </ScrollView>
            </View>
        );
    };

    if (initialLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            </View>
        );
    }

    if (error && checklists.length === 0) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
                <Button title="Повторить загрузку" onPress={retryLoadData} />
            </View>
        );
    }

    if (!checkList) {
        return (
            <View style={styles.container}>
                <Text>Чек-лист не найден</Text>
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
                <CustomHeaderScreen
                    text={`${checkList?.name || 'Checklist'}`}
                    marginBottom={0}
                    onPress={handleFinish}
                />
            )}

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(newIndex) => handleTabChange(newIndex, false)}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
                swipeEnabled={false}
                lazy={false}
                renderLazyPlaceholder={renderLazyPlaceholder}
                animationEnabled={false}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    emptyTab: {
        height: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        borderLeftColor: '#ECECEC',
        borderLeftWidth: 1,
    },
});

export default memo(ChecklistScreen);
