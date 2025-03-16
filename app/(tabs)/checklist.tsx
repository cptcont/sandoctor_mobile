import React, {useState, useEffect, useRef, memo, useMemo} from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Text} from 'react-native';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { router, useLocalSearchParams } from "expo-router";
import { NavigationState, Route, SceneMap, SceneRendererProps, TabView } from "react-native-tab-view";
import Tab from "@/components/Tab";
import type {Checklist, Zone} from "@/types/Checklist";
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

} from '@/services/api'
import type {Task} from "@/types/Task";

interface TabContent {
    key: string;
    title: string;
    content: React.ReactNode;
}

const ChecklistScreen = memo(() => {
    //const { checklists, fetchData } = useApi();
    const params = useLocalSearchParams();
    const { id, idTask, idCheckList, typeCheckList, statusVisible } = params;
    const [checklists, setChecklists] = useState<Checklist[]>(getDataFromStorage('checklists'));
    const [index, setIndex] = useState(0);
    console.log('Это checklist');

    const loadChecklistsTask = async () => {
        await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists' );
        await fetchDataSaveStorage<Task>(`task/${idCheckList}`, 'task' );
    };

    // Устанавливаем начальное значение tabId при монтировании компонента
    useEffect(
        () => {
            const loadChecklist = async () => {
                if (!checklists) {
                   // await fetchData<Checklist>(`checklist/${idCheckList}/`, 'checklists'); // Указываем только endpoint
                   // console.log('ChecklistUseEffect[]',checklists);
                }
            };
            //console.log('ChecklistUseEffect',checklists);
            loadChecklist();
        }, [checklists]
    );

    useEffect(() => {
        //console.log("Hi useEffect checklist New")
    }, []);
    const updateCheckList = async () => {
        await fetchDataSaveStorage<Checklist>(`checklist/${idCheckList}`, 'checklists' );
    }
    if (statusVisible === 'edit') {
        updateCheckList();
//        console.log('checklist update');
    }
console.log("id",id)
    const checkList =
        (checklists || []).filter((checklist: Checklist) => {return checklist.id === id;}).flat()[0];
    //saveDataToStorage('checklist', checkList.zones);
//    const itemsTabContent = useMemo(() => {
//        if (!checkList) return [];/
//        return checkList.zones.map((zone : Zone) =>
//            zone
//        );
//    }, [checkList]);

//    if (!checklists || !checkList) {
//        return (
//            <View>
//                <Text>Загрузка...</Text>
//            </View>
//        );
//    }


    // Функция для перехода на следующую вкладку
    const handleNextTab = () => {
        if (index < routes.length - 1) {
            setIndex(index + 1); // Переключаемся на следующую вкладку
        } else {
            console.log('Это последняя вкладка'); // Действие, если вкладки закончились
        }
    };

    // Функция для перехода на предыдущую вкладку
    const handlePreviousTab = async () => {
        if (index > 0) {
            setIndex(index - 1); // Переключаемся на предыдущую вкладку
            //await fetchData(`checklist/${idCheckList}/`, 'checklists');
        } else {
            console.log('Это первая вкладка'); // Действие, если вкладка первая
        }
    };

    const handleFinish = () => {
        if (statusVisible ==='edit') {
            loadChecklistsTask();
            router.push({
                pathname: '/starttask',
                params: {
                    taskId: idTask,
                }
            });
        } else {
            router.push({
                pathname: '/details',
                params: {
                    taskId: idTask,
                }
            });
        }
    };

    const tabsData: TabContent[] = useMemo(() => {


        return checkList.zones.map((zone: Zone, key: number) => {
            let tabContent = null;

            // Определяем содержимое вкладки в зависимости от typeCheckList и statusVisible
            if (typeCheckList === '1' && statusVisible === 'view') {
                tabContent = <Tab1Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                />;
            }
            if (typeCheckList === '2' && statusVisible === 'view') {
                tabContent = <Tab2Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                />;
            }
            if (typeCheckList === '3' && statusVisible === 'view') {
                tabContent = <Tab3Content
                    itemsTabContent={checkList.zones}
                    index={index}
                    onNextTab={handleNextTab}
                    onPreviousTab={handlePreviousTab}
                />;
            }

            if (typeCheckList === '1' && statusVisible === 'edit') {
                tabContent = (
                    <Tab1ContentEdit
                        id={id}
                        index={index}
                        idTask={idTask}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        idCheckList={idCheckList}

                    />
                );
            }
            if (typeCheckList === '2' && statusVisible === 'edit') {
                tabContent = (
                    <Tab2ContentEdit
                        id={id}
                        index={index}
                        idTask={idTask}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        idCheckList={idCheckList}
                    />
                );
            }
            if (typeCheckList === '3' && statusVisible === 'edit') {
                tabContent = (
                    <Tab3ContentEdit
                        checklistSort={checkList}
                        id={id}
                        index={index}
                        idTask={idTask}
                        onNextTab={handleNextTab}
                        onPreviousTab={handlePreviousTab}
                        idCheckList={idCheckList} />
            )
            }

            return {
                key: `tab${key}`,
                title: zone.name,
                content: tabContent,
            };
        });
    }, [handleNextTab, handlePreviousTab]);

    const finalTabsData = tabsData.length > 0 ? tabsData : [
        {
            key: 'tab0',
            title: 'Нет данных',
            content: <View><Text>Нет данных для отображения</Text></View>,
        },
    ];
//    console.log('tabsData', tabsData);
//    console.log('CheckList.Progress', checkList.progress);



    const [routes] = useState(
        finalTabsData.map(tab => ({ key: tab.key, title: tab.title }))
    );
//    console.log('checklist', routes);
    const renderScene = SceneMap(
        finalTabsData.reduce((acc, tab) => {
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
                                    showDot={statusVisible === 'edit'}
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
            {statusVisible === 'edit' && (
                <CustomHeaderScreen
                    text={`${checkList.name}`}
                    marginBottom={0}
                    onPress={handleFinish}
                    progress={checkList.progress}
                    progressVisible={true}
                />
            )}
            {statusVisible === 'view' && (
                <CustomHeaderScreen text={`${checkList.name}`} marginBottom={0} onPress={handleFinish} />
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
