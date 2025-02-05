import {View, StyleSheet} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import DaysCarousel from "@/components/DaysCarousel";
import FooterContentIcons from "@/components/FooterContentIcons";

export default function DayDetailsScreen() {
    const params = useLocalSearchParams();
    const { day, month, year, color, point, time_begin_work, time_end_work, address } = params
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.containerMonthsCarousel}>
                    <DaysCarousel day={+day} month={+month} year={+year} />
                </View>
                <View style={{ width: '100%', paddingHorizontal: 12 }}>
                    <Card
                        title={`${point}`}
                        colorStyle={`${color}`}
                        time={`${time_begin_work} - ${time_end_work}`}
                        address={`${address}`}
                    />
                </View>
            </View>
            <Footer>
                <FooterContentIcons />
            </Footer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    containerMonthsCarousel: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
});
