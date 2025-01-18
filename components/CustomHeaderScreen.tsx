import React from 'react';
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import { router } from 'expo-router'
import { BackIcon } from "@/components/icons/Icons";

type CustomHeaderScreenProps = {
    text: string;
    marginBottom?: number;
}

export const CustomHeaderScreen: React.FC<CustomHeaderScreenProps> = ({ text, marginBottom = 0 }) => {

    const handleBack = () => {
        router.push('/');
    };

    return (
        <View style={{ marginBottom }}>
        <TouchableOpacity style={styles.header} onPress={handleBack}>
            <View style={styles.logoContainer}>
                <BackIcon />
            </View>
            <Text style={styles.text}>
                {text}
            </Text>
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 66,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderBottomColor: '#DADADA',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    logoContainer: {
        paddingHorizontal: 11,
        fontWeight: "bold",
    },
    text: {
        color: '#1B2B65',
        fontSize: 14,
        fontWeight: 700,
    },
});
