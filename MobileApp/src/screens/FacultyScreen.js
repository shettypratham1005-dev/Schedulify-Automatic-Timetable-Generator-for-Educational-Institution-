import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../config/api';
import FacultyCard from '../components/FacultyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FormModal, { FormInput, FormPicker } from '../components/FormModal';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const FacultyScreen = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    teacher_id: '', name: '', department: 'Computer Science', maxLectures: '20', classNames: [],
  });

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleFacultyName, setScheduleFacultyName] = useState('');

  useEffect(() => { fetchFaculties(); }, []);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/faculties/all');
      setFaculties(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFaculties();
    setRefreshing(false);
  }, []);

  const handleSubmit = async () => {
    if (!formData.teacher_id || !formData.name) {
      Alert.alert('Missing Fields', 'ID and Name are required.');
      return;
    }
    try {
      const payload = { ...formData, maxLectures: parseInt(formData.maxLectures) || 20 };
      if (editingId) {
        await api.put(`/faculties/${editingId}`, payload);
      } else {
        await api.post('/faculties', payload);
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchFaculties();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Save failed');
    }
  };

  const handleEdit = (faculty) => {
    setEditingId(faculty._id);
    setFormData({
      teacher_id: faculty.teacher_id,
      name: faculty.name,
      department: faculty.department,
      maxLectures: String(faculty.maxLectures || 20),
      classNames: faculty.classNames || [],
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Faculty', 'Remove this faculty member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/faculties/${id}`);
            fetchFaculties();
          } catch { Alert.alert('Error', 'Delete failed'); }
        },
      },
    ]);
  };

  const handleViewSchedule = async (faculty) => {
    try {
      setScheduleFacultyName(faculty.name);
      const res = await api.get(`/timetables/faculty/${faculty._id}`);
      setScheduleData(res.data);
      setShowScheduleModal(true);
    } catch {
      Alert.alert('Error', 'Failed to load schedule');
    }
  };

  const resetForm = () => {
    setFormData({ teacher_id: '', name: '', department: 'Computer Science', maxLectures: '20', classNames: [] });
  };

  const toggleClass = (cls) => {
    setFormData((prev) => ({
      ...prev,
      classNames: prev.classNames.includes(cls)
        ? prev.classNames.filter((c) => c !== cls)
        : [...prev.classNames, cls],
    }));
  };

  const filtered = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading Faculty..." />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Faculty Management</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setEditingId(null); resetForm(); setShowModal(true); }}
        >
          <MaterialCommunityIcons name="plus" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or department..."
          placeholderTextColor={Colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <MaterialCommunityIcons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {filtered.length > 0 ? (
          filtered.map((faculty) => (
            <FacultyCard
              key={faculty._id}
              faculty={faculty}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewSchedule={handleViewSchedule}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-off" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No faculty found</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <FormModal
        visible={showModal}
        onClose={() => { setShowModal(false); setEditingId(null); }}
        title={editingId ? 'Edit Faculty' : 'New Faculty'}
        subtitle="Fill in the faculty details"
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Update' : 'Add Faculty'}
      >
        <FormInput label="Faculty ID" value={formData.teacher_id} onChangeText={(v) => setFormData({ ...formData, teacher_id: v })} placeholder="e.g. T001" />
        <FormInput label="Full Name" value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} placeholder="e.g. Dr. Jane Smith" />
        <FormInput label="Department" value={formData.department} onChangeText={(v) => setFormData({ ...formData, department: v })} placeholder="Computer Science" />
        <FormInput label="Max Lectures/Week" value={formData.maxLectures} onChangeText={(v) => setFormData({ ...formData, maxLectures: v })} keyboardType="number-pad" placeholder="20" />

        <View style={styles.classPickerGroup}>
          <Text style={styles.classPickerLabel}>Assigned Classes</Text>
          <View style={styles.classPickerRow}>
            {['SE', 'TE', 'BE'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.classChip, formData.classNames.includes(c) && styles.classChipActive]}
                onPress={() => toggleClass(c)}
              >
                <Text style={[styles.classChipText, formData.classNames.includes(c) && styles.classChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </FormModal>

      {/* Schedule Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <View style={styles.schedOverlay}>
          <View style={styles.schedContainer}>
            <View style={styles.schedHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.schedTitle}>{scheduleFacultyName}'s Schedule</Text>
                <Text style={styles.schedSub}>Weekly assignments</Text>
              </View>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)} style={styles.schedClose}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const dayItems = scheduleData.filter((s) => s.day === day);
                return (
                  <View key={day} style={{ marginBottom: 16 }}>
                    <Text style={styles.schedDay}>{day}</Text>
                    {dayItems.length > 0 ? (
                      dayItems.map((item, idx) => (
                        <View key={idx} style={styles.schedItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.schedSubject}>{item.subject?.name}</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                              <Text style={styles.schedMeta}>{item.room?.room_no}</Text>
                              <Text style={styles.schedMeta}>{item.className} — {item.type}</Text>
                            </View>
                          </View>
                          <Text style={styles.schedTime}>{item.startTime}–{item.endTime}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.schedEmpty}>No sessions</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.xl,
  },
  title: { color: Colors.textMain, fontSize: FontSize.xl, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.md,
  },
  addBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    marginHorizontal: Spacing.xl, paddingHorizontal: 14, borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textMain, paddingVertical: 12, fontSize: FontSize.md },
  list: { padding: Spacing.xl },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: 12 },
  // Class picker in form
  classPickerGroup: { marginBottom: Spacing.lg },
  classPickerLabel: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 8 },
  classPickerRow: { flexDirection: 'row', gap: 10 },
  classChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.bgMain, borderWidth: 1, borderColor: Colors.border,
  },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  classChipTextActive: { color: Colors.textOnPrimary },
  // Schedule Modal
  schedOverlay: { flex: 1, backgroundColor: Colors.bgModal, justifyContent: 'flex-end' },
  schedContainer: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
    maxHeight: '85%', padding: Spacing.xxl,
  },
  schedHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xl },
  schedTitle: { color: Colors.textMain, fontSize: FontSize.xl, fontWeight: '700' },
  schedSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  schedClose: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgMain,
    justifyContent: 'center', alignItems: 'center',
  },
  schedDay: {
    color: Colors.primary, fontSize: FontSize.md, fontWeight: '700',
    paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 8,
  },
  schedItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgMain,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: 6,
  },
  schedSubject: { color: Colors.textMain, fontSize: FontSize.sm, fontWeight: '700' },
  schedMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  schedTime: { color: Colors.textMain, fontSize: FontSize.sm, fontWeight: '800' },
  schedEmpty: { color: Colors.textMuted, fontSize: FontSize.xs, fontStyle: 'italic', marginBottom: 8 },
});

export default FacultyScreen;
