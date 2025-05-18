import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, ScrollView, Image } from 'react-native';
import { Feather, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'alert',
            title: 'Notification Alert!',
            description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys ludksjfjfjifjsadfhsadfjsefhsadfjeadfhsjdfjhsdjsedfjwed',
            time: '5 mins ago',
            iconType: 'alert',
            hasAction: false
        },
        {
            id: '2',
            type: 'notification',
            title: 'Notification Alert!',
            description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys ludksjfjfjifjsadfhsadfjsefhsadfjeadfhsjdfjhsdjsedfjwed',
            time: 'Sunday 9/3/2025',
            iconType: 'notification',
            hasAction: false
        },
        {
            id: '3',
            type: 'live',
            title: 'Live Class Alert!',
            description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys sfsd dfssdf sdf f sdfsfdsfds fsd sdfsdfsfsdfs sdfssdfsdf',
            time: '1 week ago',
            iconType: 'live',
            hasAction: true,
            actionType: 'join',
            actionText: 'Join'
        },
        {
            id: '4',
            type: 'payment',
            title: 'Fee Payment due alert',
            description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys ludksjfjfjifjsadfhsadfjsefhsadfjeadfhsjdfjhsdjsedfjwed',
            time: '',
            iconType: 'payment',
            hasAction: true,
            actionType: 'payment',
            actionText: 'Pay Fee'
        },
        {
            id: '5',
            type: 'notification',
            title: 'Notification Alert!',
            description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys ludksjfjfjifjsadfhsadfjsefhsadfjeadfhsjdfjhsdjsedfjwed',
            time: 'Sunday 9/3/2025',
            iconType: 'notification',
            hasAction: false
        },
    ]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            const newNotification = {
                id: String(Date.now()),
                type: 'alert',
                title: 'New Notification Alert!',
                description: 'Lorem ipsum dolor sit amet de vula fibjobj olkwpcifecjfys ludksjfjfjifjsadfhsadfjsefhsadfjeadfhsjdfjhsdjsedfjwed',
                time: 'Just now',
                iconType: 'alert',
                hasAction: false
            };

            setNotifications([newNotification, ...notifications]);
            setRefreshing(false);
        }, 1500);
    };

    const renderNotificationIcon = (iconType) => {
        switch (iconType) {
            case 'alert':
                return (
                    <View style={[styles.iconContainer, { backgroundColor: '#FFE0E0' }]}>
                        <FontAwesome5 name="bell" size={20} color="#E74C3C" />
                    </View>
                );
            case 'notification':
                return (
                    <View style={[styles.iconContainer, { backgroundColor: '#E8F4F8' }]}>
                        <Ionicons name="notifications" size={20} color="#3498DB" />
                    </View>
                );
            case 'live':
                return (
                    <View style={[styles.iconContainer, { backgroundColor: '#E8F8F5' }]}>
                        <FontAwesome5 name="video" size={20} color="#1ABC9C" />
                    </View>
                );
            case 'payment':
                return (
                    <View style={[styles.iconContainer, { backgroundColor: '#FEF5E7' }]}>
                        <MaterialIcons name="payment" size={20} color="#F39C12" />
                    </View>
                );
            default:
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="info" size={20} color="#3498DB" />
                    </View>
                );
        }
    };

    const renderActionButton = (notification) => {
        if (!notification.hasAction) return null;

        let buttonStyle = styles.actionButton;
        let textColor = '#3498DB';

        if (notification.actionType === 'join') {
            buttonStyle = { ...buttonStyle, backgroundColor: '#FCE4EC' };
            textColor = '#E91E63';
        } else if (notification.actionType === 'payment') {
            buttonStyle = { ...buttonStyle, backgroundColor: '#FEF5E7' };
            textColor = '#F39C12';
        }

        return (
            <TouchableOpacity style={buttonStyle}>
                <Text style={[styles.actionButtonText, { color: textColor }]}>
                    {notification.actionText}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerText}>Notifications</Text>
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498DB']} />
                }
            >
                <View style={styles.notificationList}>
                    {notifications.map(notification => (
                        <View key={notification.id} style={styles.notificationCard}>
                            <View style={styles.notificationContent}>
                                {renderNotificationIcon(notification.iconType)}
                                <View style={styles.textContainer}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.title}>{notification.title}</Text>
                                        {notification.time ? (
                                            <Text style={styles.time}>{notification.time}</Text>
                                        ) : null}
                                    </View>
                                    <Text style={styles.description} numberOfLines={2}>
                                        {notification.description}
                                    </Text>
                                    {renderActionButton(notification)}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    notificationList: {
        padding: 12,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    notificationContent: {
        flexDirection: 'row',
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: '#888',
    },
    description: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 10,
    },
    actionButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 5,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});