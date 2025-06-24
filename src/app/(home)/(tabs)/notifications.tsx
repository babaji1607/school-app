import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, RefreshControl, ScrollView, Image } from 'react-native';
import { Feather, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { fetchNotificationById, fetchNotificationsByType } from '../../../api/Notifications';
import { TokenStore } from '../../../../TokenStore';
import { PRIMARY_COLOR } from '../../../../utils';

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('Global');
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize with empty arrays instead of sample data
    const [globalNotifications, setGlobalNotifications] = useState([]);
    const [studentNotifications, setStudentNotifications] = useState([]);
    const [classNotifications, setClassNotifications] = useState([]);
    const [personalNotifications, setPersonalNotifications] = useState([]);

    const tabs = [
        { key: 'Global', label: 'Global' },
        { key: 'Students', label: 'Students' },
        { key: 'Class', label: 'Class' },
        { key: 'Personal', label: 'Personal' },
    ];

    // Helper function to transform server notification to UI format
    const transformNotification = (serverNotification) => {
        return {
            id: serverNotification.id,
            type: determineNotificationType(serverNotification.title, serverNotification.message),
            title: serverNotification.title,
            description: serverNotification.message,
            time: formatTime(serverNotification.created_at),
            iconType: determineIconType(serverNotification.title, serverNotification.message),
            hasAction: determineHasAction(serverNotification.title, serverNotification.message),
            actionType: determineActionType(serverNotification.title, serverNotification.message),
            actionText: determineActionText(serverNotification.title, serverNotification.message),
            isRead: serverNotification.is_read,
            recipientType: serverNotification.recipient_type,
            recipientId: serverNotification.recipient_id,
            created_at: serverNotification.created_at // Keep original timestamp for sorting
        };
    };

    // Helper function to sort notifications by created_at (newest first)
    const sortNotificationsByTime = (notifications) => {
        return notifications.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA; // Sort in descending order (newest first)
        });
    };

    // Helper function to determine notification type based on content
    const determineNotificationType = (title, message) => {
        const content = (title + ' ' + message).toLowerCase();
        if (content.includes('payment') || content.includes('fee')) return 'payment';
        if (content.includes('live') || content.includes('class starting')) return 'live';
        if (content.includes('alert') || content.includes('urgent') || content.includes('important')) return 'alert';
        return 'notification';
    };

    // Helper function to determine icon type
    const determineIconType = (title, message) => {
        const content = (title + ' ' + message).toLowerCase();
        if (content.includes('payment') || content.includes('fee')) return 'payment';
        if (content.includes('live') || content.includes('video') || content.includes('class starting')) return 'live';
        if (content.includes('alert') || content.includes('urgent') || content.includes('maintenance')) return 'alert';
        return 'notification';
    };

    // Helper function to determine if notification has action
    const determineHasAction = (title, message) => {
        const content = (title + ' ' + message).toLowerCase();
        return content.includes('payment') || content.includes('fee') || content.includes('join') || content.includes('live class');
    };

    // Helper function to determine action type
    const determineActionType = (title, message) => {
        const content = (title + ' ' + message).toLowerCase();
        if (content.includes('payment') || content.includes('fee')) return 'payment';
        if (content.includes('join') || content.includes('live class')) return 'join';
        return null;
    };

    // Helper function to determine action text
    const determineActionText = (title, message) => {
        const content = (title + ' ' + message).toLowerCase();
        if (content.includes('payment') || content.includes('fee')) return 'Pay Fee';
        if (content.includes('join') || content.includes('live class')) return 'Join';
        return null;
    };

    // Helper function to format time using day-based format
    const formatTime = (dateString) => {
        if (!dateString) return '';

        try {
            const now = new Date();
            const notificationDate = new Date(dateString);

            // Check if the date is valid
            if (isNaN(notificationDate.getTime())) {
                return 'Invalid date';
            }

            // Set both dates to start of day for accurate day comparison
            const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const notifDate = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());

            const diffInMs = nowDate.getTime() - notifDate.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            // Handle future dates (in case of server time differences)
            if (diffInMs < 0) {
                return 'Today';
            }

            if (diffInDays === 0) return 'Today';
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 7) return `${diffInDays} days ago`;
            if (diffInDays < 30) {
                const weeks = Math.floor(diffInDays / 7);
                return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
            }
            if (diffInDays < 365) {
                const months = Math.floor(diffInDays / 30);
                return `${months} month${months !== 1 ? 's' : ''} ago`;
            }

            const years = Math.floor(diffInDays / 365);
            return `${years} year${years !== 1 ? 's' : ''} ago`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Unknown time';
        }
    };

    const getCurrentNotifications = () => {
        switch (activeTab) {
            case 'Global':
                return globalNotifications;
            case 'Students':
                return studentNotifications;
            case 'Class':
                return classNotifications;
            case 'Personal':
                return personalNotifications;
            default:
                return globalNotifications;
        }
    };

    const setCurrentNotifications = (notifications) => {
        switch (activeTab) {
            case 'Global':
                setGlobalNotifications(notifications);
                break;
            case 'Students':
                setStudentNotifications(notifications);
                break;
            case 'Class':
                setClassNotifications(notifications);
                break;
            case 'Personal':
                setPersonalNotifications(notifications);
                break;
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotificationsForTab(activeTab);
    };

    const fetchNotificationsForTab = (tabKey) => {
        if (!token) return;

        switch (tabKey) {
            case 'Global':
                fetchGlobalNotifications(token);
                break;
            case 'Students':
                fetchStudentNotifications(token);
                break;
            case 'Class':
                fetchClassNotifications(token);
                break;
            case 'Personal':
                fetchPersonalNotifications(token);
                break;
        }
    };

    // API call functions with proper sorting
    const fetchGlobalNotifications = (token) => {
        setLoading(true);
        fetchNotificationsByType('global', token, (data) => {
            console.log('Successfully fetched global notifications:', data);
            const transformedNotifications = Array.isArray(data) ? data.map(transformNotification) : [];
            const sortedNotifications = sortNotificationsByTime(transformedNotifications);
            setGlobalNotifications(sortedNotifications);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.log("Error fetching global notifications:", error);
            setLoading(false);
            setRefreshing(false);
        });
    };

    const fetchStudentNotifications = (token) => {
        setLoading(true);
        fetchNotificationsByType('student', token, (data) => {
            console.log('Successfully fetched student notifications:', data);
            const transformedNotifications = Array.isArray(data) ? data.map(transformNotification) : [];
            const sortedNotifications = sortNotificationsByTime(transformedNotifications);
            setStudentNotifications(sortedNotifications);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.log("Error fetching student notifications:", error);
            setLoading(false);
            setRefreshing(false);
        });
    };

    const fetchClassNotifications = async (token) => {
        setLoading(true);
        try {
            let userInfo = await TokenStore.getUserInfo();
            let className = userInfo?.class_id;
            console.log('Fetching class notifications for:', className);

            if (className) {
                fetchNotificationsByType(className, token, (data) => {
                    console.log('Successfully fetched class notifications:', data);
                    const transformedNotifications = Array.isArray(data) ? data.map(transformNotification) : [];
                    const sortedNotifications = sortNotificationsByTime(transformedNotifications);
                    setClassNotifications(sortedNotifications);
                    setLoading(false);
                    setRefreshing(false);
                }, (error) => {
                    console.log("Error fetching class notifications:", error);
                    setLoading(false);
                    setRefreshing(false);
                });
            } else {
                console.log("No class_id found in user info");
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.log("Error getting user info:", error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchPersonalNotifications = async (token) => {
        setLoading(true);
        try {
            let userInfo = await TokenStore.getUserInfo();
            let userId = userInfo?.id || userInfo?.user_id;
            console.log('Fetching personal notifications for user:', userId);

            if (userId) {
                fetchNotificationById(
                    userId,
                    token,
                    (data) => {
                        console.log('Successfully fetched personal notifications:', data);
                        const transformedNotifications = Array.isArray(data) ? data.map(transformNotification) : [];
                        const sortedNotifications = sortNotificationsByTime(transformedNotifications);
                        setPersonalNotifications(sortedNotifications);
                        setLoading(false);
                        setRefreshing(false);
                    },
                    (error) => {
                        console.log("Error fetching personal notifications:", error);
                        setLoading(false);
                        setRefreshing(false);
                    }
                )
            } else {
                console.log("No user_id found in user info");
                setLoading(false);
                setRefreshing(false);
            }
        } catch (error) {
            console.log("Error getting user info for personal notifications:", error);
            setLoading(false);
            setRefreshing(false);
        }
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

    const handleActionPress = (notification) => {
        console.log('Action pressed for notification:', notification.id);
        // Add your action handling logic here
        if (notification.actionType === 'payment') {
            // Handle payment action
            console.log('Opening payment flow');
        } else if (notification.actionType === 'join') {
            // Handle join class action
            console.log('Joining class');
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
            <TouchableOpacity
                style={buttonStyle}
                onPress={() => handleActionPress(notification)}
            >
                <Text style={[styles.actionButtonText, { color: textColor }]}>
                    {notification.actionText}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabContainer}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                activeTab === tab.key && styles.activeTab
                            ]}
                            onPress={() => {
                                setActiveTab(tab.key);
                                fetchNotificationsForTab(tab.key);
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.activeTabText
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const currentNotifications = getCurrentNotifications();

    useEffect(() => {
        const getToken = async () => {
            try {
                const token = await TokenStore.getToken();
                setToken(token);
                if (token) {
                    // Fetch notifications for the active tab when token is available
                    fetchNotificationsForTab(activeTab);
                }
            } catch (error) {
                console.log("Error getting token:", error);
            }
        };
        getToken();
    }, []);

    // Fetch notifications when tab changes
    useEffect(() => {
        if (token && activeTab) {
            fetchNotificationsForTab(activeTab);
        }
    }, [activeTab, token]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerText}>Notifications</Text>
            </View>

            {renderTabBar()}

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498DB']} />
                }
            >
                <View style={styles.notificationList}>
                    {loading && currentNotifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Loading notifications...</Text>
                        </View>
                    ) : currentNotifications.length > 0 ? (
                        currentNotifications.map(notification => (
                            <View key={notification.id} style={[
                                styles.notificationCard,
                                !notification.isRead && styles.unreadNotification
                            ]}>
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
                                {/* {!notification.isRead && (
                                    <View style={styles.unreadIndicator} />
                                )} */}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="bell-off" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No notifications in {activeTab}</Text>
                            <Text style={styles.emptySubText}>Pull down to refresh</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5b0c0',
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
    tabBar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    tabContainer: {
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        minWidth: 80,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: PRIMARY_COLOR,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
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
        position: 'relative',
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: PRIMARY_COLOR,
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
    unreadIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3498DB',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
});