import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {router} from "expo-router";
import {UserSolidIcon} from "@/components/icons/Icons";
import {CustomTextInput} from "@/components/CustomTextInput";
import {TextButton} from "@/components/TextButton";

const ForgotPasswordScreen = () => {
    const [username, setUsername] = useState('');

    const handleLogin = () => {
        router.push('/LoginScreen');
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
            <Pressable onPress={handleLogin} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>
                    Вспомнили пароль?{' '}
                    <Text style={styles.forgotPasswordLink}>Войти</Text>
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
});

export default ForgotPasswordScreen;
