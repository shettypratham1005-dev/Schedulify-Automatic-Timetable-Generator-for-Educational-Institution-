import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import api from '../config/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [semesterBreakdown, setSemesterBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sumRes, workRes, semRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/faculty-workload'),
        api.get('/dashboard/semester-breakdown'),
      ]);
      setSummary(sumRes.data);
      setWorkload(workRes.data);
      setSemesterBreakdown(semRes.data);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleGenerate = () => {
    Alert.alert(
      'Generate Timetable',
      'This will auto-generate timetables for all even semesters (4, 6, 8). Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setGenerating(true);
            try {
              await api.post('/timetables/auto-generate-even', {});
              Alert.alert('Success', 'Timetables generated successfully!');
              fetchData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Generation failed');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner message="Loading Dashboard..." />;

  // Chart data
  const chartData = {
    labels: workload.slice(0, 5).map((f) => f.name?.split(' ')[0] || ''),
    datasets: [
      {
        data: workload.slice(0, 5).map((f) => f.totalHours || 0),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>System Intelligence</Text>
          <Text style={styles.headerSub}>
            Live analytics — 2026 Academic Session
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.statGrid}>
          <StatCard
            icon="view-grid"
            iconColor={Colors.info}
            label="Semesters"
            value="4, 6, 8"
            subtitle="Even Semester Streams"
          />
          <StatCard
            icon="account-group"
            iconColor={Colors.primary}
            label="Faculty"
            value={String(summary?.totalFaculty || 0)}
            subtitle="Active Instructors"
          />
        </View>
        <View style={styles.statGrid}>
          <StatCard
            icon="book-open-variant"
            iconColor={Colors.success}
            label="Subjects"
            value={String(summary?.totalSubjects || 0)}
            subtitle={`${summary?.breakdown?.theory || 0} Theory | ${summary?.breakdown?.practical || 0} Lab`}
          />
          <StatCard
            icon="check-circle"
            iconColor={Colors.warning}
            label="Entries"
            value={String(summary?.totalEntries || 0)}
            subtitle="Scheduled Sessions"
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && { opacity: 0.7 }]}
          onPress={handleGenerate}
          disabled={generating}
        >
          <View style={styles.genIconBox}>
            <MaterialCommunityIcons
              name={generating ? 'loading' : 'play-circle'}
              size={28}
              color={Colors.textOnPrimary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.genTitle}>
              {generating ? 'Generating...' : 'Generate Timetable'}
            </Text>
            <Text style={styles.genSub}>Auto-schedule all even semesters</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>

        {/* Semester Breakdown */}
        <Text style={styles.sectionTitle}>Semester Breakdown</Text>
        {semesterBreakdown.map((sem, idx) => (
          <View key={idx} style={styles.semCard}>
            <View style={styles.semHeader}>
              <View>
                <Text style={styles.semTitle}>Semester {sem.semester}</Text>
                <Text style={styles.semYear}>{sem.className} Year</Text>
              </View>
              <View style={styles.semIconBox}>
                <MaterialCommunityIcons name="layers" size={20} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.semStats}>
              <View style={styles.semStatRow}>
                <Text style={styles.semStatLabel}>Lectures</Text>
                <Text style={styles.semStatValue}>{sem.lectures}</Text>
              </View>
              <View style={styles.semStatRow}>
                <Text style={styles.semStatLabel}>Practicals</Text>
                <Text style={styles.semStatValue}>{sem.practicals}</Text>
              </View>
              <View style={[styles.semStatRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 }]}>
                <Text style={styles.semStatLabel}>Faculty Assigned</Text>
                <Text style={styles.semStatValue}>{sem.facultyAssigned}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Workload Chart */}
        {workload.length > 0 && (
          <View style={styles.chartPanel}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Faculty Workload (Hrs/Week)</Text>
              <View style={styles.chartBadge}>
                <Text style={styles.chartBadgeText}>Top 5</Text>
              </View>
            </View>
            <BarChart
              data={chartData}
              width={screenWidth - 72}
              height={200}
              yAxisSuffix="h"
              fromZero
              chartConfig={{
                backgroundColor: Colors.bgCard,
                backgroundGradientFrom: Colors.bgCard,
                backgroundGradientTo: Colors.bgCard,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: () => Colors.textMuted,
                barPercentage: 0.6,
                propsForBackgroundLines: {
                  stroke: Colors.border,
                  strokeDasharray: '3 3',
                },
              }}
              style={{ borderRadius: Radius.md }}
              showBarTops={false}
            />
          </View>
        )}

        {/* Faculty Workload Table */}
        <Text style={styles.sectionTitle}>Faculty Workload</Text>
        {workload.slice(0, 8).map((f, i) => (
          <View key={i} style={styles.workloadRow}>
            <View style={styles.wlAvatar}>
              <Text style={styles.wlAvatarText}>{f.name?.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wlName}>{f.name}</Text>
              <Text style={styles.wlDept}>{f.department}</Text>
            </View>
            <View style={styles.wlRight}>
              <Text style={styles.wlHours}>{f.totalHours}h</Text>
              <View style={[
                styles.wlStatusBadge,
                { backgroundColor: f.status === 'Overloaded' ? Colors.errorBg : f.status === 'Optimal' ? Colors.successBg : Colors.warningBg }
              ]}>
                <Text style={[
                  styles.wlStatusText,
                  { color: f.status === 'Overloaded' ? Colors.error : f.status === 'Optimal' ? Colors.success : Colors.warning }
                ]}>{f.status}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgMain },
  scroll: { padding: Spacing.xl },
  headerSection: { marginBottom: Spacing.xxl },
  headerTitle: { color: Colors.textMain, fontSize: FontSize.xxl, fontWeight: '800' },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  statGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  // Generate Button
  generateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  genIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genTitle: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  genSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: 2 },
  // Section Title
  sectionTitle: {
    color: Colors.textMain,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  // Semester Cards
  semCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  semHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  semTitle: { color: Colors.textMain, fontSize: FontSize.md, fontWeight: '700' },
  semYear: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  semIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  semStats: { padding: Spacing.lg },
  semStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  semStatLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  semStatValue: { color: Colors.textMain, fontSize: FontSize.sm, fontWeight: '700' },
  // Chart
  chartPanel: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chartTitle: { color: Colors.textMain, fontSize: FontSize.md, fontWeight: '700' },
  chartBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
  // Workload List
  workloadRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  wlAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wlAvatarText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '700' },
  wlName: { color: Colors.textMain, fontSize: FontSize.sm, fontWeight: '700' },
  wlDept: { color: Colors.textMuted, fontSize: FontSize.xs },
  wlRight: { alignItems: 'flex-end' },
  wlHours: { color: Colors.textMain, fontSize: FontSize.md, fontWeight: '800' },
  wlStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  wlStatusText: { fontSize: FontSize.xs, fontWeight: '700' },
});

export default DashboardScreen;
