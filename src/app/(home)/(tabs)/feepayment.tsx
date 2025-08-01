import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Linking, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Payment from '../../../Components/screens/FeePayment/Payment';

const FeePayment = () => {
    const whatsappNumber = '919876543210'; // Replace with your school's WhatsApp number
    
    const openWhatsApp = () => {
        const url = `whatsapp://send?phone=${whatsappNumber}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(
                    "WhatsApp Not Installed",
                    "Please install WhatsApp to contact us directly",
                    [{ text: "OK" }]
                );
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Payment Instruction Note */}
                <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>
                        <Text style={styles.noteHeading}>Important: </Text>
                        After making the payment, please take a screenshot of the transaction 
                        and send it to us via WhatsApp along with your student details 
                        (Name, Class, and Admission Number).
                    </Text>
                </View>

                <Payment />
            </ScrollView>
            
            {/* WhatsApp FAB Button */}
            <TouchableOpacity 
                style={styles.whatsappButton}
                onPress={openWhatsApp}
                activeOpacity={0.8}
            >
                <Ionicons name="logo-whatsapp" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5b0c0',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    noteContainer: {
        backgroundColor: '#FFF3E0', // Light orange background
        padding: 15,
        margin: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6F61', // Accent color
    },
    noteText: {
        color: '#5D4037', // Dark brown text
        fontSize: 14,
        lineHeight: 20,
    },
    noteHeading: {
        fontWeight: 'bold',
        color: '#D84315', // Dark orange
    },
    whatsappButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#25D366',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default FeePayment;