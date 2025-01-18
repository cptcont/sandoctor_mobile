import { NavigatorScreenParams } from '@react-navigation/native';

// Типы для корневого стека
export type RootStackParamList = {
    Login: undefined; // Экран авторизации
    ForgotPassword: undefined; // Экран восстановления пароля
    Tabs: NavigatorScreenParams<TabsParamList>; // Вложенный навигатор (Drawer или Tabs)
    NotFound: undefined; // Экран "Не найдено"
};

// Типы для вложенного навигатора (Drawer или Tabs)
export type TabsParamList = {
    Home: undefined; // Главная страница
    Objects: undefined; // Объекты
    Buildings: undefined; // Здания
    QRCode: undefined; // QR-код
};

// Расширяем типы для useNavigation
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
