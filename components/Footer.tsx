import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

type FooterProps  = {
    children?: React.ReactNode;
    justifyContent?: ViewStyle['justifyContent'];
}


function Footer({ children, justifyContent = 'center' }: FooterProps)  {
    return (
        <View style={[styles.footer, { justifyContent }]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        height: 77,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E3E3E3',
    },
});

export default Footer;
