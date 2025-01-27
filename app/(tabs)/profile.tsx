import React, { useState, useEffect } from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { UserSolidIcon, PhoneSolidIcon, EnvelopeSolidIcon } from '@/components/icons/Icons';
import { CustomTextInput } from '@/components/CustomTextInput';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { useAuth } from '@/context/AuthContext';
import { usePopup } from '@/context/PopupContext';
import { router } from 'expo-router'
import {TextButton} from "@/components/TextButton";

const ProfileScreen = () => {
    const { userData, setUserDataStorage, getUserDataStorage, updateUserDataOnServer } = useAuth();
    const [lastName, setLastName] = useState(userData?.last_name || '');
    const [firstName, setFirstName] = useState(userData?.first_name || '');
    const [patronymic, setPatronymic] = useState(userData?.patronymic || '');
    const [telephone, setTelephone] = useState(userData?.phone || '');
    const [email, setEmail] = useState(userData?.email || '');
    const [pic, setPic] = useState(userData?.pic || '');
    const [error, setError] = useState('');
    const { showPopup } = usePopup();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await getUserDataStorage();
                if (data && data.responce) {
                    const user = data.responce;
                    setLastName(user.last_name || '');
                    setFirstName(user.first_name || '');
                    setPatronymic(user.patronymic || '');
                    setTelephone(user.phone || '');
                    setEmail(user.email || '');
                    setPic(user.pic || '');
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
                showPopup('Ошибка при загрузке данных', 'red', 2000);
            }
        };

        loadUserData();
    }, [getUserDataStorage]);

    const handleSave = async () => {
        try {
            const updatedUserData = {
                responce: {
                    ...userData.responce,
                    last_name: lastName,
                    first_name: firstName,
                    patronymic: patronymic,
                    phone: telephone,
                    email: email,
                },
            };

            await setUserDataStorage(updatedUserData);
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            showPopup('Ошибка при сохранении данных в хранилище', 'red', 2000);
        }

        try {
            const updatedUserDataServer = {
                ...userData.responce,
                last_name: lastName,
                first_name: firstName,
                patronymic: patronymic,
                phone: telephone,
                email: email,
            };

            const updatedData = await updateUserDataOnServer(userData.responce.id, updatedUserDataServer);
            await setUserDataStorage(updatedData);
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            showPopup('Ошибка при сохранении данных на сервере', 'red', 2000);
        }
        showPopup('Данные успешно сохранены', 'green', 2000);
        router.push('/');
    };

    const handleChangeAvatar = () => {
        // Логика для изменения аватара
    };

    const handleBack = async () => {
        router.push('/');
    }

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled">

            <CustomHeaderScreen text={'Редактировать профиль'} marginBottom={21} onPress={handleBack}/>

            <View style={styles.containerProfile}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={pic ? { uri: pic } : require('@/assets/icons/avatar-logo.png')}
                        style={styles.logo}
                    />
                </View>

                <Pressable onPress={handleChangeAvatar} style={styles.changeAvatar}>
                    <Text style={styles.changeAvatarText}>
                        изменить фото или аватар
                    </Text>
                </Pressable>

                <CustomTextInput
                    icon={<UserSolidIcon />}
                    text={'Фамилия'}
                    placeholder=""
                    value={lastName}
                    onChangeText={setLastName}
                    marginBottom={15}
                />

                <CustomTextInput
                    icon={<UserSolidIcon />}
                    text={'Имя'}
                    placeholder=""
                    value={firstName}
                    onChangeText={setFirstName}
                    marginBottom={15}
                />

                <CustomTextInput
                    icon={<UserSolidIcon />}
                    text={'Отчество'}
                    placeholder=""
                    value={patronymic}
                    onChangeText={setPatronymic}
                    marginBottom={15}
                />

                <CustomTextInput
                    icon={<PhoneSolidIcon />}
                    text={'Телефон'}
                    placeholder=""
                    value={telephone}
                    onChangeText={setTelephone}
                    marginBottom={15}
                />

                <CustomTextInput
                    icon={<EnvelopeSolidIcon />}
                    text={'E-mail'}
                    placeholder=""
                    value={email}
                    onChangeText={setEmail}
                    marginBottom={15}
                />

                <View style={styles.buttonContainer}>
                    <TextButton
                        text={'Cохранить'}
                        type={'primary'}
                        size={134}
                        onPress={handleSave}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerProfile: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 31,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 17,
    },
    logo: {
        resizeMode: 'contain',
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    changeAvatar: {
        marginBottom: 28,
    },
    changeAvatarText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        color: '#017EFA',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        width: 201,
        backgroundColor: '#017EFA',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
