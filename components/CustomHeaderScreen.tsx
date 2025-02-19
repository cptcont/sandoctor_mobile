import React from 'react';
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import { router } from 'expo-router'
import {BackIcon, CheckSolid} from "@/components/icons/Icons";

type CustomHeaderScreenProps = {
    onPress: () => void;
    text: string;
    status?: {
        text:string;
        color:string;
        bgColor: string};
    marginBottom?: number;
}

export const CustomHeaderScreen: React.FC<CustomHeaderScreenProps> = ({ text, status, marginBottom = 0, onPress }) => {
    return (
        <View style={{ marginBottom }}>
            <TouchableOpacity style={styles.header} onPress={onPress}>
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <BackIcon />
                    </View>
                    <Text style={[styles.text, !status && { width: '90%' }]}>
                        {text}
                    </Text>
                </View>

                {status && (
                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.text}
                        </Text>
                        <View style={[styles.checkSolid, { backgroundColor: status.bgColor }]}>
                            <CheckSolid color={status.color} />
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 66,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
        borderBottomColor: '#DADADA',
        borderStyle: 'solid',
        borderBottomWidth: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    statusContainer: {
        paddingRight: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    statusText: {
        paddingRight: 12,
        fontSize: 10,
    },
    checkSolid: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        borderRadius: 50

    },
});
