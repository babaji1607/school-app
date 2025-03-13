import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FeePaymentScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [paymentData, setPaymentData] = useState([
    { id: '1', period: 'APR-JUNE', date: '2024-03-21', receiptNo: '167', amount: '51590', payMode: 'Debit Card' },
    { id: '2', period: 'JULY-SEPT', date: '2024-07-10', receiptNo: '3791', amount: '11590', payMode: 'Online' },
    { id: '3', period: 'OCT-DEC', date: '2024-10-16', receiptNo: '7269', amount: '11590', payMode: 'Online' },
    { id: '4', period: 'JAN-MAR', date: '2025-02-02', receiptNo: '10781', amount: '11790', payMode: 'Online' },
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // Simulating a fetch
  }, []);

  const getRelativeTime = (date) => {
    const today = new Date();
    const givenDate = new Date(date);
    const diffInMs = today - givenDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return givenDate.toDateString();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.periodText}>{item.period}</Text>
        <Text style={styles.dateText}>{getRelativeTime(item.date)}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>Receipt No: <Text style={styles.value}>{item.receiptNo}</Text></Text>
        <Text style={styles.detailText}>Amount: <Text style={styles.value}>{item.amount}</Text></Text>
        <Text style={styles.detailText}>Pay Mode: <Text style={styles.value}>{item.payMode}</Text></Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="print" size={16} color="white" />
          <Text style={styles.buttonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <MaterialIcons name="arrow-forward" size={16} color="white" />
          <Text style={styles.buttonText}>Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={{ alignItems: 'center', padding: 3 }}>
        <Text style={{ fontSize: 11, color: '#708090' }}>Pull down to refresh</Text>
      </View>
      <FlatList
        data={paymentData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
      />
    </>
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
    elevation: 3,
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
    color: '#333',
  },
  dateText: {
    fontSize: 13,
    color: '#777',
  },
  details: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
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
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
