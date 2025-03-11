import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For icons

const FeePaymentScreen = () => {
  // Sample data representing the payment details
  const paymentData = [
    { id: '1', period: 'APR-JUNE', date: '21/03/2024', receiptNo: '167', amount: '51590', payMode: 'Debit Card' },
    { id: '2', period: 'JULY-SEPT', date: '10/07/2024', receiptNo: '3791', amount: '11590', payMode: 'Online' },
    { id: '3', period: 'OCT-DEC', date: '16/10/2024', receiptNo: '7269', amount: '11590', payMode: 'Online' },
    { id: '4', period: 'JAN-MAR', date: '02/02/2025', receiptNo: '10781', amount: '11790', payMode: 'Online' },
  ];

  // Render each card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.periodText}>{item.period}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>Receipt No: <Text style={styles.value}>{item.receiptNo}</Text></Text>
        <Text style={styles.detailText}>Amount: <Text style={styles.value}>{item.amount}</Text></Text>
        <Text style={styles.detailText}>Pay Mode: <Text style={styles.value}>{item.payMode}</Text></Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="print" size={20} color="white" />
          <Text style={styles.buttonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
          <Text style={styles.buttonText}>Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={paymentData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

export default FeePaymentScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3, // Shadow effect for Android
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  periodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  dateText: {
    fontSize: 14,
    color: '#777',
  },
  details: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  value: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#0a730a',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
