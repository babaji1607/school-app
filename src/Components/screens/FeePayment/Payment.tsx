import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView
} from "react-native";
import StepIndicator from "react-native-step-indicator";
import { Feather, Ionicons } from "@expo/vector-icons";
import RazorpayCheckout from 'react-native-razorpay';


const stepsData = [
  { id: 1, title: "Select Installment", icon: "event-note" },
  { id: 2, title: "Payment Detail", icon: "payment" },
  { id: 3, title: "Payment Gateway", icon: "credit-card" },
  { id: 4, title: "Payment Status", icon: "check-circle" },
];


const customStyles = {
  stepIndicatorSize: 40,
  currentStepIndicatorSize: 35,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "blue",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "blue",
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "blue",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "blue",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "blue",
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#ffffff",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelSize: 10,
};

const PaymentScreen = () => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [lateFee, setLateFee] = useState("");
  const [reAdmissionFee, setReAdmissionFee] = useState("");
  const [chequeBounceFee, setChequeBounceFee] = useState("");

  const totalAmount =
    (parseFloat(lateFee) || 0) +
    (parseFloat(reAdmissionFee) || 0) +
    (parseFloat(chequeBounceFee) || 0);

  const renderStepIndicator = ({ position, stepStatus }) => {
    const iconName = stepsData[position].icon; // Get icon for the step
    return (
      <Feather
        name='check-circle'
        size={16}
        color={stepStatus === "current" || stepStatus === "finished" ? "#ffffff" : "#aaaaaa"}
      />
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Step Indicator */}
        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentPosition}
          // labels={labels}
          stepCount={4}
          renderStepIndicator={renderStepIndicator}
        />

        {/* Installment Section */}
        <View style={styles.card}>
          <Text style={styles.title}>Student name</Text>

          {/* Fee Inputs */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Late Fee</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={lateFee}
              onChangeText={setLateFee}
              placeholder="Late Fee"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Re Admission Fee</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={reAdmissionFee}
              onChangeText={setReAdmissionFee}
              placeholder="Re Admission Fee"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chq Bounce Fee</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={chequeBounceFee}
              onChangeText={setChequeBounceFee}
              placeholder="Cheque Bounce Fee"
            />
          </View>

          {/* Total */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Total</Text>
            <TextInput style={styles.input} editable={false} value={`₹ ${totalAmount}`} />
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
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
                alert(`Error: ${error.code} | ${error.description}`);
              });
            }}
          >
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.support}>
          <Text style={styles.supportText}>📧 parent@entab.in</Text>
          <TouchableOpacity style={styles.termsButton}>
            <Text style={styles.termsText}>Terms and Conditions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  support: {
    alignItems: "center",
    marginTop: 20,
  },
  supportText: {
    fontSize: 14,
    color: "#666",
  },
  termsButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  termsText: {
    fontSize: 14,
    color: "blue",
    fontWeight: "bold",
  },
});

export default PaymentScreen;
