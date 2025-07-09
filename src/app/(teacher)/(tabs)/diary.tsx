import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { TokenStore } from '../../../../TokenStore';
import {
  uploadDiaryEntry,
  fetchDiaryEntriesByTeacher,
  deleteDiaryEntry,
} from '../../../api/Diary';

const TeacherDiaryPage = () => {
  const [diaryItems, setDiaryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    className: '',
    file: null,
  });

  const LIMIT = 10;

  const getTeacherInfo = async () => {
    try {
      const userInfo = await TokenStore.getUserInfo();
      return userInfo.name || 'Unknown Teacher';
    } catch (error) {
      console.error('Error getting teacher info:', error);
      return 'Unknown Teacher';
    }
  };

  const fetchDiaryEntries = useCallback(
    async (currentOffset = 0, isRefresh = false) => {
      if (loading && !isRefresh) return;

      try {
        setLoading(true);
        const token = await TokenStore.getToken();
        const teacher = await getTeacherInfo();
        // setTeacherName(teacher);
        console.log('Fetching diary entries for teacher:', teacher);
        console.log({
          teacherName: teacher,
          token,
          offset: currentOffset,
          limit: LIMIT,
        })
        const response = await fetchDiaryEntriesByTeacher({
          teacherName: teacher,
          token,
          offset: currentOffset,
          limit: LIMIT,
        });

        if (response?.items) {
          const newItems = Array.isArray(response.items) ? response.items : [];

          if (isRefresh) {
            setDiaryItems(newItems);
            setOffset(LIMIT);
          } else {
            setDiaryItems((prev) => [...prev, ...newItems]);
            setOffset((prev) => prev + LIMIT);
          }
          setHasMore(newItems.length === LIMIT);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load diary entries');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    fetchDiaryEntries(0, true);
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.className) {
      Alert.alert('Error', 'Title and Class Name are required');
      return;
    }

    try {
      setLoading(true);
      const token = await TokenStore.getToken();
      const teacher = await getTeacherInfo();
      console.log('Submitting diary entry for teacher:', teacher);

      await uploadDiaryEntry({
        title: formData.title,
        classname: formData.className,
        teacherName: teacher, // Assuming `teacher` is just the name string
        description: formData.description,
        file: formData.file, // File or null
        token,
      });

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        className: '',
        file: null,
      });

      fetchDiaryEntries(0, true);
      Alert.alert('Success', 'Diary entry created successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to create diary entry');
    } finally {
      setLoading(false);
    }
  };


  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setFormData((prev) => ({
          ...prev,
          file: {
            uri: result.uri,
            name: result.name,
            type: 'application/pdf',
          },
        }));
      }
    } catch (error) {
      console.error('Document Picker Error:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      Alert.alert('Confirm Delete', 'Are you sure you want to delete this entry?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const token = await TokenStore.getToken();
            await deleteDiaryEntry({ entryId, token });
            setDiaryItems((prev) => prev.filter((item) => item.id !== entryId));
            setLoading(false);
          },
        },
      ]);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete diary entry');
      setLoading(false);
    }
  };

  const renderDiaryItem = ({ item }) => (
    <View style={styles.diaryItem}>
      <View style={styles.topRightContainer}>
        <Text style={styles.dateText}>{new Date(item.creation_date).toLocaleDateString()}</Text>
        <Text style={styles.dateText}>{new Date(item.creation_date).toLocaleTimeString()}</Text>
        <TouchableOpacity onPress={() => handleDeleteEntry(item.id)} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="#ff6b9d" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title || 'Untitled'}</Text>
        <Text style={styles.description}>{item.description || 'No description'}</Text>
        <Text style={styles.description2}>By: {item.teacher_name || 'No description'}</Text>

        {item.file_url && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => Alert.alert('Download', `Would download: ${item.file_url}`)}
          >
            <MaterialIcons name="picture-as-pdf" size={20} color="#ff6b9d" />
            <Text style={styles.downloadText}>Download Attachment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Teacher Diary</Text>

      <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>New Entry</Text>
      </TouchableOpacity>

      <FlatList
        data={diaryItems}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDiaryEntries(0, true);
            }}
            colors={['#ff6b9d']}
          />
        }
        onEndReached={() => hasMore && !loading && fetchDiaryEntries(offset)}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={48} color="#ff6b9d" />
            <Text style={styles.emptyText}>No entries yet</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={showCreateModal} animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Diary Entry</Text>

          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor="#999"
            value={formData.title}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Class Name *"
            placeholderTextColor="#999"
            value={formData.className}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, className: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
          />

          <TouchableOpacity style={styles.fileButton} onPress={handlePickPDF}>
            <MaterialIcons name="attach-file" size={20} color="#ff6b9d" />
            <Text style={styles.fileButtonText}>
              {formData.file ? formData.file.name : 'Attach PDF'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitButtonText}>{loading ? 'Uploading...' : 'Submit'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b9d',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  createButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  diaryItem: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 10 },
  topRightContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  deleteButton: { padding: 4 },
  title: { fontWeight: 'bold', fontSize: 18 },
  description: { color: '#555', marginTop: 6 },
  description2: { color: '#212121', marginTop: 3, fontSize: 12 },
  downloadButton: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  downloadText: { marginLeft: 8, color: '#ff6b9d', fontWeight: '500' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { marginTop: 16, color: '#999' },
  modalContent: { padding: 16, backgroundColor: 'white' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  fileButtonText: { marginLeft: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  submitButton: {
    flex: 1,
    backgroundColor: '#ff6b9d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontWeight: '600' },
});

export default TeacherDiaryPage;
