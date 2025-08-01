import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { createFeeReceipt } from "../../../api/FeeReceipts";
import { TokenStore } from "../../../../TokenStore";
import { getFeePostsByStudent, updateFeePostStatus } from "../../../api/Feepost";
import PlaygroupIcon from '../../../assets/images/amusementpark.png';
import LkgIcon from '../../../assets/images/preplaygroup.png';

const PaymentScreen = () => {
  const [feePosts, setFeePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentFeePost, setCurrentFeePost] = useState(null);

  // Late fee calculation (₹10 per day)
  const lateFeePerDay = 10;
  const currentDate = new Date();

  // UPI IDs for different categories
  const UPI_IDS = {
    playgroup: "63008701@ubin",
    lkgAndUpper: "63009201@ubin",
  };

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
        const sortedPosts = response.data.items.sort((a, b) =>
          new Date(b.creation_date) - new Date(a.creation_date)
        );
        setFeePosts(sortedPosts);
        setError(null);
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

  const toggleExpanded = (postId) => {
    setExpandedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const calculateDaysAfterDeadline = (deadlineString) => {
    const deadlineDate = new Date(deadlineString);
    return Math.max(0, Math.ceil((currentDate - deadlineDate) / (1000 * 60 * 60 * 24)));
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateUPILink = (feePost, totalAmount, daysAfterDeadline, totalLateFee, category) => {
    const payeeVPA = category === 'playgroup' ? UPI_IDS.playgroup : UPI_IDS.lkgAndUpper;

    const UPI_CONFIG = {
      payeeName: "First Step School",
      payeeVPA: payeeVPA,
      merchantCode: "EDUCATION",
      transactionNote: "School Fee Payment",
    };

    const transactionRef = `FSS${Date.now()}${feePost.id}`.substring(0, 25);
    const note = totalLateFee > 0
      ? `${feePost.title} with late fee (${daysAfterDeadline} days)`
      : feePost.title;

    const upiParams = new URLSearchParams({
      pa: UPI_CONFIG.payeeVPA,
      pn: UPI_CONFIG.payeeName,
      am: totalAmount.toString(),
      cu: 'INR',
      tr: transactionRef,
      tn: `${UPI_CONFIG.transactionNote} - ${note}`,
      mc: UPI_CONFIG.merchantCode,
    });

    return `upi://pay?${upiParams.toString()}`;
  };

  const handleUPIPayment = (feePost) => {
    setCurrentFeePost(feePost);
    setShowCategoryModal(true);
  };

  const handleUPIPaymentWithCategory = async (category) => {
    try {
      setShowCategoryModal(false);

      const { totalAmount, daysAfterDeadline, totalLateFee } = calculateTotalAmount(
        currentFeePost.other_fee,
        currentFeePost.deadline
      );

      const upiLink = generateUPILink(
        currentFeePost,
        totalAmount,
        daysAfterDeadline,
        totalLateFee,
        category
      );

      const canOpen = await Linking.canOpenURL(upiLink);

      if (canOpen) {
        await Linking.openURL(upiLink);

        setTimeout(() => {
          Alert.alert(
            "Payment Confirmation",
            "Have you completed the payment successfully?",
            [
              {
                text: "No",
                style: "cancel"
              },
              {
                text: "Yes, Payment Done",
                onPress: () => handlePaymentSuccess(
                  currentFeePost,
                  totalAmount,
                  daysAfterDeadline,
                  totalLateFee
                )
              }
            ]
          );
        }, 2000);
      } else {
        Alert.alert(
          "UPI App Not Found",
          "No UPI app is installed. Please install a UPI app like GPay, PhonePe, or Paytm.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("UPI Payment Error:", error);
      Alert.alert("Error", "Unable to open UPI app. Please try again.");
    }
  };

  const handlePaymentSuccess = async (feePost, totalAmount, daysAfterDeadline, totalLateFee) => {
    try {
      if (feePost.id) {
        const token = await TokenStore.getToken();
        // await updateFeePostStatus(
        //   feePost.id,
        //   {
        //     is_paid: true,
        //     mode: 'upi'
        //   },
        //   token
        // );
      }

      // await createReceipt(feePost, totalAmount, daysAfterDeadline, totalLateFee);

      // Alert.alert("Success", "Payment recorded successfully!");
    } catch (error) {
      console.error("Payment success handling error:", error);
      // Alert.alert("Error", "Payment may have been completed but there was an error updating records.");
    }
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
        payment_reference: `UPI_${Date.now()}`,
        remarks: totalLateFee > 0 ? `${feePost.title} with late fee (${daysAfterDeadline} days)` : feePost.title,
      };

      createFeeReceipt(
        resBody,
        token,
        (data) => {
          console.log('Receipt created: ', data);
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

  const renderFeePost = (feePost) => {
    const { baseFeeAmount, totalLateFee, totalAmount, daysAfterDeadline } = calculateTotalAmount(feePost.other_fee, feePost.deadline);

    return (
      <View key={feePost.id} style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleExpanded(feePost.id)}
          style={styles.cardHeader}
        >
          <View style={styles.headerContent}>
            <Text style={styles.cardTitle}>{feePost.title}</Text>
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

        {expandedPosts.includes(feePost.id) && (
          <View style={styles.expandedContent}>
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
                  onPress={() => handleUPIPayment(feePost)}
                  style={styles.upiButton}
                >
                  <Text style={styles.upiButtonText}>Pay with UPI</Text>
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
          colors={['#FF6F61']}
          tintColor="#FF6F61"
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Your Class Category</Text>
                <Text style={styles.modalSubtitle}>Choose the appropriate category for fee payment</Text>
              </View>

              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.playgroupButton]}
                  onPress={() => handleUPIPaymentWithCategory('playgroup')}
                >
                  <View style={styles.buttonContent}>
                    <Image source={PlaygroupIcon} style={styles.buttonIcon} />
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.modalButtonText}>Play group / Nursery</Text>
                      <Text style={styles.modalButtonSubtext}>For younger students</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={[styles.modalButton, styles.lkgButton]}
                  onPress={() => handleUPIPaymentWithCategory('lkgAndUpper')}
                >
                  <View style={styles.buttonContent}>
                    <Image source={LkgIcon} style={styles.buttonIcon} />
                    <View style={styles.buttonTextContainer}>
                      <Text style={styles.modalButtonText}>LKG and Upper Classes</Text>
                      <Text style={styles.modalButtonSubtext}>For older students</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

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
  upiButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  upiButtonText: {
    color: "#212121",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 25,
    width: '85%',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalButton: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playgroupButton: {
    backgroundColor: "#FF9E80",
  },
  lkgButton: {
    backgroundColor: "#81C784",
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  buttonTextContainer: {
    flex: 1,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
  closeButton: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  closeButtonText: {
    color: "#FF6F61",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PaymentScreen;