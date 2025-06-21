import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { createFeeReceipt } from "../../../api/FeeReceipts";
import { TokenStore } from "../../../../TokenStore";

const PaymentScreen = () => {
  // Base fee amount
  const baseFeeAmount = 22500;

  // Deadline date (example: January 15, 2025)
  const deadlineDate = new Date('2025-06-11');

  // Current date
  const currentDate = new Date();

  // Calculate days after deadline
  const daysAfterDeadline = Math.max(0, Math.ceil((currentDate - deadlineDate) / (1000 * 60 * 60 * 24)));

  // Late fee calculation (₹10 per day)
  const lateFeePerDay = 10;
  const totalLateFee = daysAfterDeadline * lateFeePerDay;

  // Total amount including late fee
  const totalAmount = baseFeeAmount + totalLateFee;

  // Format deadline date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const createReceipt = async () => {
    try {
      const student = await TokenStore.getUserInfo()
      const stid = await student.id
      const token = await TokenStore.getToken()
      const resBody = {
        student_id: stid,
        total_amount: totalAmount,
        paid_on: new Date().toISOString(),
        payment_reference: 'no reference',
        remarks: totalLateFee > 0 ? `Quarterly payment with late fee (${daysAfterDeadline} days)` : 'Quarterly payment',
      }
      createFeeReceipt(
        resBody,
        token,
        (data) => {
          console.log('Receipt created: ', data)
        },
        (error) => {
          console.log(error)
        }
      )
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Fee Payment</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quarterly Fee Payment</Text>

        {/* Deadline information */}
        <View style={styles.deadlineInfo}>
          <Text style={styles.deadlineText}>
            Last date to pay fee: {formatDate(deadlineDate)}
          </Text>
          {daysAfterDeadline > 0 && (
            <Text style={styles.overdueText}>
              ({daysAfterDeadline} days overdue)
            </Text>
          )}
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Tuition Fee</Text>
          <Text style={styles.feeAmount}>₹ 18000</Text>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Sports Fee</Text>
          <Text style={styles.feeAmount}>₹ 1000</Text>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Art and Activities</Text>
          <Text style={styles.feeAmount}>₹ 1800</Text>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Books & Uniform</Text>
          <Text style={styles.feeAmount}>₹ 1700</Text>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Base Fee</Text>
          <Text style={styles.feeAmount}>₹ {baseFeeAmount.toLocaleString('en-IN')}</Text>
        </View>

        {/* Late fee row - only show if there's a late fee */}
        {totalLateFee > 0 && (
          <View style={[styles.feeRow, styles.lateFeeRow]}>
            <Text style={styles.lateFeeLabel}>
              Late Fee ({daysAfterDeadline} days × ₹{lateFeePerDay})
            </Text>
            <Text style={styles.lateFeeAmount}>₹ {totalLateFee.toLocaleString('en-IN')}</Text>
          </View>
        )}

        <View style={[styles.feeRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹ {totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => {
            var options = {
              description: 'School Quarterly Fee',
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
            }
            RazorpayCheckout.open(options).then((data) => {
              alert(`Success: ${data.razorpay_payment_id}`);
              createReceipt()
            }).catch((error) => {
              alert(`Payment incomplete`);
            });
          }} style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});