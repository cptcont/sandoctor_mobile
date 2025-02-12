import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

type CustomTextInputProps = {
    icon: React.ReactNode;
    text?: string;
    placeholder: string;
    placeholderTextColor?: string;
    value: string;
    onChangeText: (text: string) => void;
    onFocus?: () => void;  // 🔥 Добавили onFocus
    secureTextEntry?: boolean;
    marginBottom?: number;
};

export const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
    (
        {
            icon,
            text = '',
            placeholder,
            placeholderTextColor = '#999',
            value,
            onChangeText,
            onFocus, // 👈 Передаем onFocus
            secureTextEntry = false,
            marginBottom = 0,
        },
        ref
    ) => {
        return (
            <View style={{ marginBottom }}>
                {text.trim() !== '' && <Text style={styles.text}>{text}</Text>}
                <View style={styles.inputWrapper}>
                    <View style={styles.iconContainer}>{icon}</View>
                    <TextInput
                        ref={ref}
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderTextColor}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={onFocus} // 🔥 Добавили onFocus внутрь TextInput
                        secureTextEntry={secureTextEntry}
                    />
                </View>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    text: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    inputWrapper: {
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        left: 16,
        top: 14,
        zIndex: 1,
    },
    input: {
        height: 48,
        width: '100%',
        backgroundColor: '#F5F7FB',
        borderRadius: 6,
        paddingLeft: 48,
        fontSize: 15,
    },
});
