import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import YoutubePlayer from 'react-native-youtube-iframe';
import ImageViewing from 'react-native-image-viewing';
import { TokenStore } from '../../../TokenStore';
import { GLOBAL_URL } from '../../../utils';

const { width } = Dimensions.get('window');
const LIMIT = 10;

// ✅ Custom throttle function
function throttle(func, limit) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ✅ Fetch items
export async function fetchGalleryItems(offset = 0, limit = LIMIT) {
  const url = `${GLOBAL_URL}/gallery/?offset=${offset}&limit=${limit}`;
  const token = await TokenStore.getToken();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.items;
  } catch (error) {
    console.error('Gallery fetch error:', error.message);
    return [];
  }
}

const GalleryScreen = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleImageIndex, setVisibleImageIndex] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const isMounted = useRef(true);
  const playerRefs = useRef({});

  const loadInitialData = async () => {
    setRefreshing(true);
    setOffset(0);
    const items = await fetchGalleryItems(0);
    if (isMounted.current) {
      setGalleryItems(items);
      setHasMore(items.length === LIMIT);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const newOffset = offset + LIMIT;
    const moreItems = await fetchGalleryItems(newOffset);
    if (isMounted.current) {
      setGalleryItems((prev) => [...prev, ...moreItems]);
      setOffset(newOffset);
      setHasMore(moreItems.length === LIMIT);
      setLoadingMore(false);
    }
  };

  const throttledLoadMore = useRef(throttle(loadMore, 1000)).current;

  useEffect(() => {
    isMounted.current = true;
    loadInitialData();
    return () => {
      isMounted.current = false;
      Object.values(playerRefs.current).forEach((ref) => {
        try {
          ref?.current?.pauseVideo?.();
        } catch (e) {
          console.warn('Error pausing video:', e);
        }
      });
    };
  }, []);

  const imageItems = galleryItems.filter((item) => item.imageUrl && !item.videoUrl);
  const videoItems = galleryItems.filter((item) => item.videoUrl);
  const imageUrls = imageItems.map((item) => ({ uri: item.imageUrl }));

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com.*(?:\?v=|\/embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const onScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isBottom) throttledLoadMore();
  };

  const renderMasonryGrid = () => {
    const columnCount = 2;
    const columns = Array.from({ length: columnCount }, () => []);

    imageItems.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push({ ...item, originalIndex: index });
    });

    return (
      <View style={styles.masonryContainer}>
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((item) => {
              const height = Math.floor(Math.random() * 100) + 180;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setVisibleImageIndex(item.originalIndex)}
                  style={[styles.masonryItem, { height }]}
                >
                  <FastImage
                    source={{ uri: item.imageUrl }}
                    style={styles.masonryImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.imageOverlay}>
                    <View style={styles.overlayGradient} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gallery</Text>
        <Text style={styles.headerSubtitle}>
          {galleryItems.length} {galleryItems.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadInitialData}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Videos Section */}
        {videoItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Videos</Text>
              <View style={styles.sectionLine} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoScrollContainer}
            >
              {videoItems.map((item) => {
                const ref = React.createRef();
                const videoId = extractYouTubeId(item.videoUrl);
                playerRefs.current[item.id] = ref;
                return (
                  <View key={item.id} style={styles.videoCard}>
                    <YoutubePlayer ref={ref} height={200} play={false} videoId={videoId} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Photos Section */}
        {imageItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <View style={styles.sectionLine} />
            </View>
            {renderMasonryGrid()}
          </View>
        )}

        {/* Loading More */}
        {loadingMore && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>Loading more...</Text>
          </View>
        )}

        {/* Empty State */}
        {!refreshing && galleryItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Pull down to refresh and check for new content
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Image Viewer */}
      <ImageViewing
        images={imageUrls}
        imageIndex={visibleImageIndex || 0}
        visible={visibleImageIndex !== null}
        onRequestClose={() => setVisibleImageIndex(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  scrollView: { flex: 1, backgroundColor: '#fafafa' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#374151', marginRight: 12 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  videoScrollContainer: { paddingHorizontal: 20 },
  videoCard: {
    width: width * 0.8,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  masonryContainer: { flexDirection: 'row', paddingHorizontal: 16 },
  column: { flex: 1, paddingHorizontal: 4 },
  masonryItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  masonryImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  overlayGradient: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#64748b', fontSize: 14, fontWeight: '500' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GalleryScreen;
