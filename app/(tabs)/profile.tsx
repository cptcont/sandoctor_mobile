import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { UserSolidIcon, PhoneSolidIcon, EnvelopeSolidIcon } from '@/components/icons/Icons';
import { CustomHeaderScreen } from "@/components/CustomHeaderScreen";
import { useAuth } from '@/context/AuthContext';
import { usePopup } from '@/context/PopupContext';
import { router } from 'expo-router';
import { TextButton } from "@/components/TextButton";
import { Avatar, Input } from '@rneui/themed';
import ImagePickerWithCamera from "@/components/ImagePickerWithCamera";
import { uploadImage } from "@/services/api";
import { Formik } from 'formik';
import * as Yup from 'yup';
import MaskInput from 'react-native-mask-input';

// Схема валидации с Yup
const validationSchema = Yup.object().shape({
    lastName: Yup.string()
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Фамилия должна начинаться с заглавной буквы и содержать только русские буквы')
        .required('Фамилия обязательна для заполнения'),
    firstName: Yup.string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Имя должно начинаться с заглавной буквы и содержать только русские буквы')
        .required('Имя обязательно для заполнения'),
    patronymic: Yup.string()
        .min(2, 'Отчество должно содержать минимум 2 символа')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Отчество должно начинаться с заглавной буквы и содержать только русские буквы')
        .required('Отчество обязательно для заполнения'),
    email: Yup.string()
        .matches(
            /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
            'Email должен соответствовать, user@domain.ru'
        )
        .required('Email обязателен для заполнения'),
    telephone: Yup.string()
        .test('phone-length', 'Номер телефона должен содержать 10 цифр', (value) => {
            if (!value) return false; // Поле обязательное, пустое значение недопустимо
            const digits = value.replace(/\D/g, ''); // Удаляем все нечисловые символы
            const phoneDigits = digits.startsWith('7') ? digits.slice(1) : digits; // Убираем '7', если она есть
            console.log('Phone digits:', phoneDigits, 'Length:', phoneDigits.length); // Для отладки
            return phoneDigits.length === 10; // Проверяем, что ровно 10 цифр
        })
        .required('Телефон обязателен для заполнения'),
});

const ProfileScreen = () => {
    const { userData, setUserDataStorage, getUserDataStorage, updateUserDataOnServer, updateUserDataNow } = useAuth();
    const { showPopup } = usePopup();

    const [pic, setPic] = useState<string>(userData?.pic || '');
    const [tempPic, setTempPic] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true); // Состояние загрузки

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                const storedData = await getUserDataStorage();
                if (storedData && storedData.responce) {
                    setPic(storedData.responce.pic || '');
                    setTempPic(storedData.responce.pic || '');
                } else {
                    setPic(userData?.responce?.pic || '');
                    setTempPic(userData?.responce?.pic || '');
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
                showPopup('Ошибка при загрузке данных', 'red', 2000);
                setPic('');
                setTempPic(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [userData, getUserDataStorage])

    console.log('profile userData:', userData);

    const handleSave = async (values: {
        lastName: string;
        firstName: string;
        patronymic: string;
        telephone: string;
        email: string;
    }) => {
        try {
            const cleanPhone = values.telephone.replace(/\D/g, '').slice(1); // Убираем первую '7' и все нечисловые символы
            const updatedUserData = {

                // Проверяем наличие userData
                last_name: values.lastName,
                first_name: values.firstName,
                patronymic: values.patronymic,
                phone: cleanPhone,
                email: values.email,
                pic: pic || '', // Защита от undefined

            };

            await setUserDataStorage({ responce:updatedUserData });
            await updateUserDataNow();
            const updatedUserDataServer = {

                last_name: values.lastName,
                first_name: values.firstName,
                patronymic: values.patronymic,
                phone: cleanPhone,
                email: values.email,
            };

            // Проверяем наличие id перед вызовом updateUserDataOnServer
            if (userData?.responce?.id) {
                await updateUserDataOnServer(userData.responce.id, updatedUserDataServer);
            }

            if (pic) {
                await uploadImage<{ url: string; thumbUrl: string; name: string }>(
                    `user/${userData?.responce?.id || ''}`, pic );
            }

            showPopup('Данные успешно сохранены', 'green', 2000);
            router.push('/');
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            showPopup('Ошибка при сохранении данных', 'red', 2000);
        }
    };

    // Функция для фильтрации только русских букв
    const handleRussianInput = (text: string) => {
        return text.replace(/[^А-ЯЁа-яё]/g, '');
    };

    // Маска для телефона: +7 (***) ***-**-**
    const PHONE_MASK = [
        '+', '7', ' ', '(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/
    ];

    // Преобразование номера из формата 9857730551 или 79857730551 в +7 (985) 773-05-51
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); // Удаляем все нечисловые символы
        const phoneDigits = digits.startsWith('7') ? digits.slice(1) : digits; // Убираем первую '7', если есть
        if (phoneDigits.length !== 10) return ''; // Если не 10 цифр, возвращаем пустую строку
        return `+7 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 8)}-${phoneDigits.slice(8, 10)}`;
    };

    const handleChangeAvatar = () => {
        setTempPic(pic);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTempPic(null);
    };

    const handleSetAvatar = () => {
        if (tempPic) {
            setPic(tempPic);
        }
        setIsModalVisible(false);
    };

    const handleImageUploaded = (response: { url: string; thumbUrl: string; name: string }) => {
        setTempPic(response.url);
    };

    const handleBack = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#017EFA" />
            </View>
        );
    }

    return (
        <>
            <CustomHeaderScreen text={'Редактировать профиль'} onPress={handleBack} />
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.containerProfile}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            size={60}
                            rounded
                            source={{ uri: pic || 'https://via.placeholder.com/60' }}
                        />
                    </View>
                    <TouchableOpacity onPress={handleChangeAvatar} style={styles.changeAvatar}>
                        <Text style={styles.changeAvatarText}>
                            изменить фото или аватар
                        </Text>
                    </TouchableOpacity>

                    <Formik
                        initialValues={{
                            lastName: userData?.responce?.last_name || '',
                            firstName: userData?.responce?.first_name || '',
                            patronymic: userData?.responce?.patronymic || '',
                            telephone: formatPhoneNumber(userData?.responce?.phone || ''),
                            email: userData?.responce?.email || '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSave}
                        enableReinitialize
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <>
                                <Input
                                    placeholder='Фамилия'
                                    leftIcon={<UserSolidIcon />}
                                    inputContainerStyle={styles.inputContainer}
                                    inputStyle={styles.inputStyle}
                                    label={'Фамилия'}
                                    labelStyle={styles.labelContainer}
                                    leftIconContainerStyle={styles.leftIconContainer}
                                    value={values.lastName}
                                    onChangeText={(text) => {
                                        const filtered = handleRussianInput(text);
                                        handleChange('lastName')(filtered);
                                    }}
                                    onBlur={handleBlur('lastName')}
                                    errorMessage={touched.lastName && errors.lastName ? String(errors.lastName) : undefined}
                                    errorStyle={styles.errorText}
                                    keyboardType="default"
                                    autoCapitalize="sentences"
                                />
                                <Input
                                    placeholder='Имя'
                                    leftIcon={<UserSolidIcon />}
                                    inputContainerStyle={styles.inputContainer}
                                    inputStyle={styles.inputStyle}
                                    label={'Имя'}
                                    labelStyle={styles.labelContainer}
                                    leftIconContainerStyle={styles.leftIconContainer}
                                    value={values.firstName}
                                    onChangeText={(text) => {
                                        const filtered = handleRussianInput(text);
                                        handleChange('firstName')(filtered);
                                    }}
                                    onBlur={handleBlur('firstName')}
                                    errorMessage={touched.firstName && errors.firstName ? String(errors.firstName) : undefined}
                                    errorStyle={styles.errorText}
                                    keyboardType="default"
                                    autoCapitalize="sentences"
                                />
                                <Input
                                    placeholder='Отчество'
                                    leftIcon={<UserSolidIcon />}
                                    inputContainerStyle={styles.inputContainer}
                                    inputStyle={styles.inputStyle}
                                    label={'Отчество'}
                                    labelStyle={styles.labelContainer}
                                    leftIconContainerStyle={styles.leftIconContainer}
                                    value={values.patronymic}
                                    onChangeText={(text) => {
                                        const filtered = handleRussianInput(text);
                                        handleChange('patronymic')(filtered);
                                    }}
                                    onBlur={handleBlur('patronymic')}
                                    errorMessage={touched.patronymic && errors.patronymic ? String(errors.patronymic) : undefined}
                                    errorStyle={styles.errorText}
                                    keyboardType="default"
                                    autoCapitalize="sentences"
                                />
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.labelContainer}>Телефон</Text>
                                    <View style={styles.inputRow}>
                                        <PhoneSolidIcon />
                                        <MaskInput
                                            style={styles.maskInputStyle}
                                            value={values.telephone}
                                            onChangeText={(text) => {
                                                handleChange('telephone')(text);
                                                console.log('Input phone:', text); // Для отладки
                                            }}
                                            onBlur={handleBlur('telephone')}
                                            mask={PHONE_MASK}
                                            placeholder='+7 (***) ***-**-**'
                                            keyboardType="number-pad"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    {touched.telephone && errors.telephone && (
                                        <Text style={styles.errorText}>{String(errors.telephone)}</Text>
                                    )}
                                </View>
                                <Input
                                    placeholder='user@domain.ru'
                                    leftIcon={<EnvelopeSolidIcon />}
                                    inputContainerStyle={styles.inputContainer}
                                    inputStyle={styles.inputStyle}
                                    label={'E-mail'}
                                    labelStyle={styles.labelContainer}
                                    leftIconContainerStyle={styles.leftIconContainer}
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    errorMessage={touched.email && errors.email ? String(errors.email) : undefined}
                                    errorStyle={styles.errorText}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <View style={styles.buttonContainer}>
                                    <TextButton
                                        text={'Сохранить'}
                                        width={134}
                                        height={39}
                                        textSize={16}
                                        textColor={'#FFFFFF'}
                                        backgroundColor={'#017EFA'}
                                        onPress={() => handleSubmit()}
                                    />
                                </View>
                            </>
                        )}
                    </Formik>
                </View>
            </KeyboardAwareScrollView>

            {/* Модальное окно для изменения аватара */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Изменить аватар</Text>
                        <View style={styles.modalImageContainer}>
                            {tempPic ? (
                                <Image source={{ uri: tempPic }} style={styles.previewImage} />
                            ) : (
                                <Text style={styles.noImageText}>Выберите изображение</Text>
                            )}
                            <ImagePickerWithCamera
                                onImageUploaded={handleImageUploaded}
                                viewGallery={true}
                                selected={true}
                                backgroundColor={'#FFF'}
                                borderColor={'#DADADA'}
                            />
                        </View>
                        <View style={styles.buttonModalContainer}>
                            <TextButton
                                text={'Установить'}
                                width={100}
                                height={39}
                                textSize={16}
                                textColor={'#FFFFFF'}
                                backgroundColor={tempPic ? '#017EFA' : '#ccc'}
                                onPress={handleSetAvatar}
                            />
                            <TextButton
                                text={'Закрыть'}
                                width={100}
                                height={39}
                                textSize={16}
                                textColor={'#FFFFFF'}
                                backgroundColor={'#017EFA'}
                                onPress={handleCloseModal}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// Обновленные стили
const styles = StyleSheet.create({
    inputContainer: {
        height: 48,
        width: '100%',
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
        fontSize: 15,
        borderBottomWidth: 0,
    },
    inputStyle: {
        paddingLeft: 10,
        fontSize: 15,
    },
    labelContainer: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#939393',
    },
    leftIconContainer: {
        paddingLeft: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerProfile: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 17,
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
        marginBottom: 40,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Фон с прозрачностью
        width: '100%', // Явно задаем ширину
        height: '100%', // Явно задаем высоту
    },
    modalContainer: {
        width: '80%', // Фиксированная ширина
        maxWidth: 400, // Ограничение максимальной ширины
        backgroundColor: '#F5F7FB',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        // Добавляем тень для лучшей видимости на Android
        elevation: 5, // Для Android
        shadowColor: '#000', // Для iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center', // Явное выравнивание текста
    },
    modalImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%', // Убеждаемся, что контейнер занимает всю ширину
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    noImageText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonModalContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 10, // Добавляем отступы для кнопок
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    inputWrapper: {
        marginBottom: 15,
        width: '94%',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: '100%',
        paddingLeft: 20,
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
    },
    maskInputStyle: {
        flex: 1,
        fontSize: 15,
        paddingLeft: 10,
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProfileScreen;
