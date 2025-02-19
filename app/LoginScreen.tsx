import React, { useState } from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { UserSolidIcon, KeySolidIcon } from '@/components/icons/Icons';
import { CustomTextInput } from '@/components/CustomTextInput';
import {TextButton} from "@/components/TextButton";
import {usePopup} from "@/context/PopupContext";

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { showPopup } = usePopup();

    const handleLogin = async () => {
        try {
            await login(username, password);
        } catch (error) {
            showPopup ('Неверный логин или пароль', 'red', 2000 );
        }
    };
    const handleForgotPassword = () => {
        router.push('/ForgotPasswordScreen');
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('@/assets/images/logo-login.png')}
                    style={styles.logo}
                />
            </View>

            <CustomTextInput
                icon={<UserSolidIcon />}
                placeholder="Введите email или телефон"
                value={username}
                onChangeText={setUsername}
                marginBottom={20}
            />

            <CustomTextInput
                icon={<KeySolidIcon />}
                placeholder="Введите пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                marginBottom={20}
            />

            <View style={styles.buttonContainer}>
                <TextButton
                    text={'Войти'}
                    width={201}
                    height={45}
                    textSize={18}
                    textColor={'#FFFFFF'}
                    backgroundColor={'#017EFA'}
                    onPress={handleLogin}
                />
            </View>
            <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>
                    Забыли пароль?{' '}
                    <Text style={styles.forgotPasswordLink}>Восстановить</Text>
                </Text>
            </Pressable>
        </View>
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
    error: {
        color: 'red',
        marginTop: 10,
    },
});

export default LoginScreen;
