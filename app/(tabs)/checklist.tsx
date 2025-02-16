import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions,} from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { router, useLocalSearchParams } from "expo-router";
import { NavigationState, Route, SceneMap, SceneRendererProps, TabView } from "react-native-tab-view";
import Tab from "@/components/Tab";
import {useApi} from "@/context/ApiContext";
import type {Checklist, Zone} from "@/types/Checklist";
import Tab1Content from "@/components/Tab1Content";
import Tab2Content from "@/components/Tab2Content";
import Tab3Content from "@/components/Tab3Content";

interface TabContent {
    key: string;
    title: string;
    content: React.ReactNode;
}

const ChecklistScreen = () => {
    const { checklists, fetchData } = useApi();
    const params = useLocalSearchParams();
    const { id, idTask, idCheckList, typeCheckList} = params;

    // Состояние для управления текущим tabId
    const [tabId, setTabId] = useState(0);

    // Устанавливаем начальное значение tabId при монтировании компонента
    useEffect(() => {
        const loadChecklist = async () => {
            if (!checkList) {
                await fetchData<Checklist>(`checklist/${idCheckList}/`, 'checklists'); // Указываем только endpoint
            }
        };
        const initialTabId = parseInt(Array.isArray(id) ? id[0] : id, 10);
        setTabId(initialTabId);
        loadChecklist();
    }, [id, fetchData]); // Зависимость от id, чтобы обновить tabId при изменении id

    const checkList = (checklists || []).filter((checklist: Checklist) => {
        return checklist.id === idCheckList;
    }).flat()[0];

    const handleFinish = () => {
        router.push({
            pathname: '/details',
            params: {
                taskId: idTask,
            }
        });
    };

    const itemsTabContent =
        checkList.zones.map((zone : Zone) =>
            zone
        );

    const tabsData: TabContent[] = checkList.zones.map((data: Checklist, index: number) => {
        let tabContent = null;
        if (typeCheckList === '1') {
            tabContent = <Tab1Content itemsTabContent={itemsTabContent} index={index} />;
        } else if (typeCheckList === '2') {
            tabContent = <Tab2Content itemsTabContent={itemsTabContent} index={index} />;
        }else if (typeCheckList === '3') {
            tabContent = <Tab3Content itemsTabContent={itemsTabContent} index={index} />;
        }

        return {
            key: `tab${index}`,
            title: data.name,
            content: tabContent,
        };
    });
    const [index, setIndex] = useState(0);
    const [routes] = useState(
        tabsData.map(tab => ({ key: tab.key, title: tab.title }))
    );

    const renderScene = SceneMap(
        tabsData.reduce((acc, tab) => {
            acc[tab.key] = () => tab.content; // tab.content — это React.ReactNode
            return acc;
        }, {} as { [key: string]: () => React.ReactNode }) // Используем React.ReactNode
    );

    const tabsContainerRef = useRef<View>(null);
    const [tabsWidth, setTabsWidth] = useState(0); // Ширина контейнера табов
    const { width: screenWidth } = useWindowDimensions(); // Динамическая ширина экрана

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
            <CustomHeaderScreen text={`${checkList.name}`} marginBottom={0} onPress={handleFinish} />
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
    text: {
        marginBottom: 13,
    },
    title: {
        fontSize:12,
        fontWeight: 'bold',
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
        marginBottom: 14, // marginRight для всех, кроме последнего
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
