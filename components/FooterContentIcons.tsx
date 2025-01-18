import {IconButton} from "@/components/IconButton";
import {ListIcon, TableCellsIcon} from "@/components/icons/Icons";
import {TextButton} from "@/components/TextButton";
import { View, Text, StyleSheet } from 'react-native';
import React from "react";

const FooterContentIcons = () => {
    return (
        <View style={styles.container}>
            <IconButton icon={<ListIcon/>} size={35} marginLeft={20} onPress={() => {}}/>
            <IconButton icon={<TableCellsIcon/>} size={35} marginLeft={8} onPress={() => {}}/>
            <TextButton text={'Сегодня'} type={'secondaryLight'} size={112} marginLeft={40} onPress={() => {}}/>
            <TextButton text={'Завтра'} type={'secondaryLight'} size={96} marginLeft={10} onPress={() => {}}/>
        </View>
);
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});

export default FooterContentIcons;
