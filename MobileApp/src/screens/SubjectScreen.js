import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../config/api';
import SubjectCard from '../components/SubjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FormModal, { FormInput, FormPicker } from '../components/FormModal';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const SubjectScreen = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    subject_id: '', name: '', type: 'Lecture', semester: '3', className: 'SE',
  });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally { setLoading(false); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubjects();
    setRefreshing(false);
  }, []);

  const handleSubmit = async () => {
    if (!formData.subject_id || !formData.name) {
      Alert.alert('Missing Fields', 'ID and Name are required.');
      return;
    }
    try {
      const payload = { ...formData, semester: parseInt(formData.semester) || 3 };
      if (editingId) {
        await api.put(`/subjects/${editingId}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchSubjects();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Save failed');
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setFormData({
      subject_id: subject.sub_id || subject.subject_id,
      name: subject.name,
      type: subject.type,
      semester: String(subject.semester),
      className: subject.className,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Subject', 'Remove this subject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/subjects/${id}`); fetchSubjects(); }
          catch { Alert.alert('Error', 'Delete failed'); }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({ subject_id: '', name: '', type: 'Lecture', semester: '3', className: 'SE' });
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.sub_id || s.subject_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = {
    SE: filtered.filter((s) => s.className === 'SE'),
    TE: filtered.filter((s) => s.className === 'TE'),
    BE: filtered.filter((s) => s.className === 'BE'),
  };

  const classLabels = { SE: 'Second Year', TE: 'Third Year', BE: 'Final Year' };

  if (loading) return <LoadingSpinner message="Loading Subjects..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subject Syllabus</Text>
        <TouchableOpacity style={styles.addBtn}
          onPress={() => { setEditingId(null); resetForm(); setShowModal(true); }}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search by name or code..."
          placeholderTextColor={Colors.textMuted} value={searchTerm} onChangeText={setSearchTerm} />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <MaterialCommunityIcons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {Object.entries(grouped).map(([cls, items]) =>
          items.length > 0 ? (
            <View key={cls} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{cls}</Text>
                </View>
                <Text style={styles.groupTitle}>{classLabels[cls]}</Text>
                <Text style={styles.groupCount}>{items.length}</Text>
              </View>
              {items.map((subject) => (
                <SubjectCard key={subject._id} subject={subject} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </View>
          ) : null
        )}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="book-off" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No subjects found</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <FormModal visible={showModal} onClose={() => { setShowModal(false); setEditingId(null); }}
        title={editingId ? 'Edit Subject' : 'New Subject'} subtitle="Fill in the subject details"
        onSubmit={handleSubmit} submitLabel={editingId ? 'Update' : 'Add Subject'}>
        <FormInput label="Subject Code" value={formData.subject_id}
          onChangeText={(v) => setFormData({ ...formData, subject_id: v })} placeholder="e.g. CS401" />
        <FormInput label="Subject Name" value={formData.name}
          onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. Operating Systems" />
        <FormPicker label="Class"
          options={[{ label: 'SE', value: 'SE' }, { label: 'TE', value: 'TE' }, { label: 'BE', value: 'BE' }]}
          selected={formData.className}
          onSelect={(v) => setFormData({ ...formData, className: v, semester: v === 'SE' ? '3' : v === 'TE' ? '5' : '7' })} />
        <FormInput label="Semester" value={formData.semester}
          onChangeText={(v) => setFormData({ ...formData, semester: v })} keyboardType="number-pad" />
        <FormPicker label="Type"
          options={[{ label: 'Lecture', value: 'Lecture' }, { label: 'Practical', value: 'Practical' }, { label: 'Tutorial', value: 'Tutorial' }]}
          selected={formData.type} onSelect={(v) => setFormData({ ...formData, type: v })} />
      </FormModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl },
  title: { color: Colors.textMain, fontSize: FontSize.xl, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md },
  addBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgCard, borderRadius: Radius.md, marginHorizontal: Spacing.xl, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, color: Colors.textMain, paddingVertical: 12, fontSize: FontSize.md },
  list: { padding: Spacing.xl },
  groupSection: { marginBottom: Spacing.xxxl },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.lg },
  groupBadge: { backgroundColor: Colors.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  groupBadgeText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  groupTitle: { color: Colors.textMain, fontSize: FontSize.lg, fontWeight: '700', flex: 1 },
  groupCount: { color: Colors.textMuted, fontSize: FontSize.xs },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: 12 },
});

export default SubjectScreen;
