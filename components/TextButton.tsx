import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

type ButtonHeaderProps = {
    text: string;
    type?: 'primaryBig' | 'primary' | 'secondary' | 'danger' | 'secondaryLight' | 'success';
    size?: number;
    containerSize?: number;
    onPress?: () => void;
    marginLeft?: number;
    marginRight?: number;
};

export function TextButton({
                               text,
                               type = 'primary',
                               size = 134,
                               onPress,
                               marginLeft = 0,
                               marginRight = 0,
                           }: ButtonHeaderProps) {

    const buttonStyles = {
        primaryBig: {
            backgroundColor: '#017EFA',
            color: 'white',
            textSize: 18,
            height: 45,
        },

        primary: {
            backgroundColor: '#017EFA',
            color: 'white',
            textSize: 16,
            height: 40,
        },
        secondary: {
            backgroundColor: '#5D6377',
            color: 'white',
            textSize: 16,
            height: 40,
        },
        danger: {
            backgroundColor: '#FFEAF6',
            color: '#FD1F9B',
            textSize: 14,
            height: 52,
        },
        success: {
            backgroundColor: '#EAFBF3',
            color: '#30DA88',
            textSize: 14,
            height: 52,
        },
        secondaryLight: {
            backgroundColor: '#F5F7FB',
            color: '#5D6377',
            textSize: 14,
            height: 35,
        }
    };

    const selectedStyle = buttonStyles[type];

    return (
        <TouchableOpacity onPress={onPress} style={[styles.Button, { marginLeft, marginRight }]}>
            <View
                style={[styles.buttonContainer, {
                        width: size,
                        height: selectedStyle.height,
                        backgroundColor: selectedStyle.backgroundColor,
                    },
                ]}
            >
                <Text style={{ color: selectedStyle.color, fontSize: selectedStyle.textSize, fontWeight: 'bold' }}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    Button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
});
