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
    <View style={styles.historyCard}>
      <View style={styles.leftCircle}>
        <Text style={styles.circleText}>Q1</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.feeTitle}>Quaterly Fee</Text>
        <Text style={styles.description}>lkfsd flksdjf slfksadjfl sdflkj</Text>
        <Text style={styles.dateText}>5 May 2025</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>₹22500</Text>
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
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  leftCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff7f7f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  circleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rightContent: {
    flex: 1,
  },
  feeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#555',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  amountContainer: {
    marginLeft: 'auto',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});
