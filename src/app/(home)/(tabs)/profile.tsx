import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
    // Sample user data (would come from API/state in real app)
    const userData = {
        name: 'Student Name',
        class: 'Grade VI-B',
        admissionNumber: '20220301254',
        rollNumber: '15',
        father: 'Father Name',
        mother: 'Mother Name',
        address: '123 Example Street, Sample City',
        dateOfBirth: '12-05-2012',
        fatherContact: '987asdf650',
        motherContact: '9432fasdfw11',
    };

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

                    <Text style={styles.profileName}>{userData.name}</Text>
                    <Text style={styles.profileRole}>{userData.class}</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Student Information</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ADM NO.</Text>
                            <Text style={styles.infoValue}>{userData.admissionNumber}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ROLL NO.</Text>
                            <Text style={styles.infoValue}>{userData.rollNumber}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>FATHER</Text>
                            <Text style={styles.infoValue}>{userData.father}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MOTHER</Text>
                            <Text style={styles.infoValue}>{userData.mother}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ADDRESS</Text>
                            <Text style={styles.infoValue}>{userData.address}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>DATE OF BIRTH</Text>
                            <Text style={styles.infoValue}>{userData.dateOfBirth}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>FATHER'S NO</Text>
                            <Text style={styles.infoValue}>{userData.fatherContact}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MOTHER'S NO</Text>
                            <Text style={styles.infoValue}>{userData.motherContact}</Text>
                        </View>
                    </View>

                    {/* {renderMenuItem('person', 'My Profile')} */}
                    {renderMenuItem('mail', 'Messages', '5')}
                    {/* {renderMenuItem('favorite', 'Favorites')} */}
                    {/* {renderMenuItem('location-on', 'Location')} */}
                    {/* {renderMenuItem('settings', 'Settings')} */}
                    {renderMenuItem('info-outline', 'About')}

                    {/* <TouchableOpacity style={styles.logoutButton}>
                        <MaterialIcons name="logout" size={18} color="red" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity> */}

                    {/* <SignOutButton></SignOutButton> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
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
    },
    logoutText: {
        color: 'red',
        marginLeft: 8,
        fontSize: 16,
    },
});

export default ProfileScreen;