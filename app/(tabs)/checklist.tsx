import React, { useState, useMemo, memo } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, Button, ActivityIndicator } from 'react-native';
import { CustomHeaderScreen } from '@/components/CustomHeaderScreen';
import { router, useLocalSearchParams } from 'expo-router';
import { NavigationState, SceneMap, SceneRendererProps, TabView } from 'react-native-tab-view';
import Tab from '@/components/Tab';
import type { Checklist, Zone } from '@/types/Checklist';
import Tab1Content from '@/components/Tab1Content';
import Tab2Content from '@/components/Tab2Content';
import Tab3Content from '@/components/Tab3Content';
import Tab2ContentEdit from '@/components/Tab2ContentEdit';
import Tab3ContentEdit from '@/components/Tab3ContentEdit';
import { fetchDataSaveStorage, getDataFromStorage } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { usePopup } from '@/context/PopupContext';

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isFirstTab, setIsFirstTab] = useState(true);
    const [isLastTab, setIsLastTab] = useState(false);
    const { showPopup } = usePopup();
    const { width: screenWidth } = useWindowDimensions();

    // Загрузка данных чек-листа
    const loadChecklists = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists');
            const loadedChecklists = (await getDataFromStorage('checklists')) || [];
            if (!loadedChecklists.length) {
                setError('Нет данных для отображения');
                setChecklists([]);
                return;
            }

            setChecklists(loadedChecklists);
            const checkList = loadedChecklists.find((c) => c.id === id);
            if (checkList?.zones?.length) {
                let newIndex = 0;
                if (tabId) {
                    const tabIndex = checkList.zones.findIndex((zone: Zone) => zone.id === tabId);
                    if (tabIndex !== -1) newIndex = tabIndex;
                }
                console.log('loadChecklists:', {
                    newIndex,
                    zonesLength: checkList.zones.length,
                    isFirstTab: newIndex === 0,
                    isLastTab: newIndex === checkList.zones.length - 1,
                }); // Отладка
                setIndex(newIndex);
                setIsFirstTab(newIndex === 0);
                setIsLastTab(newIndex === checkList.zones.length - 1);
                setRoutes(checkList.zones.map((zone, i) => ({
                    key: `tab${i}`,
                    title: zone.name || 'Без названия',
                    tabColor: zone.badge?.color,
                })));
            } else {
                setIndex(0);
                setIsFirstTab(true);
                setIsLastTab(true);
                setRoutes([]);
            }
        } catch (err) {
            setError('Не удалось загрузить данные');
            setChecklists([]);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadChecklists();
            return () => {
                setChecklists([]);
                setIndex(0);
                setIsLoading(true);
                setError(null);
                setRoutes([]);
            };
        }, [idCheckList, id, tabId, tabIdTMC])
    );

    const checkList = useMemo(() => checklists.find((c) => c.id === id), [checklists, id]);

    // Обновление данных чек-листа
    const updateCheckList = async () => {
        try {
            await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists');
            const updatedChecklists = (await getDataFromStorage('checklists')) || [];
            setChecklists(updatedChecklists);
        } catch (err) {
            setError('Не удалось обновить данные');
        }
    };

    // Переключение вкладок
    const handleTabChange = async (newIndex: number) => {
        if (newIndex === index || !checkList?.zones?.[newIndex] || newIndex < 0 || newIndex >= routes.length) return;
        console.log('handleTabChange:', {
            newIndex,
            routesLength: routes.length,
            isFirstTab: newIndex === 0,
            isLastTab: newIndex === routes.length - 1,
        }); // Отладка
        setIndex(newIndex);
        setIsFirstTab(newIndex === 0);
        setIsLastTab(newIndex === routes.length - 1);
        setIsLoading(true);
        showPopup(`Зона ${checkList.zones[newIndex].name || 'Без названия'}`, 'green', 2000);
        await updateCheckList();
        setIsLoading(false);
    };

    const handleNextTab = () => handleTabChange(index + 1);
    const handlePreviousTab = () => handleTabChange(index - 1);

    const handleFinish = () => {
        router.push({
            pathname: statusVisible === 'edit' ? '/starttask' : '/details',
            params: { taskId: idCheckList },
        });
    };

    const retryLoadData = () => loadChecklists();

    // Формирование данных для вкладок
    const tabsData = useMemo(() => {
        if (!checkList?.zones?.length) {
            return [{ key: 'tab0', title: 'Нет данных', content: <Text>Нет данных для отображения</Text> }];
        }
        return checkList.zones.map((zone: Zone, key: number) => {
            let tabContent = null;
            if (typeCheckList === '1' && statusVisible === 'view') {
                tabContent = <Tab1Content itemsTabContent={checkList.zones} index={index} />;
            } else if (typeCheckList === '2' && statusVisible === 'view') {
                tabContent = <Tab2Content itemsTabContent={checkList.zones} index={index} />;
            } else if (typeCheckList === '3' && statusVisible === 'view') {
                tabContent = <Tab3Content itemsTabContent={checkList.zones} index={index} tabId={tabIdTMC} />;
            } else if (typeCheckList === '1' && statusVisible === 'edit') {
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
                        zoneId={zone.id}
                        onReload={updateCheckList}
                    />
                );
            }
            console.log('tabsData:', { key, isLastTab: key === checkList.zones.length - 1 }); // Отладка
            return {
                key: `tab${key}`,
                title: zone.name || 'Без названия',
                content: tabContent || <Text>Компонент не найден</Text>,
                tabColor: zone.badge?.color,
            };
        });
    }, [checkList, typeCheckList, statusVisible, index, isFirstTab, isLastTab, id, idCheckList, tabIdTMC]);

    const computedRoutes = useMemo(() =>
            tabsData.map((tab) => ({ key: tab.key, title: tab.title, tabColor: tab.tabColor })),
        [tabsData]
    );

    // Рендеринг сцен для TabView
    const renderScene = useMemo(() => {
        const scenes = tabsData.reduce((acc, tab) => {
            acc[tab.key] = () => (isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            ) : tab.content);
            return acc;
        }, {} as { [key: string]: () => React.ReactNode });
        return SceneMap(scenes);
    }, [tabsData, isLoading]);

    // Кастомный рендеринг панели вкладок
    const renderTabBar = (props: SceneRendererProps & { navigationState: NavigationState<Route> }) => (
        <View style={styles.tabBarContainer}>
            {props.navigationState.routes.map((route: Route, i: number) => (
                <Tab
                    key={route.key}
                    label={route.title ?? ''}
                    isActive={i === index}
                    onPress={() => handleTabChange(i)}
                    showDot={statusVisible === 'edit'}
                    color={route.tabColor}
                />
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#017EFA" />
                </View>
            </View>
        );
    }

    if (error || !checkList) {
        return (
            <View style={styles.container}>
                <Text>{error || 'Чек-лист не найден'}</Text>
                <Button title="Повторить загрузку" onPress={retryLoadData} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeaderScreen
                text={checkList?.name || 'Checklist'}
                marginBottom={0}
                onPress={handleFinish}
                progress={statusVisible === 'edit' ? checkList?.progress : undefined}
                progressVisible={statusVisible === 'edit'}
            />
            <TabView
                navigationState={{ index, routes: computedRoutes }}
                renderScene={renderScene}
                onIndexChange={handleTabChange}
                initialLayout={{ width: screenWidth }}
                renderTabBar={renderTabBar}
                swipeEnabled={false}
                lazy={false}
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
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: 30,
    },
});

export default memo(ChecklistScreen);
