import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";

const PaymentScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Fee Payment</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quarterly Fee Payment</Text>

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

        <View style={[styles.feeRow, styles.totalRow]}>
          <Text style={styles.feeLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹ 22500</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => {
            var options = {
              description: 'Credits towards consultation',
              image: 'https://i.imgur.com/3g7nmJC.png',
              currency: 'INR',
              key: 'rzp_test_w452IaxWwMliP6', // Your api key
              amount: '100',
              name: 'foo',
              prefill: {
                email: 'user@example.com',
                contact: '9999999999',
                name: 'Razorpay Software'
              },
              theme: { color: '#F37254' }
            }
            RazorpayCheckout.open(options).then((data) => {
              // handle success
              alert(`Success: ${data.razorpay_payment_id}`);
            }).catch((error) => {
              // handle failure
              alert(`Payment incomplete`);
            });
          }} style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
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
    backgroundColor: "#fff",
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
    marginBottom: 20,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#fff",
    paddingTop: 10,
    marginTop: 10,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  payButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  payButtonText: {
    color: "#FF6F61",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewButton: {
    borderColor: "#fff",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
