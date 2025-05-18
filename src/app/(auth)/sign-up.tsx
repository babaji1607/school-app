import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)

    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded) return

        // Validate input
        if (!emailAddress.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter a password',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        if (password.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Password Too Short',
                text2: 'Password must be at least 8 characters',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        setIsLoading(true);

        // Start sign-up process using email and password provided
        try {
            await signUp.create({
                emailAddress,
                password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            Toast.show({
                type: 'success',
                text1: 'Verification Email Sent',
                text2: 'Please check your email for the verification code',
                position: 'bottom',
                visibilityTime: 3000,
            });

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setPendingVerification(true)
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))

            // Extract error message or use a default one
            let errorMessage = 'An error occurred during sign up';
            if (err.errors && err.errors[0]) {
                errorMessage = err.errors[0].message || errorMessage;
            }

            Toast.show({
                type: 'error',
                text1: 'Sign Up Failed',
                text2: errorMessage,
                position: 'bottom',
                visibilityTime: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return

        // Validate code
        if (!code.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Verification Code Required',
                text2: 'Please enter the verification code from your email',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })

                Toast.show({
                    type: 'success',
                    text1: 'Verification Successful',
                    text2: 'Your account has been created successfully!',
                    position: 'bottom',
                    visibilityTime: 2000,
                    onHide: () => router.replace('/')
                });
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signUpAttempt, null, 2))

                Toast.show({
                    type: 'info',
                    text1: 'Additional Steps Required',
                    text2: 'Please complete the registration process',
                    position: 'bottom',
                    visibilityTime: 3000,
                });
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))

            // Extract error message or use a default one
            let errorMessage = 'An error occurred during verification';
            if (err.errors && err.errors[0]) {
                errorMessage = err.errors[0].message || errorMessage;
            }

            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: errorMessage,
                position: 'bottom',
                visibilityTime: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (pendingVerification) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Verify your email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a verification code to your email.
                            Please enter it below to complete your registration.
                        </Text>

                        <TextInput
                            value={code}
                            placeholder="Enter verification code"
                            onChangeText={(code) => setCode(code)}
                            style={styles.input}
                            keyboardType="number-pad"
                            autoFocus
                            maxLength={6}
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={onVerifyPress}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
                <Toast />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Sign up to get started with our services
                    </Text>

                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email address"
                        onChangeText={(email) => setEmailAddress(email)}
                        style={styles.input}
                        keyboardType="email-address"
                        editable={!isLoading}
                    />

                    <TextInput
                        value={password}
                        placeholder="Password"
                        secureTextEntry={true}
                        onChangeText={(password) => setPassword(password)}
                        style={styles.input}
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={onSignUpPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Already have an account?</Text>
                        <Link href="/sign-in" replace>
                            <Text style={styles.link}>Sign in</Text>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <Toast />
        </SafeAreaView>
    )
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: width * 0.06, // Responsive padding
        maxWidth: 500, // Max width for larger screens
        width: '100%',
        alignSelf: 'center',
        marginTop: -height * 0.05, // Adjust vertical position
    },
    title: {
        fontSize: isSmallDevice ? 24 : 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: isSmallDevice ? 14 : 16,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: isSmallDevice ? 12 : 16,
        fontSize: isSmallDevice ? 15 : 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    button: {
        backgroundColor: '#4f46e5', // Indigo color
        borderRadius: 12,
        paddingVertical: isSmallDevice ? 14 : 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4f46e5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#a5b4fc', // Lighter indigo when disabled
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: isSmallDevice ? 15 : 16,
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    linkText: {
        color: '#6b7280',
        fontSize: isSmallDevice ? 14 : 15,
    },
    link: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: isSmallDevice ? 14 : 15,
        marginLeft: 5,
    }
});