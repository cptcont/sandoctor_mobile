import { StyleSheet, View } from "react-native";
import NotifTest from "@/components/NotifTest";

export default function BuildingsScreen() {
    return (
        <View style={styles.container}>
            <NotifTest />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
