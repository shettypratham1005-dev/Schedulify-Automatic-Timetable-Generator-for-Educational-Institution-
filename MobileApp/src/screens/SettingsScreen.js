import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getBaseURL, setBaseURL } from '../config/api';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState(getBaseURL());
  const [saved, setSaved] = useState(false);

  const handleSaveUrl = () => {
    if (!apiUrl.startsWith('http')) {
      Alert.alert('Invalid URL', 'URL must start with http:// or https://');
      return;
    }
    setBaseURL(apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.name || 'Administrator'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'admin@schedulify.com'}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* API Configuration */}
        <Text style={styles.sectionTitle}>Server Configuration</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <MaterialCommunityIcons name="server-network" size={20} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>API Server URL</Text>
              <Text style={styles.settingHint}>
                Use 10.0.2.2:5000 for emulator, or your PC's IP for physical device
              </Text>
            </View>
          </View>
          <TextInput
            style={styles.urlInput}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://10.0.2.2:5000"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
            <MaterialCommunityIcons
              name={saved ? 'check-circle' : 'content-save'}
              size={18}
              color={Colors.textOnPrimary}
            />
            <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save URL'}</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>Schedulify Mobile</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>Android</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend</Text>
            <Text style={styles.infoValue}>Express + MongoDB</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          © 2026 Schedulify. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  pageTitle: { color: Colors.textMain, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.xxl },
  sectionTitle: {
    color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.xxl, marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, marginBottom: Spacing.md,
  },
  // Profile
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.primaryGlow, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '700' },
  profileName: { color: Colors.textMain, fontSize: FontSize.lg, fontWeight: '700' },
  profileEmail: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  roleBadge: { backgroundColor: Colors.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
  // API config
  settingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: Spacing.md },
  settingLabel: { color: Colors.textMain, fontSize: FontSize.md, fontWeight: '600' },
  settingHint: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  urlInput: {
    backgroundColor: Colors.bgMain, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 14, color: Colors.textMain, fontSize: FontSize.md, marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: Radius.md,
  },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  infoValue: { color: Colors.textMain, fontSize: FontSize.sm, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.errorBg, borderRadius: Radius.lg, paddingVertical: 16,
    marginTop: Spacing.xxxl, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { color: Colors.error, fontSize: FontSize.md, fontWeight: '700' },
  footerText: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.xxl },
});

export default SettingsScreen;
