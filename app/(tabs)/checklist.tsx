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
import type { Task } from '@/types/Task';
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
    console.log('ChecklistScreen params:', params);
    const { id, idCheckList, typeCheckList = '1', statusVisible = 'view', tabId, tabIdTMC } = params;
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

    const scrollViewRef = useRef<ScrollView>(null);
    const tabsContainerRef = useRef<View>(null);

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
                fetchDataSaveStorage<Task>(`task/${idCheckList}`, 'task'),
            ]);
            const loadedChecklists = getDataFromStorage('checklists') || [];
            console.log('Loaded checklists:', loadedChecklists);
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

                    if (tabId || tabIdTMC) {
                        const tabIndex = checkList.zones.findIndex(
                            (zone: Zone) => zone.id === tabId || zone.id === tabIdTMC
                        );
                        if (tabIndex !== -1) {
                            newIndex = tabIndex;
                            setIsFirstTab(tabIndex === 0);
                            setIsLastTab(tabIndex === checkList.zones.length - 1);
                        }
                    }
                    setIndex(newIndex);
                } else {
                    console.warn('No zones in checklist');
                }
            }
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные. Попробуйте ещё раз.');
        } finally {
            setInitialLoading(false);
        }
    };

    const retryLoadData = () => {
        loadChecklistsTask(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadChecklistsTask();
            return () => {};
        }, [idCheckList, id, tabId, tabIdTMC])
    );

    const updateCheckList = async () => {
        console.log('Starting updateCheckList');
        await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists');
        const updatedChecklists = getDataFromStorage('checklists') || [];
        console.log('Updated checklists:', updatedChecklists);
        setChecklists(updatedChecklists);
        setLastFetchTime(Date.now());
        console.log('Finished updateCheckList');
    };

    useEffect(() => {
        if (statusVisible === 'edit') {
            updateCheckList();
        }
    }, [statusVisible]);

    const checkList = useMemo(() => {
        const found = checklists.find((c) => c.id === id);
        if (!found) {
            console.warn('Checklist not found for id:', id);
        }
        return found;
    }, [checklists, id]);

    const handleNextTab = async () => {
        if (index < routes.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
            setIsFirstTab(newIndex === 0);
            setIsLastTab(newIndex === routes.length - 1);
            if (!checkList?.zones?.[newIndex]) {
                console.warn('No zone data for next tab');
                return;
            }
            setIsTabLoading(true);
            const nextTabId = checkList.zones[newIndex].id;
            await updateCheckList();
            router.setParams({
                tabId: nextTabId,
                tabIdTMC,
            });
            setIsTabLoading(false);
        }
    };

    const handlePreviousTab = async () => {
        if (index > 0) {
            const newIndex = index - 1;
            setIndex(newIndex);
            setIsFirstTab(newIndex === 0);
            setIsLastTab(newIndex === routes.length - 1);
            if (!checkList?.zones?.[newIndex]) {
                console.warn('No zone data for previous tab');
                return;
            }
            setIsTabLoading(true);
            const prevTabId = checkList.zones[newIndex].id;
            await updateCheckList();
            router.setParams({
                tabId: prevTabId,
                tabIdTMC,
            });
            setIsTabLoading(false);
        }
    };

    const handleTabChange = async (newIndex: number) => {
        setIndex(newIndex);
        setIsFirstTab(newIndex === 0);
        setIsLastTab(newIndex === routes.length - 1);
        if (!checkList?.zones?.[newIndex]) {
            console.warn('No zone data for tab index:', newIndex);
            return;
        }
        setIsTabLoading(true);
        const currentTabId = checkList.zones[newIndex].id;
        await updateCheckList();
        router.setParams({
            tabId: currentTabId,
            tabIdTMC,
        });
        setIsTabLoading(false);
    };

    const handleFinish = () => {
        if (statusVisible === 'edit') {
            router.push({ pathname: '/starttask', params: { taskId: idCheckList } });
        } else {
            router.push({ pathname: '/details', params: { taskId: idCheckList } });
        }
    };

    const tabsData = useMemo(() => {
        console.log('Forming tabsData with:', { checkList, typeCheckList, statusVisible, index });
        if (!checkList || !checkList.zones || checkList.zones.length === 0) {
            console.warn('checkList or zones is empty');
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
            console.log(`Tab ${key} content:`, tabContent);
            return {
                key: `tab${key}`,
                title: zone.name || 'Без названия',
                content: tabContent || <Text>Компонент не найден</Text>,
                tabColor: zone.badge?.color,
            };
        });
    }, [checkList, typeCheckList, statusVisible, index, isFirstTab, isLastTab, id, idCheckList, tabIdTMC]);

    const finalTabsData = useMemo(() => {
        console.log('Final tabsData:', tabsData);
        return tabsData.length > 0
            ? tabsData
            : [{ key: 'tab0', title: 'Нет данных', content: <Text>Нет данных для отображения</Text> }];
    }, [tabsData]);

    useEffect(() => {
        const newRoutes = finalTabsData.map((tab) => ({
            key: tab.key,
            title: tab.title,
            tabColor: tab.tabColor,
        }));
        setRoutes((prevRoutes) => {
            if (JSON.stringify(prevRoutes) !== JSON.stringify(newRoutes)) {
                setTabWidths(new Array(newRoutes.length).fill(0));
                return newRoutes;
            }
            return prevRoutes;
        });
    }, [finalTabsData]);

    const renderScene = useMemo(() => {
        const scenes = finalTabsData.reduce((acc, tab) => {
            acc[tab.key] = () => {
                if (isTabLoading) {
                    console.log('Showing tab spinner for tab:', tab.key);
                    return (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#017EFA" />
                        </View>
                    );
                }
                if (!tab.content) {
                    console.warn(`No content for tab ${tab.key}`);
                    return <Text>Компонент не найден</Text>;
                }
                return tab.content;
            };
            return acc;
        }, {} as { [key: string]: () => React.ReactNode });
        return SceneMap(scenes);
    }, [finalTabsData, isTabLoading]);

    const renderLazyPlaceholder = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#017EFA" />
        </View>
    );

    const [tabsWidth, setTabsWidth] = useState(0);
    const { width: screenWidth } = useWindowDimensions();

    const handleTabLayout = (index: number, event: any) => {
        const { width } = event.nativeEvent.layout;
        setTabWidths((prev) => {
            const newWidths = [...prev];
            newWidths[index] = width;
            console.log(`Tab ${index} width: ${width}, all widths:`, newWidths);
            return newWidths;
        });
    };

    useEffect(() => {
        if (scrollViewRef.current && tabWidths[index] > 0) {
            let offsetX = 0;
            for (let i = 0; i < index; i++) {
                offsetX += tabWidths[i] || 0;
            }
            console.log(`Preparing to scroll to tab ${index}, offsetX: ${offsetX}, tabWidths:`, tabWidths);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: offsetX, animated: true });
                console.log(`Scrolled to tab ${index} at offset ${offsetX}`);
            }, 100);
        } else {
            console.warn(`Cannot scroll: scrollViewRef=${!!scrollViewRef.current}, tabWidth=${tabWidths[index]}`);
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
                            console.log('Tabs container width:', width);
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
                                        onPress={() => handleTabChange(i)}
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
                    {/*<Text style={styles.loadingText}>Загрузка данных...</Text>*/}
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
                onIndexChange={handleTabChange}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
                swipeEnabled={false}
                lazy={true}
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
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#1C1F37',
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
    footerContainer: {
        paddingHorizontal: 18,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default memo(ChecklistScreen);
