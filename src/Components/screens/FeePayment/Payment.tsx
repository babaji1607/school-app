import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { createFeeReceipt } from "../../../api/FeeReceipts";
import { TokenStore } from "../../../../TokenStore";
import { getFeePostsByStudent, updateFeePostStatus } from "../../../api/Feepost";

const PaymentScreen = () => {
  const [feePosts, setFeePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Late fee calculation (₹10 per day)
  const lateFeePerDay = 10;

  // Current date
  const currentDate = new Date();

  // Fetch fee posts on component mount
  useEffect(() => {
    fetchFeePosts();
  }, []);

  const fetchFeePosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const student = await TokenStore.getUserInfo();
      const studentId = student.id;
      const token = await TokenStore.getToken();

      const response = await getFeePostsByStudent(studentId, token);

      if (response.success) {
        // Sort by latest creation date (newest first)
        const sortedPosts = response.data.items.sort((a, b) =>
          new Date(b.creation_date) - new Date(a.creation_date)
        );
        setFeePosts(sortedPosts);
        setError(null); // Clear any previous errors
      } else {
        setError(response.message || "Failed to fetch fee posts");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching fee posts:", err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    fetchFeePosts(true);
  };

  // Toggle expanded state for a post
  const toggleExpanded = (postId) => {
    setExpandedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Calculate days after deadline
  const calculateDaysAfterDeadline = (deadlineString) => {
    const deadlineDate = new Date(deadlineString);
    return Math.max(0, Math.ceil((currentDate - deadlineDate) / (1000 * 60 * 60 * 24)));
  };

  // Calculate total amount including late fee
  const calculateTotalAmount = (otherFee, deadline) => {
    const baseFeeAmount = Object.values(otherFee).reduce((sum, amount) => sum + amount, 0);
    const daysAfterDeadline = calculateDaysAfterDeadline(deadline);
    const totalLateFee = daysAfterDeadline * lateFeePerDay;
    return {
      baseFeeAmount,
      totalLateFee,
      totalAmount: baseFeeAmount + totalLateFee,
      daysAfterDeadline
    };
  };

  // Format deadline date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const createReceipt = async (feePost, totalAmount, daysAfterDeadline, totalLateFee) => {
    try {
      const student = await TokenStore.getUserInfo();
      const stid = student.id;
      const token = await TokenStore.getToken();
      const resBody = {
        student_id: stid,
        total_amount: totalAmount,
        paid_on: new Date().toISOString(),
        payment_reference: 'no reference',
        remarks: totalLateFee > 0 ? `${feePost.title} with late fee (${daysAfterDeadline} days)` : feePost.title,
      };

      createFeeReceipt(
        resBody,
        token,
        (data) => {
          console.log('Receipt created: ', data);
          // Refresh the fee posts to update payment status
          fetchFeePosts();
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handlePayment = (feePost) => {
    const { totalAmount, daysAfterDeadline, totalLateFee } = calculateTotalAmount(feePost.other_fee, feePost.deadline);
    console.log(feePost.id)
    const options = {
      description: feePost.title,
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_test_w452IaxWwMliP6',
      amount: totalAmount * 100, // Razorpay expects amount in paise
      name: 'First Step School',
      prefill: {
        email: 'user@example.com',
        contact: '9999999999',
        name: 'Student Name'
      },
      theme: { color: '#F37254' }
    };

    RazorpayCheckout.open(options).then(async (data) => {
      alert(`Success: ${data.razorpay_payment_id}`);
      if (feePost.id) {
        const token = await TokenStore.getToken()
        await updateFeePostStatus(
          feePost.id,
          {
            is_paid: true,
            mode: 'online'
          },
          token
        )
      }
      await createReceipt(feePost, totalAmount, daysAfterDeadline, totalLateFee);
    }).catch((error) => {
      alert(`Payment incomplete`);
    });
  };

  const renderFeePost = (feePost) => {
    const { baseFeeAmount, totalLateFee, totalAmount, daysAfterDeadline } = calculateTotalAmount(feePost.other_fee, feePost.deadline);
    const deadlineDate = new Date(feePost.deadline);

    return (
      <View key={feePost.id} style={styles.card}>
        {/* Collapsible Header */}
        <TouchableOpacity
          onPress={() => toggleExpanded(feePost.id)}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <Text style={styles.cardTitle}>{feePost.title}</Text>

            {/* Status and Late Fee Info */}
            <View style={styles.headerInfo}>
              {feePost.is_paid ? (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidBadgeText}>✓ PAID</Text>
                </View>
              ) : (
                <View style={styles.unpaidBadge}>
                  <Text style={styles.unpaidBadgeText}>UNPAID</Text>
                </View>
              )}

              {totalLateFee > 0 && !feePost.is_paid && (
                <View style={styles.lateFeeBadge}>
                  <Text style={styles.lateFeeBadgeText}>
                    Late Fee: ₹{totalLateFee.toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.expandIcon}>
            {expandedPosts.includes(feePost.id) ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Expandable Content */}
        {expandedPosts.includes(feePost.id) && (
          <View style={styles.expandedContent}>
            {/* Deadline information */}
            <View style={styles.deadlineInfo}>
              <Text style={styles.deadlineText}>
                Last date to pay fee: {formatDate(feePost.deadline)}
              </Text>
              {daysAfterDeadline > 0 && !feePost.is_paid && (
                <Text style={styles.overdueText}>
                  ({daysAfterDeadline} days overdue)
                </Text>
              )}
            </View>

            {/* Dynamic fee breakdown */}
            {Object.entries(feePost.other_fee).map(([feeType, amount]) => (
              <View key={feeType} style={styles.feeRow}>
                <Text style={styles.feeLabel}>{feeType}</Text>
                <Text style={styles.feeAmount}>₹ {amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Base Fee</Text>
              <Text style={styles.feeAmount}>₹ {baseFeeAmount.toLocaleString('en-IN')}</Text>
            </View>

            {/* Late fee row - only show if there's a late fee and not paid */}
            {totalLateFee > 0 && !feePost.is_paid && (
              <View style={[styles.feeRow, styles.lateFeeRow]}>
                <Text style={styles.lateFeeLabel}>
                  Late Fee ({daysAfterDeadline} days × ₹{lateFeePerDay})
                </Text>
                <Text style={styles.lateFeeAmount}>₹ {totalLateFee.toLocaleString('en-IN')}</Text>
              </View>
            )}

            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                ₹ {feePost.is_paid ? baseFeeAmount.toLocaleString('en-IN') : totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              {feePost.is_paid ? (
                <View style={styles.paidButton}>
                  <Text style={styles.paidButtonText}>✓ Paid</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handlePayment(feePost)}
                  style={styles.payButton}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Loading fee posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchFeePosts} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6F61']} // Android
          tintColor="#FF6F61" // iOS
        />
      }
    >
      <Text style={styles.heading}>Fee Payment</Text>

      {feePosts.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No fee posts available</Text>
        </View>
      ) : (
        feePosts.map(renderFeePost)
      )}
    </ScrollView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5b0c0",
    alignItems: "center",
    padding: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FF6F61",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  deadlineInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  deadlineText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overdueText: {
    color: "#FFE4E1",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  feeLabel: {
    color: "#fff",
    fontSize: 16,
  },
  feeAmount: {
    color: "#fff",
    fontSize: 16,
  },
  lateFeeRow: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
  },
  lateFeeLabel: {
    color: "#FFE4E1",
    fontSize: 14,
    fontWeight: "600",
  },
  lateFeeAmount: {
    color: "#FFE4E1",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#fff",
    paddingTop: 15,
    marginTop: 15,
  },
  totalLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 25,
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  payButtonText: {
    color: "#FF6F61",
    fontWeight: "bold",
    fontSize: 18,
  },
  paidButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paidButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF6F61",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6F61",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#FF6F61",
    textAlign: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  paidBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  paidBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  unpaidBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  unpaidBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  lateFeeBadge: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  lateFeeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  expandIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
});