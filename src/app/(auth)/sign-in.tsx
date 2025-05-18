import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect } from 'react'
import Toast from 'react-native-toast-message'

export default function Signin() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)

    // Setup toast configuration on component mount
    useEffect(() => {
        // You can customize toast configuration here if needed
    }, []);

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        if (!isLoaded) return

        // Validate input
        if (!emailAddress.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter your password',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        setIsLoading(true);

        // Start the sign-in process using the email and password provided
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                console.log('Sign in successful:', signInAttempt)
                Toast.show({
                    type: 'success',
                    text1: 'Sign In Successful',
                    text2: 'Welcome back!',
                    position: 'top',
                    visibilityTime: 2000,
                    // onHide: () => router.replace('/')
                });
            } else {
                // If the status isn't complete, check why. User might need to
                // complete further steps.
                console.error(JSON.stringify(signInAttempt, null, 2))
                Toast.show({
                    type: 'info',
                    text1: 'Additional Steps Required',
                    text2: 'Please complete the authentication process',
                    position: 'top',
                    visibilityTime: 3000,
                });
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))

            // Extract error message or use a default one
            let errorMessage = 'An error occurred during sign in';
            if (err.errors && err.errors[0]) {
                errorMessage = err.errors[0].message || errorMessage;
            }

            Toast.show({
                type: 'error',
                text1: 'Sign In Failed',
                text2: errorMessage,
                position: 'top',
                visibilityTime: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>First step School</Text>
                    <Text style={styles.subtitle}>
                        Sign in to your account to continue
                    </Text>

                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email address"
                        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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
                        onPress={onSignInPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    {/* <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Don't have an account?</Text>
                        <Link href="/sign-up" replace>
                            <Text style={styles.link}>Sign up</Text>
                        </Link>
                    </View> */}
                </View>
            </KeyboardAvoidingView>

            {/* This component is required for the Toast messages to work */}
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