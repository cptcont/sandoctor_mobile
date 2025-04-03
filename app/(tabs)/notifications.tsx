import { View, Text, StyleSheet } from 'react-native';
import {CustomHeaderScreen} from "@/components/CustomHeaderScreen";
import React from "react";

export default function NotificationsScreen() {
    return (
        <View style={styles.container}>
            <CustomHeaderScreen
                text={`Уведомления`}
                marginBottom={0}
            />
            <Text>Notifications</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        alignItems: 'center',
    },
});
