import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TokenStore } from '../../../../TokenStore';
import { useRouter } from 'expo-router';
import messaging from '@react-native-firebase/messaging'
import { getUserInfo } from '../../../api/Auth';
import { getTeacherById } from '../../../api/Teachers';


const ProfileScreen = () => {
    // Sample user data (would come from API/state in real app)
    const [userInfo, setUserInfo] = useState(null)
    // data schema

    //    {
    //   "FatherContact": "string",
    //   "FatherName": "pandu",
    //   "MotherContact": "string",
    //   "MotherName": "kunti",
    //   "address": "Indraprasth",
    //   "age": 16,
    //   "class_id": "5f2d4084-f351-4e43-8e72-c556b387411c",
    //   "classroom": {
    //     "id": "5f2d4084-f351-4e43-8e72-c556b387411c",
    //     "name": "Dhanurvidya",
    //     "teacher_id": "84d337b9-9f8d-457c-9769-77e567da20f2"
    //   },
    //   "contact": "garud",
    //   "id": "e20ac44a-ad8b-455d-bb0e-f59d573b7366",
    //   "name": "bheema",
    //   "notification_token": null,
    //   "user": {
    //     "email": "bheema",
    //     "id": "c8a63fba-4b7d-4cdf-ab39-342776deffc6"
    //   }
    // }



    const router = useRouter()

    const renderMenuItem = (iconName, title, badge = null) => (
        <TouchableOpacity style={styles.menuItem}>
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

    const handleLogout = async () => {
        TokenStore.clearAll()
        await messaging().unsubscribeFromTopic('student')
        console.log('Successfully unsubscribed from teacher')
        router.replace('/(auth)/auth')
    }


    const populateData = async () => {
        try {
            const Token = await TokenStore.getToken()
            const teacher = await TokenStore.getUserInfo()
            const stid = await teacher.id
            console.log({
                stid,
                Token
            })
            const info = await getTeacherById(
                Token,
                stid,
                (data) => {
                    console.log("userInfo", data)
                },
                (err) => {
                    console.log(err)
                }
            )
            console.log(info)
            setUserInfo(info)
        } catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        populateData()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <MaterialIcons name="menu" size={24} color="#555" />
                </TouchableOpacity>
            </View> */}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: 'https://avatar.iran.liara.run/public/48' }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editButton}>
                            <MaterialIcons name="edit" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileName}>{userInfo?.name}</Text>
                    <Text style={styles.profileRole}>Student</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Student Information</Text>

                    <View style={styles.infoCard}>
                        {/* <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ADM NO.</Text>
                            <Text style={styles.infoValue}>{userInfo?.admissionNumber}</Text>
                        </View> */}

                        {/* <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ROLL NO.</Text>
                            <Text style={styles.infoValue}>{userInfo?.rollNumber}</Text>
                        </View> */}

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Age</Text>
                            <Text style={styles.infoValue}>{userInfo?.age}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Username</Text>
                            <Text style={styles.infoValue}>{userInfo?.name}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Subject</Text>
                            <Text style={styles.infoValue}>{userInfo?.subject}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Contact</Text>
                            <Text style={styles.infoValue}>{userInfo?.contact}</Text>
                        </View>

                    </View>

                    {/* {renderMenuItem('person', 'My Profile')} */}
                    {/* {renderMenuItem('mail', 'Messages', '5')} */}
                    {/* {renderMenuItem('favorite', 'Favorites')} */}
                    {/* {renderMenuItem('location-on', 'Location')} */}
                    {/* {renderMenuItem('settings', 'Settings')} */}
                    {renderMenuItem('info-outline', 'About')}

                    {/* <TouchableOpacity style={styles.logoutButton}>
                        <MaterialIcons name="logout" size={18} color="red" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity> */}

                    {/* <SignOutButton></SignOutButton> */}
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
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
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    menuButton: {
        padding: 8,
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
    editButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#8a2be2',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontWeight: 'bold'
    },
});

export default ProfileScreen;