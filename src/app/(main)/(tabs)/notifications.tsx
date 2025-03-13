import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'New Assignment',
            subtitle: 'Practice Worksheet',
            description: 'Your ward Student Name (IV-D):- Money Class IV',
            date: '27-02-2025',
            uploadedBy: 'Teacher',
            notifyBy: 'Mobile',
        },
        {
            id: '2',
            title: 'New Assignment',
            subtitle: 'Practice Worksheet',
            description: 'Your ward Student Name (IV-D):- Time',
            date: '26-02-2025',
            uploadedBy: 'Teacher',
            notifyBy: 'Mobile',
        },
        {
            id: '3',
            title: 'New Assignment',
            subtitle: 'Practice Worksheet',
            description: 'Your ward Student Name (IV-D):- Data Handling Class IV',
            date: '25-02-2025',
            uploadedBy: 'Teacher',
            notifyBy: 'Mobile',
        },
    ]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = currentDate.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            const newNotification = {
                id: String(Date.now()),
                title: 'New Assignment',
                subtitle: 'Practice Worksheet',
                description: 'Your ward Student Name (IV-D):- New Material',
                date: formattedDate,
                uploadedBy: 'Teacher',
                notifyBy: 'Mobile',
            };

            setNotifications([newNotification, ...notifications]);
            setRefreshing(false);
        }, 1500);
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.uploadInfo}>
                <Text style={styles.uploadedBy}>Uploaded By: {item.uploadedBy}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#008751" barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008751']} tintColor="#008751" />}>
                <Text style={styles.headerText}>Notifications</Text>
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        paddingVertical: 20,
    },
    listContainer: {
        padding: 12,
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#008751',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#008751',
    },
    date: {
        color: '#666',
        fontSize: 12,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#444',
        marginVertical: 6,
    },
    description: {
        fontSize: 13,
        color: '#555',
        marginBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd',
        paddingBottom: 8,
    },
    uploadInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    uploadedBy: {
        fontSize: 13,
        color: '#777',
    },
});
