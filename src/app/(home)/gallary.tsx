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
} from 'react-native';
import FastImage from 'react-native-fast-image';
import YoutubePlayer from 'react-native-youtube-iframe';
import ImageViewing from 'react-native-image-viewing';
import { TokenStore } from '../../../TokenStore';
import { GLOBAL_URL } from '../../../utils';

const { width } = Dimensions.get('window');
const LIMIT = 10;

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
    if (isBottom) loadMore();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadInitialData} />
        }
        onScroll={onScroll}
        scrollEventThrottle={200}
      >
        <Text style={styles.heading}>School Gallery</Text>

        {/* Videos */}
        {videoItems.map((item) => {
          const ref = React.createRef();
          const videoId = extractYouTubeId(item.videoUrl);
          playerRefs.current[item.id] = ref;
          return (
            <View key={item.id} style={styles.videoBox}>
              <YoutubePlayer ref={ref} height={220} play={false} videoId={videoId} />
            </View>
          );
        })}

        {/* Images in Grid */}
        <View style={styles.grid}>
          {imageItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setVisibleImageIndex(index)}
              style={styles.imageBox}
            >
              <FastImage
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading More */}
        {loadingMore && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={{ marginTop: 8, color: '#666' }}>Loading more...</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1a1a1a',
  },
  videoBox: {
    width: width - 32,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  imageBox: {
    width: (width - 48) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
  },
});

export default GalleryScreen;
