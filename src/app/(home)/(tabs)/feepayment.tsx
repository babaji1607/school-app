import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Payment from '../../../Components/screens/FeePayment/Payment';
import History from '../../../Components/screens/FeePayment/History';
import RazorpayCheckout from 'react-native-razorpay';

const FeePayment = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Payment />
            <View style={styles.separator} />
            <History />
        </ScrollView>
    );
};

export default FeePayment;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    separator: {
        height: 24,
    },
});
