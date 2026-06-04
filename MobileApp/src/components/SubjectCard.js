import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const SubjectCard = ({ subject, onEdit, onDelete }) => {
  const typeColor = subject.type === 'Lab' ? Colors.practical : Colors.success;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{subject.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{subject.type}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="book-open-variant" size={24} color={Colors.primary} style={{ opacity: 0.4 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="information" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>Code: {subject.sub_id || subject.subject_id}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="layers" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>Semester: {subject.semester}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock" size={14} color={Colors.textMuted} />
          <Text style={styles.infoText}>Class: {subject.className}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(subject)}>
          <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => onDelete(subject._id)}>
          <MaterialCommunityIcons name="delete" size={18} color={Colors.error} />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  name: {
    color: Colors.textMain,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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

export default SubjectCard;
