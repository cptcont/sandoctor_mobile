import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from "expo-router";
import { UserSolidIcon } from "@/components/icons/Icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Button } from '@rneui/themed';
import { usePopup } from "@/context/PopupContext";

const ForgotPasswordScreen = () => {
    const { showPopup } = usePopup();

    // Схема валидации
    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Введите email или телефон')
            .test('is-email-or-phone', 'Введите корректный email или номер телефона', (value) => {
                if (!value) return false;

                // Проверка на email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isEmailValid = emailRegex.test(value);

                // Проверка на телефон:
                // 1. +79991234567 (12 символов, начинается с +7 и 10 цифр)
                // 2. 89991234567 (11 цифр, начинается с 8)
                const cleanedValue = value.replace(/[\s()-]/g, '');
                const phoneRegexPlus7 = /^\+7\d{10}$/;
                const phoneRegex8 = /^8\d{10}$/;
                const isPhoneValid =
                    (phoneRegexPlus7.test(cleanedValue) && cleanedValue.length === 12) ||
                    (phoneRegex8.test(cleanedValue) && cleanedValue.length === 11);

                return isEmailValid || isPhoneValid;
            }),
    });

    const handleLogin = () => {
        router.push('/LoginScreen');
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/images/logo-login.png')}
                        style={styles.logo}
                    />
                </View>
                <Formik
                    initialValues={{ username: '' }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setSubmitting(true); // Устанавливаем состояние отправки
                        try {
                            let usernameToSend = values.username;
                            // Если это номер телефона, отправляем только последние 10 цифр
                            const cleanedValue = values.username.replace(/[\s()-]/g, '');
                            if (cleanedValue.match(/^\+7\d{10}$/) || cleanedValue.match(/^8\d{10}$/)) {
                                usernameToSend = cleanedValue.slice(-10);
                            }

                            console.log('forgotpassword', usernameToSend);
                            const response = await fetch('https://sandoctor.ru/api/v1/forgotpassword/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ username: usernameToSend }),
                            });

                            // Проверяем, успешен ли запрос
                            if (!response.ok) {
                                // Извлекаем тело ответа как JSON
                                const errorData = await response.json();
                                // Предполагаем, что API возвращает сообщение об ошибке в поле, например, 'message' или 'error'
                                const errorMessage = errorData.message || errorData.error || 'Неизвестная ошибка';
                                throw new Error(errorMessage);
                            }

                            showPopup('Cсылка на восстановление успешно отправлена', 'green', 3000);
                            router.push('/LoginScreen');
                        } catch (error) {
                            //console.log("error", error);
                            // Отображаем текст ошибки из ответа API
                            showPopup(`${error.message}`, 'red', 2000);
                        } finally {
                            setSubmitting(false); // Сбрасываем состояние отправки
                        }
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                        <>
                            <Input
                                placeholder="Введите email или телефон"
                                leftIcon={<UserSolidIcon />}
                                containerStyle={{ paddingHorizontal: 0 }}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputStyle}
                                leftIconContainerStyle={styles.leftIconContainer}
                                onChangeText={handleChange('username')}
                                onBlur={handleBlur('username')}
                                value={values.username}
                                errorMessage={touched.username && errors.username ? String(errors.username) : undefined}
                                autoComplete="username"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                disabled={isSubmitting} // Блокируем ввод во время отправки
                            />

                            <View style={styles.buttonContainer}>
                                <Button
                                    title={'Отправить'}
                                    buttonStyle={styles.button}
                                    titleStyle={styles.buttonText}
                                    loading={isSubmitting} // Показываем индикатор загрузки
                                    disabled={isSubmitting} // Отключаем кнопку во время отправки
                                    disabledStyle={[styles.button, { opacity: 0.6 }]}
                                    onPress={() => handleSubmit()}
                                />
                            </View>
                        </>
                    )}
                </Formik>
                <Pressable onPress={handleLogin} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>
                        Вспомнили пароль?{' '}
                        <Text style={styles.forgotPasswordLink}>Войти</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 46,
    },
    logoContainer: {
        marginBottom: 35,
        alignItems: 'center',
    },
    logo: {
        resizeMode: 'contain',
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
    forgotPasswordContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#999',
    },
    forgotPasswordLink: {
        color: '#017EFA',
        textDecorationLine: 'none',
    },
    inputContainer: {
        padding: 0,
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
    leftIconContainer: {
        paddingLeft: 16,
    },
});

export default ForgotPasswordScreen;
