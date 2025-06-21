import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { Redirect } from 'expo-router';
import LottieView from 'lottie-react-native';
import * as SecureStore from 'expo-secure-store';
// import schoolbus from '../../assets/lottieFiles/schoolbus.json'
import boy from '../../assets/lottieFiles/boy.json'
import attendance from '../../assets/lottieFiles/attendance.json'
import login from '../../assets/lottieFiles/login.json'
import { Key } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const handleDone = async () => {
        try {
            await SecureStore.setItemAsync('hasOnboarded', 'true');
            setShouldRedirect(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    if (shouldRedirect) {
        return <Redirect href="/(auth)/auth" />;
    }

    const renderLottieAnimation = (key) => {
        if (key === 'boy') {
            return (
                <View key={key} style={styles.lottieContainer}>
                    <LottieView
                        source={boy}
                        autoPlay
                        loop
                        style={styles.lottie}
                        resizeMode="contain"
                    />
                </View>
            );
        }
        if (key === 'check') {
            return (
                <View key={key} style={styles.lottieContainer}>
                    <LottieView
                        source={attendance}
                        autoPlay
                        loop
                        style={styles.lottie}
                        resizeMode="contain"
                    />
                </View>
            );
        }
        return (
            <View key={key} style={styles.lottieContainer}>
                <LottieView
                    source={login}
                    autoPlay
                    loop
                    style={styles.lottie}
                    resizeMode="contain"
                />
            </View>
        );
    }

    const pages = [
        {
            backgroundColor: '#fff',
            key: 1,
            image: renderLottieAnimation('boy'),
            title: 'Welcome to First step school',
            subtitle: 'An all-in-one solution for school management.',
        },
        {
            backgroundColor: '#fcefee',
            key: 2,
            image: renderLottieAnimation('check'),
            title: 'Track Attendance',
            subtitle: 'Students and teachers stay connected in real time.',
        },
        {
            backgroundColor: '#f0f4ff',
            key: 3,
            image: renderLottieAnimation(''),
            title: 'Secure Login',
            subtitle: 'Your data is safe, private, and secure.',
        },
    ];

    return (
        <View style={styles.container}>
            <Onboarding
                onDone={handleDone}
                onSkip={handleDone}
                bottomBarHighlight={false}
                containerStyles={styles.swiper}
                pages={pages}
                showNext={true}
                showSkip={true}
                showDone={true}
            />
        </View>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    swiper: {
        flex: 1,
    },
    lottieContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.8,
        height: width * 0.8,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
});