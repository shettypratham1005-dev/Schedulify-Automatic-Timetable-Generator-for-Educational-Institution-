import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Modal, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FormModal, { FormInput, FormPicker } from '../components/FormModal';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  { label: '08:15', end: '09:15', type: 'slot' },
  { label: '09:15', end: '10:15', type: 'slot' },
  { label: '10:15', end: '10:30', type: 'break', text: 'BREAK' },
  { label: '10:30', end: '11:30', type: 'slot' },
  { label: '11:30', end: '12:30', type: 'slot' },
  { label: '12:30', end: '01:30', type: 'slot' },
  { label: '01:30', end: '02:30', type: 'break', text: 'LUNCH' },
  { label: '02:30', end: '03:30', type: 'slot' },
  { label: '03:30', end: '04:30', type: 'slot' },
  { label: '04:30', end: '05:30', type: 'slot' },
];

const screenWidth = Dimensions.get('window').width;

const TimetableScreen = () => {
  const [timetables, setTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState('SE');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  // Add entry state
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    day: 'Monday', startTime: '08:15', subject: '', faculty: '', room: '', batch: '', type: 'Lecture',
  });

  useEffect(() => {
    fetchTimetables();
    fetchFormOptions();
  }, [selectedClass, selectedSemester]);

  const fetchTimetables = async () => {
    try {
      const res = await api.get(`/timetables?className=${selectedClass}&semester=${selectedSemester}`);
      setTimetables(res.data);
    } catch (err) {
      console.error('Fetch timetables error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [subRes, teaRes, roomRes] = await Promise.all([
        api.get(`/subjects?className=${selectedClass}`),
        api.get(`/faculties?className=${selectedClass}`),
        api.get('/rooms'),
      ]);
      setSubjects(subRes.data);
      setTeachers(teaRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error('Fetch form options error:', err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTimetables();
    setRefreshing(false);
  }, [selectedClass, selectedSemester]);

  const handleGenerate = () => {
    Alert.alert('Auto-Generate', 'Generate timetables for all even semesters?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Generate',
        onPress: async () => {
          setGenerating(true);
          try {
            await api.post('/timetables/auto-generate-even', {
              className: selectedClass,
              semester: selectedSemester,
            });
            Alert.alert('Success', 'Timetable generated!');
            fetchTimetables();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Generation failed');
          } finally {
            setGenerating(false);
          }
        },
      },
    ]);
  };

  const handleAddEntry = async () => {
    if (!formData.subject || !formData.faculty || !formData.room) {
      Alert.alert('Missing Fields', 'Please select subject, faculty, and room.');
      return;
    }
    try {
      await api.post('/timetables', {
        ...formData,
        className: selectedClass,
        semester: selectedSemester,
      });
      setShowAddModal(false);
      fetchTimetables();
    } catch (err) {
      Alert.alert('Error', 'Failed to add entry. Check for overlapping slots.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Remove this timetable entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/timetables/${id}`);
            setDetailModal(null);
            fetchTimetables();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleExportPDF = async () => {
    try {
      let html = `
        <html><head><style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #4338ca; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #4338ca; color: white; padding: 8px; text-align: center; }
          td { border: 1px solid #ddd; padding: 6px; text-align: center; vertical-align: top; min-width: 80px; }
          .break { background: #f1f5f9; color: #64748b; font-weight: bold; }
          .entry { background: #eef2ff; border-radius: 4px; padding: 3px; margin: 2px 0; font-size: 10px; }
        </style></head><body>
        <h1>Academic Schedule — ${selectedClass} | Semester ${selectedSemester}</h1>
        <table><tr><th>Day / Time</th>`;

      TIME_SLOTS.forEach((s) => {
        html += `<th>${s.label}–${s.end}</th>`;
      });
      html += '</tr>';

      DAYS.forEach((day) => {
        html += `<tr><td><strong>${day}</strong></td>`;
        TIME_SLOTS.forEach((slot) => {
          if (slot.type === 'break') {
            html += `<td class="break">${slot.text}</td>`;
          } else {
            const entries = timetables.filter((t) => t.day === day && t.startTime === slot.label);
            if (entries.length > 0) {
              html += '<td>';
              entries.forEach((e) => {
                html += `<div class="entry"><strong>${e.subject?.name || e.subjectLabel || '-'}</strong><br/>${e.faculty?.name || e.facultyLabel || ''}<br/>${e.room?.room_no || e.roomLabel || ''}</div>`;
              });
              html += '</td>';
            } else {
              html += '<td>—</td>';
            }
          }
        });
        html += '</tr>';
      });

      html += '</table></body></html>';

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Timetable_${selectedClass}_Sem${selectedSemester}`,
      });
    } catch (err) {
      Alert.alert('Error', 'PDF export failed: ' + err.message);
    }
  };

  const getSlotEntries = (day, slotLabel) =>
    timetables.filter((t) => t.day === day && t.startTime === slotLabel);

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'practical': return Colors.practical;
      case 'tutorial': return Colors.tutorial;
      case 'project': return Colors.project;
      default: return Colors.lecture;
    }
  };

  if (loading) return <LoadingSpinner message="Loading Timetable..." />;

  return (
    <View style={styles.container}>
      {/* Controls */}
      <View style={styles.controlBar}>
        <View style={styles.pickerRow}>
          {['SE', 'TE', 'BE'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.classPill, selectedClass === c && styles.classPillActive]}
              onPress={() => {
                setSelectedClass(c);
                setSelectedSemester(c === 'SE' ? 4 : c === 'TE' ? 6 : 8);
              }}
            >
              <Text style={[styles.classPillText, selectedClass === c && styles.classPillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {[3, 4, 5, 6, 7, 8].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.semPill, selectedSemester === s && styles.semPillActive]}
              onPress={() => setSelectedSemester(s)}
            >
              <Text style={[styles.semPillText, selectedSemester === s && styles.semPillTextActive]}>
                Sem {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleGenerate} disabled={generating}>
          <MaterialCommunityIcons name="auto-fix" size={16} color={Colors.primary} />
          <Text style={styles.actionBtnText}>{generating ? 'Generating...' : 'Auto-Generate'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExportPDF}>
          <MaterialCommunityIcons name="file-pdf-box" size={16} color={Colors.error} />
          <Text style={styles.actionBtnText}>Export PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={16} color={Colors.success} />
          <Text style={styles.actionBtnText}>Add Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Timetable Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {DAYS.map((day) => (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <MaterialCommunityIcons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.dayTitle}>{day}</Text>
            </View>
            <View style={styles.slotsRow}>
              {TIME_SLOTS.map((slot, idx) => {
                if (slot.type === 'break') {
                  return (
                    <View key={idx} style={styles.breakSlot}>
                      <Text style={styles.breakText}>{slot.text}</Text>
                    </View>
                  );
                }

                const entries = getSlotEntries(day, slot.label);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.slot, entries.length === 0 && styles.emptySlot]}
                    onPress={() => entries.length > 0 && setDetailModal(entries[0])}
                  >
                    <Text style={styles.slotTime}>{slot.label}</Text>
                    {entries.length > 0 ? (
                      entries.map((e, i) => (
                        <View key={i} style={[styles.entryChip, { borderLeftColor: getTypeColor(e.type) }]}>
                          <Text style={styles.entrySubject} numberOfLines={1}>
                            {e.subject?.name || e.subjectLabel || '-'}
                          </Text>
                          <Text style={styles.entryFaculty} numberOfLines={1}>
                            {e.faculty?.name || e.facultyLabel || ''}
                          </Text>
                          <View style={styles.entryMeta}>
                            <Text style={styles.entryRoom}>{e.room?.room_no || e.roomLabel || ''}</Text>
                            {e.batch && <Text style={styles.entryBatch}>{e.batch === 'ALL' ? 'All' : e.batch}</Text>}
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>—</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!detailModal} transparent animationType="fade" onRequestClose={() => setDetailModal(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDetailModal(null)}>
          <View style={styles.detailCard}>
            <View style={[styles.detailColorBar, { backgroundColor: getTypeColor(detailModal?.type) }]} />
            <Text style={styles.detailTitle}>{detailModal?.subject?.name || detailModal?.subjectLabel}</Text>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{detailModal?.faculty?.name || detailModal?.facultyLabel || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{detailModal?.room?.room_no || detailModal?.roomLabel || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{detailModal?.startTime} — {detailModal?.endTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="tag" size={16} color={Colors.textMuted} />
              <Text style={styles.detailText}>{detailModal?.type} | {detailModal?.day}</Text>
            </View>
            {detailModal?.batch && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="account-group" size={16} color={Colors.textMuted} />
                <Text style={styles.detailText}>Batch: {detailModal.batch}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(detailModal?._id)}>
              <MaterialCommunityIcons name="delete" size={18} color={Colors.error} />
              <Text style={styles.deleteText}>Delete Entry</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Entry Modal */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Entry"
        subtitle="Schedule a new session"
        onSubmit={handleAddEntry}
        submitLabel="Save Entry"
      >
        <FormPicker
          label="Day"
          options={DAYS.map((d) => ({ label: d, value: d }))}
          selected={formData.day}
          onSelect={(v) => setFormData({ ...formData, day: v })}
        />
        <FormPicker
          label="Start Time"
          options={TIME_SLOTS.filter((s) => s.type === 'slot').map((s) => ({ label: s.label, value: s.label }))}
          selected={formData.startTime}
          onSelect={(v) => setFormData({ ...formData, startTime: v })}
        />
        <FormPicker
          label="Subject"
          options={subjects.map((s) => ({ label: `${s.name} (${s.type})`, value: s._id }))}
          selected={formData.subject}
          onSelect={(v) => setFormData({ ...formData, subject: v })}
        />
        <FormPicker
          label="Faculty"
          options={teachers.map((t) => ({ label: t.name, value: t._id }))}
          selected={formData.faculty}
          onSelect={(v) => setFormData({ ...formData, faculty: v })}
        />
        <FormPicker
          label="Room"
          options={rooms.map((r) => ({ label: `${r.room_no} (${r.type})`, value: r._id }))}
          selected={formData.room}
          onSelect={(v) => setFormData({ ...formData, room: v })}
        />
        <FormInput
          label="Batch (Optional)"
          value={formData.batch}
          onChangeText={(v) => setFormData({ ...formData, batch: v })}
          placeholder="e.g. A"
        />
      </FormModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  controlBar: { padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerRow: { flexDirection: 'row', gap: 8 },
  classPill: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  classPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classPillText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' },
  classPillTextActive: { color: Colors.textOnPrimary },
  semPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.sm,
    backgroundColor: Colors.bgCard, marginRight: 6,
  },
  semPillActive: { backgroundColor: Colors.primaryGlow },
  semPillText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  semPillTextActive: { color: Colors.primary },
  // Actions
  actionBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  // Day section
  daySection: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, backgroundColor: Colors.bgMain,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayTitle: { color: Colors.textMain, fontSize: FontSize.md, fontWeight: '700' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: {
    width: '25%', padding: 6, borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: Colors.border, minHeight: 70,
  },
  emptySlot: { justifyContent: 'center', alignItems: 'center' },
  slotTime: { color: Colors.textMuted, fontSize: 9, fontWeight: '600', marginBottom: 2 },
  entryChip: {
    backgroundColor: Colors.bgMain, borderRadius: 6, padding: 4,
    borderLeftWidth: 3, marginTop: 2,
  },
  entrySubject: { color: Colors.textMain, fontSize: 10, fontWeight: '700' },
  entryFaculty: { color: Colors.textMuted, fontSize: 8 },
  entryMeta: { flexDirection: 'row', gap: 4, marginTop: 2 },
  entryRoom: { color: Colors.textMuted, fontSize: 8 },
  entryBatch: { color: Colors.accent, fontSize: 8, fontWeight: '700' },
  emptyText: { color: Colors.border, fontSize: 14 },
  breakSlot: {
    width: '25%', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bgMain, paddingVertical: 10,
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: Colors.border,
  },
  breakText: { color: Colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  // Detail Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Spacing.xxl,
  },
  detailCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xxl,
    borderWidth: 1, borderColor: Colors.border,
  },
  detailColorBar: { height: 4, borderRadius: 2, marginBottom: Spacing.lg },
  detailTitle: { color: Colors.textMain, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  detailText: { color: Colors.textSecondary, fontSize: FontSize.md },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: Spacing.xl, paddingVertical: 12, backgroundColor: Colors.errorBg,
    borderRadius: Radius.md,
  },
  deleteText: { color: Colors.error, fontSize: FontSize.sm, fontWeight: '700' },
});

export default TimetableScreen;
