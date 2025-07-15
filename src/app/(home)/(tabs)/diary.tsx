import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import FileViewer from 'react-native-file-viewer';
import { TokenStore } from '../../../../TokenStore';
import { getDiaryByClass } from '../../../api/Diary';
import { getStudentById } from '../../../api/Students';

const getClass = async () => {
  try {
    const Token = await TokenStore.getToken();
    const student = await TokenStore.getUserInfo();
    const stid = student.id;
    const info = await getStudentById(Token, stid);
    console.log({ info })
    return info.classroom.name || 'lkg'; // Default to 'lkg' if classname is not available
  } catch (e) {
    console.log(e);
  }
};

const DiaryPage = () => {
  const [diaryItems, setDiaryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const LIMIT = 10;

  // Handle file download and viewing
  const handleDownloadAndView = async (fileUrl, title, itemId) => {
    if (!fileUrl) {
      Alert.alert('No attachment', 'There is no file attached to this item');
      return;
    }

    try {
      setDownloadingId(itemId);

      // Create a valid filename
      const fileExtension = fileUrl.split('.').pop() || 'file';
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeTitle}.${fileExtension}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);

      // Open the file with FileViewer
      await FileViewer.open(downloadResult.uri, {
        showOpenWithDialog: true,
        onDismiss: () => {
          setDownloadingId(null);
        },
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Could not open the file. Make sure you have an app installed that can open this file type.'
      );
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Convert all dates to local time for comparison
      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

      if (localDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (localDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return localDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return raw string if parsing fails
    }
  };

  // Fetch diary items
  const fetchDiaryItems = useCallback(async (currentOffset = 0, isRefresh = false) => {
    if (loading && !isRefresh) return;

    try {
      setLoading(true);
      const token = await TokenStore.getToken();
      const className = await getClass()

      await getDiaryByClass(
        className,
        currentOffset,
        LIMIT,
        token,
        (data) => {
          if (data?.items) {
            const newItems = Array.isArray(data.items) ? data.items : [];

            if (isRefresh) {
              setDiaryItems(newItems);
              setOffset(LIMIT);
            } else {
              setDiaryItems(prev => [...prev, ...newItems]);
              setOffset(prev => prev + LIMIT);
            }
            setHasMore(newItems.length === LIMIT);
          }
        },
        (error) => {
          console.error('Fetch error:', error);
          Alert.alert('Error', 'Failed to load diary items');
        }
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  // Initial load and refresh
  useEffect(() => { fetchDiaryItems(0, true); }, []);

  // Render diary item with date in top right
  const renderDiaryItem = ({ item }) => {
    const isDownloading = downloadingId === item.id;

    return (
      <View style={styles.diaryItem}>
        {/* Date in top right corner */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.creation_date)}</Text>
        </View>

        {/* Diary page lines effect */}
        <View style={styles.diaryLines}>
          <View style={styles.redLine} />
          <View style={styles.blueLine} />
          <View style={styles.blueLine} />
          <View style={styles.blueLine} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>
          <Text style={styles.description}>{item.description || 'No description available'}</Text>

          {item.file_url && (
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isDownloading && styles.downloadingButton
              ]}
              onPress={() => handleDownloadAndView(item.file_url, item.title, item.id)}
              disabled={isDownloading}
            >
              <View style={styles.downloadIconContainer}>
                <Text style={styles.downloadIcon}>📎</Text>
              </View>
              <Text style={styles.downloadText}>
                {isDownloading ? 'Opening...' : 'Download Attachment'}
              </Text>
              <Text style={styles.downloadArrow}>⬇</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Diary page holes */}
        <View style={styles.holes}>
          <View style={styles.hole} />
          <View style={styles.hole} />
          <View style={styles.hole} />
        </View>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ff6b9d" />
        <Text style={styles.loadingText}>Loading more items...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No diary items found</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{
        paddingVertical: 25,
        paddingHorizontal: 10,
      }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold'
        }}>Diary</Text>
      </View>
      <FlatList
        data={diaryItems}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDiaryItems(0, true);
            }}
            colors={['#ff6b9d']}
            tintColor="#ff6b9d"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        onEndReached={() => hasMore && !loading && fetchDiaryItems(offset)}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5b0c0',
    paddingHorizontal: 20,
    // paddingTop: 30
  },
  diaryItem: {
    backgroundColor: '#fef9e7',
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b9d',
    position: 'relative',
    overflow: 'hidden',
  },
  dateContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#d4336a',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b1538',
  },
  diaryLines: {
    position: 'absolute',
    left: 50,
    top: 0,
    bottom: 0,
    width: 2,
    flexDirection: 'column',
  },
  redLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#ff6b9d',
    position: 'absolute',
    left: 0,
  },
  blueLine: {
    width: 1,
    height: 25,
    backgroundColor: '#b8d4f0',
    marginTop: 30,
    marginLeft: 20,
  },
  contentContainer: {
    paddingLeft: 80,
    paddingRight: 20,
    paddingVertical: 20,
    paddingTop: 30, // Added to make space for date
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d1810',
    marginBottom: 12,
    fontFamily: 'cursive',
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    color: '#5a4037',
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b9d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#ff6b9d',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  downloadingButton: {
    backgroundColor: '#888',
  },
  downloadIconContainer: {
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  downloadIcon: {
    fontSize: 16,
  },
  downloadText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  downloadArrow: {
    color: 'white',
    fontSize: 25,
    marginRight: 10,
    fontWeight: 'bold',
  },
  holes: {
    position: 'absolute',
    left: 15,
    top: 25,
    bottom: 25,
    width: 20,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  hole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f5b0c0',
    borderWidth: 1,
    borderColor: '#d4336a',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 12,
    color: '#8b1538',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 20,
    color: '#8b1538',
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#d4336a',
    fontStyle: 'italic',
  },
});

export default DiaryPage;