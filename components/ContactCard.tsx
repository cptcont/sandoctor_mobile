import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, PermissionsAndroid, Platform, Alert } from 'react-native';

type Contact = {
    id: string;
    fio: string;
    phone_1: string;
    phone_2?: string;
    email?: string;
    position: string;
};

type ContactCardProps = {
    contacts: Contact[];
};

const ContactCard = ({ contacts }: ContactCardProps) => {
    const cleanPhoneNumber = (phone: string) => {
        return phone.replace(/[^\d+]/g, '');
    };

    const requestPhonePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                console.log('Проверка разрешения CALL_PHONE');
                const alreadyGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
                console.log('alreadyGranted:', alreadyGranted);
                if (alreadyGranted) {
                    return true;
                }

                console.log('Запрос разрешения CALL_PHONE');
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
                    {
                        title: 'Разрешение на звонки',
                        message: 'Приложению Sandoctor требуется разрешение для совершения звонков.',
                        buttonNeutral: 'Спросить позже',
                        buttonNegative: 'Отмена',
                        buttonPositive: 'Разрешить',
                    }
                );
                console.log('granted:', granted);

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    Alert.alert(
                        'Разрешение отклонено',
                        'Вы отклонили разрешение на звонки и выбрали "Больше не спрашивать". Чтобы включить звонки, перейдите в Настройки → Приложения → Sandoctor → Разрешения и разрешите доступ к телефону.',
                        [
                            { text: 'Отмена', style: 'cancel' },
                            { text: 'Открыть настройки', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return false;
                } else {
                    Alert.alert('Ошибка', 'Разрешение на звонки не предоставлено');
                    return false;
                }
            } catch (err) {
                console.warn('Ошибка при запросе разрешения:', err);
                Alert.alert('Ошибка', 'Не удалось запросить разрешение на звонки');
                return false;
            }
        }
        return true; // На iOS разрешение не требуется
    };

    const handlePhonePress = async (phone: string) => {
        const cleanedPhone = cleanPhoneNumber(phone);
        const phoneUrl = `tel:${cleanedPhone}`;

        const hasPermission = await requestPhonePermission();
        if (hasPermission) {
            try {
                console.log('Проверка поддержки tel:', phoneUrl);
                const supported = await Linking.canOpenURL(phoneUrl);
                console.log('supported:', supported);
                if (supported) {
                    await Linking.openURL(phoneUrl);
                } else {
                    console.log('Попытка открыть tel напрямую');
                    await Linking.openURL(phoneUrl).catch(() => {
                        Alert.alert('Ошибка', 'Вызов телефона не поддерживается на этом устройстве');
                    });
                }
            } catch (err) {
                console.error('Ошибка при открытии URL телефона:', err);
                Alert.alert('Ошибка', 'Не удалось выполнить звонок: ' + err.message);
            }
        }
    };

    const handleEmailPress = async (email: string) => {
        const emailUrl = `mailto:${email}`;

        try {
            console.log('Проверка поддержки mailto:', emailUrl);
            const supported = await Linking.canOpenURL(emailUrl);
            console.log('supported:', supported);
            if (supported) {
                await Linking.openURL(emailUrl);
            } else {
                console.log('Попытка открыть mailto напрямую');
                await Linking.openURL(emailUrl).catch(() => {
                    Alert.alert('Ошибка', 'Отправка email не поддерживается на этом устройстве');
                });
            }
        } catch (err) {
            console.error('Ошибка при открытии URL email:', err);
            Alert.alert('Ошибка', 'Не удалось открыть почтовый клиент: ' + err.message);
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{'Контактные лица'}</Text>
            {contacts.map((contact) => (
                <View key={`contact-${contact.id}`} style={styles.contactContainer}>
                    <View style={styles.container}>
                        <View style={{ width: '50%' }}>
                            <Text style={styles.name}>{contact.fio}</Text>
                            <Text style={styles.post}>{contact.position}</Text>
                            {contact.email ? (
                                <TouchableOpacity onPress={() => handleEmailPress(contact.email)}>
                                    <Text style={[styles.email, styles.clickable]}>{contact.email}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <View style={{ width: '50%' }}>
                            {contact.phone_1 ? (
                                <TouchableOpacity onPress={() => handlePhonePress(contact.phone_1)}>
                                    <Text style={[styles.tel, styles.clickable]}>{contact.phone_1}</Text>
                                </TouchableOpacity>
                            ) : null}
                            {contact.phone_2 ? (
                                <TouchableOpacity onPress={() => handlePhonePress(contact.phone_2)}>
                                    <Text style={[styles.tel, styles.clickable]}>{contact.phone_2}</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
    },
    title: {
        paddingHorizontal: 13,
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
        color: '#1B2B65',
        paddingBottom: 15,
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    contactContainer: {
        marginBottom: 15,
    },
    container: {
        paddingHorizontal: 13,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1C1F37',
        marginBottom: 5,
    },
    post: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#939393',
        marginBottom: 5,
    },
    tel: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#000',
        marginBottom: 5,
    },
    email: {
        fontSize: 12,
        fontWeight: 'medium',
        color: '#1B2B65',
        marginBottom: 5,
    },
    clickable: {
        color: '#1B2B65',
        textDecorationLine: 'underline',
    },
});

export default ContactCard;
