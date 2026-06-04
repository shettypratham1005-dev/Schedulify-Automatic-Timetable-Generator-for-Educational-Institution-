import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const FacultyCard = ({ faculty, onEdit, onDelete, onViewSchedule }) => {
  const workloadPercent = Math.min(100, ((faculty.actualLectures || 0) / (faculty.maxLectures || 20)) * 100);
  const isOverloaded = (faculty.actualLectures || 0) > (faculty.maxLectures || 20);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{faculty.name?.charAt(0) || 'F'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{faculty.name}</Text>
          <Text style={styles.department}>{faculty.department}</Text>
        </View>
        <MaterialCommunityIcons name="account-circle" size={24} color={Colors.primary} style={{ opacity: 0.4 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="identifier" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>ID: {faculty.teacher_id}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            Workload: {faculty.actualLectures || 0}/{faculty.maxLectures || 20} Lec/Week
          </Text>
        </View>

        {/* Workload bar */}
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${workloadPercent}%`,
                backgroundColor: isOverloaded ? Colors.error : Colors.primary,
              },
            ]}
          />
        </View>

        {/* Class tags */}
        <View style={styles.tagRow}>
          {(faculty.classNames || []).map((c) => (
            <View key={c} style={styles.tag}>
              <Text style={styles.tagText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => onViewSchedule(faculty)}>
          <MaterialCommunityIcons name="calendar-search" size={14} color={Colors.primary} />
          <Text style={styles.scheduleBtnText}>Schedule</Text>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(faculty)}>
            <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => onDelete(faculty._id)}>
            <MaterialCommunityIcons name="delete" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  headerInfo: { flex: 1 },
  name: {
    color: Colors.textMain,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  department: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  body: {
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: Colors.primaryLight,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  scheduleBtnText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: Colors.errorBg,
  },
});

export default FacultyCard;
