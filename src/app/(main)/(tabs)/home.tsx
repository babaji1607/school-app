import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, { FadeInUp, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Calendar, LibraryBig, MessageCircle, Newspaper } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const newsData = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
        title: 'Annual Science Fair Winners Announced',
        description: 'Congratulations to all participants in this year\'s Science Fair...'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
        title: 'New Sports Complex Opening',
        description: 'The state-of-the-art sports facility will be inaugurated next month...'
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
        title: 'Student Achievement Awards',
        description: 'Outstanding students recognized for their academic excellence...'
    }
];

const quickAccessItems = [
    { id: '1', title: 'Library', icon: LibraryBig },
    { id: '2', title: 'Calendar', icon: Calendar },
    { id: '3', title: 'Homework', icon: Book },
    { id: '4', title: 'Messages', icon: MessageCircle },
    { id: '5', title: 'News', icon: Newspaper },
];

const events = [
    {
        id: '1',
        title: 'Parent-Teacher Meeting',
        date: 'March 15, 2024',
        image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
        description: 'Annual parent-teacher conference to discuss student progress'
    },
    {
        id: '2',
        title: 'Sports Day',
        date: 'March 20, 2024',
        image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop',
        description: 'Annual sports competition featuring various athletic events'
    },
    {
        id: '3',
        title: 'Science Exhibition',
        date: 'March 25, 2024',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
        description: 'Students showcase their innovative science projects'
    }
];

export default function HomePage() {
    const [fontsLoaded] = useFonts({
        'Inter-Regular': Inter_400Regular,
        'Inter-SemiBold': Inter_600SemiBold,
        'Inter-Bold': Inter_700Bold,
    });

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* News Carousel */}
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.carousel}
                >
                    {newsData.map((item) => (
                        <View key={item.id} style={[styles.carouselItem, { width }]}>
                            <Image source={{ uri: item.image }} style={styles.carouselImage} />
                            <View style={styles.carouselContent}>
                                <Text style={styles.carouselTitle}>{item.title}</Text>
                                <Text style={styles.carouselDescription}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Quick Access Menu */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickAccess}
                >
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Pressable key={item.id} style={styles.quickAccessItem}>
                                <View style={styles.quickAccessIconContainer}>
                                    <Icon size={24} color="#2563eb" />
                                </View>
                                <Text style={styles.quickAccessText}>{item.title}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Upcoming Events */}
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {events.map((event, index) => (
                        <Animated.View
                            key={event.id}
                            entering={FadeInUp.delay(index * 200)}
                            style={styles.eventCard}
                        >
                            <Image source={{ uri: event.image }} style={styles.eventImage} />
                            <View style={styles.eventContent}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>{event.date}</Text>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    carousel: {
        height: 250,
    },
    carouselItem: {
        height: 250,
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    carouselContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    carouselTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#ffffff',
        marginBottom: 8,
    },
    carouselDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#ffffff',
    },
    quickAccess: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    quickAccessItem: {
        alignItems: 'center',
        marginRight: 24,
    },
    quickAccessIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickAccessText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
        color: '#1e293b',
    },
    eventsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1e293b',
        marginBottom: 16,
    },
    eventCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    eventImage: {
        width: '100%',
        height: 200,
    },
    eventContent: {
        padding: 16,
    },
    eventTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: '#1e293b',
        marginBottom: 4,
    },
    eventDate: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#2563eb',
        marginBottom: 8,
    },
    eventDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#64748b',
    },
});