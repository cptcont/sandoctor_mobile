import React from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { UserSolidIcon, KeySolidIcon } from '@/components/icons/Icons';
import { TextButton } from '@/components/TextButton';
import { usePopup } from '@/context/PopupContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Button } from '@rneui/themed';

const LoginScreen = () => {
    const { login } = useAuth();
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

                // Проверка на телефон (пример: +79991234567 или 89991234567)
                const phoneRegex = /^\+?[1-9]\d{6,14}$/;
                const isPhoneValid = phoneRegex.test(value.replace(/[\s()-]/g, '')); // Удаляем пробелы, скобки, дефисы

                return isEmailValid || isPhoneValid;
            }),
        password: Yup.string().required('Введите пароль'),
    });

    const handleForgotPassword = () => {
        router.push('/ForgotPasswordScreen');
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            extraKeyboardSpace={50}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('@/assets/images/logo-login.png')}
                        style={styles.logo}
                    />
                </View>

                <Formik
                    initialValues={{ username: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setSubmitting(true);
                        try {
                            await login(values.username, values.password);
                        } catch (error) {
                            showPopup('Неверный логин или пароль', 'red', 2000);
                        } finally {
                            setSubmitting(false);
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
                                keyboardType="email-address" // Клавиатура для email (английская раскладка)
                                autoCapitalize="none" // Отключаем автокапитализацию
                                autoCorrect={false} // Отключаем автокоррекцию
                                disabled={isSubmitting}
                            />

                            <Input
                                placeholder="Введите пароль"
                                leftIcon={<KeySolidIcon />}
                                containerStyle={{ paddingHorizontal: 0 }}
                                inputContainerStyle={styles.inputContainer}
                                inputStyle={styles.inputStyle}
                                leftIconContainerStyle={styles.leftIconContainer}
                                secureTextEntry={true}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                errorMessage={touched.password && errors.password ? String(errors.password) : undefined}
                                autoComplete="password"
                                keyboardType="default" // Обычная клавиатура (английская по умолчанию)
                                autoCapitalize="none" // Отключаем автокапитализацию
                                autoCorrect={false} // Отключаем автокоррекцию
                                disabled={isSubmitting}
                            />

                            <View style={styles.buttonContainer}>
                                <Button
                                    title={'ВоЙти'}
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

                <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>
                        Забыли пароль?{' '}
                        <Text style={styles.forgotPasswordLink}>Восстановить</Text>
                    </Text>
                </Pressable>
            </View>
        </KeyboardAwareScrollView>
    );
};

// Стили остаются без изменений
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

});

export default LoginScreen;
