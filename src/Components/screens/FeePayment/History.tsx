import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchFeeReceiptsByStudent } from '../../../api/FeeReceipts';
import { TokenStore } from '../../../../TokenStore';

const FeePaymentScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState([]);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount?.toLocaleString('en-IN') || '0'}`;
  };

  const getFeeTypeAbbreviation = (remarks) => {
    if (!remarks) return 'F';
    const remarksUpper = remarks.toUpperCase();

    if (remarksUpper.includes('FIRST') || remarksUpper.includes('1ST')) return 'T1';
    if (remarksUpper.includes('SECOND') || remarksUpper.includes('2ND')) return 'T2';
    if (remarksUpper.includes('THIRD') || remarksUpper.includes('3RD')) return 'T3';
    if (remarksUpper.includes('FOURTH') || remarksUpper.includes('4TH')) return 'T4';
    if (remarksUpper.includes('TERM')) return 'T';
    if (remarksUpper.includes('QUARTER')) return 'Q';
    if (remarksUpper.includes('ANNUAL')) return 'A';
    if (remarksUpper.includes('MONTHLY')) return 'M';
    if (remarksUpper.includes('ADMISSION')) return 'AD';
    if (remarksUpper.includes('EXAM')) return 'E';
    if (remarksUpper.includes('LIBRARY')) return 'L';
    if (remarksUpper.includes('TRANSPORT')) return 'TR';
    if (remarksUpper.includes('HOSTEL')) return 'H';

    return remarks.charAt(0).toUpperCase();
  };

  const getRelativeTime = (date) => {
    if (!date) return '';
    try {
      const today = new Date();
      const givenDate = new Date(date);
      const diffInDays = Math.floor((today - givenDate) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return givenDate.toDateString();
    } catch (error) {
      return formatDate(date);
    }
  };

  const populateHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await TokenStore.getToken();
      const student = await TokenStore.getUserInfo();
      const stid = student?.id;

      if (!token || !stid) {
        throw new Error('Missing authentication or student information');
      }

      fetchFeeReceiptsByStudent(
        stid,
        1,
        100,
        token,
        (data) => {
          const transformedData = data.map((item, index) => ({
            id: item.id?.toString() || index.toString(),
            period: item.remarks || 'Fee Payment',
            date: item.paid_on,
            receiptNo: item.payment_reference || item.id?.slice(0, 8),
            amount: item.total_amount || '0',
            description: item.remarks || 'Fee payment transaction',
            ...item,
          }));
          setPaymentData(transformedData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching fee history:', error);
          setError(error.message || 'Failed to fetch payment history');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error in populateHistory:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await populateHistory();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    populateHistory();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff7f7f" />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  const renderEmptyOrErrorState = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>Failed to load payment history</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={populateHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt-long" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No payment history found</Text>
        <Text style={styles.emptySubText}>Your fee payments will appear here</Text>
      </View>
    );
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={paymentData.length === 0 ? styles.emptyListContainer : styles.listContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: 'center', padding: 3 }}>
        <Text style={{ fontSize: 11, color: '#708090' }}>Pull down to refresh</Text>
      </View>

      {paymentData.length === 0 ? (
        renderEmptyOrErrorState()
      ) : (
        paymentData.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.leftCircle}>
              <Text style={styles.circleText}>{getFeeTypeAbbreviation(item.period)}</Text>
            </View>
            <View style={styles.rightContent}>
              <Text style={styles.feeTitle}>{item.period || 'Fee Payment'}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.payment_reference !== 'no reference'
                  ? `Ref: ${item.payment_reference}`
                  : `Payment ID: ${item.id?.slice(0, 8)}...`}
              </Text>
              <Text style={styles.dateText}>{formatDate(item.date)} • Online Payment</Text>
              <Text style={styles.relativeTime}>{getRelativeTime(item.date)}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default FeePaymentScreen;


export default FeePaymentScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  relativeTime: {
    fontSize: 11,
    color: '#aaa',
  },
  amountContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff7f7f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});