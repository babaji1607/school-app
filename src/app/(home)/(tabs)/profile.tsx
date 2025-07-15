import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TokenStore } from '../../../../TokenStore';
import { useRouter } from 'expo-router';
import messaging from '@react-native-firebase/messaging';
import { getUserInfo } from '../../../api/Auth';
import { getStudentById, updateStudent } from '../../../api/Students';

const ProfileScreen = () => {
    const [userInfo, setUserInfo] = useState(null);
    const router = useRouter();

    const showLogoutConfirmation = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: handleLogout,
                },
            ],
            { cancelable: true }
        );
    };

    const handleLogout = async () => {
        try {
            await messaging().unsubscribeFromTopic('student');
            const studentInfo = await TokenStore.getUserInfo()
            const token = await TokenStore.getToken()
            await updateStudent(
                token,
                studentInfo?.id,
                { ...studentInfo, notification_token: null },
                (data) => console.log("Token updated successfully", data),
                (error) => console.log("Token update failed", error)
            )
            TokenStore.clearAll();
            router.replace('/(auth)/auth');
        } catch (error) {
            console.log('Logout error:', error);
            // Still proceed with logout even if unsubscribe fails
            router.replace('/(auth)/auth');
        }
    };

    const populateData = async () => {
        try {
            const Token = await TokenStore.getToken();
            const student = await TokenStore.getUserInfo();
            const stid = student.id;
            const info = await getStudentById(Token, stid);
            setUserInfo(info);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        populateData();
    }, []);

    const renderMenuItem = (iconName, title, onPress, badge = null) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <MaterialIcons name={iconName} size={22} color="#555" />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: 'https://avatar.iran.liara.run/public/48' }}
                            style={styles.profileImage}
                        />
                    </View>
                    <Text style={styles.profileName}>{userInfo?.name}</Text>
                    <Text style={styles.profileRole}>Student</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Student Information</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Age</Text>
                            <Text style={styles.infoValue}>{userInfo?.age}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Username</Text>
                            <Text style={styles.infoValue}>{userInfo?.user?.email}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Class</Text>
                            <Text style={styles.infoValue}>{userInfo?.classroom?.name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>FATHER</Text>
                            <Text style={styles.infoValue}>{userInfo?.FatherName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MOTHER</Text>
                            <Text style={styles.infoValue}>{userInfo?.MotherName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ADDRESS</Text>
                            <Text style={styles.infoValue}>{userInfo?.address}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>FATHER'S NO</Text>
                            <Text style={styles.infoValue}>{userInfo?.FatherContact}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MOTHER'S NO</Text>
                            <Text style={styles.infoValue}>{userInfo?.MotherContact}</Text>
                        </View>
                    </View>

                    {/* {renderMenuItem('photo-library', 'Gallery', () => router.push('/(home)/gallary'))} */}
                    {/* {renderMenuItem('info-outline', 'About', () => { })} */}

                    <TouchableOpacity onPress={showLogoutConfirmation} style={styles.logoutButton}>
                        <MaterialIcons name="logout" size={18} color="white" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5b0c0',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 200,
        paddingTop: 40,
    },
    profileContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#333',
    },
    profileRole: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    detailsContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        width: '40%',
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        width: '60%',
        fontSize: 14,
        color: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    menuIcon: {
        width: 40,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    badge: {
        backgroundColor: '#8a2be2',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#F72C5B',
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;