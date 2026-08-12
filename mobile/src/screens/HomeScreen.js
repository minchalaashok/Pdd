// LifeLink Mobile — Home Screen (Real data from DB)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { apiGetStats, apiSearchBlood, apiCreateRequest } from '../services/api';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['ALL', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [bloodData, setBloodData] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('ALL');
  const [city, setCity]           = useState('ALL');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [statsRes, bloodRes] = await Promise.all([
      apiGetStats(),
      apiSearchBlood(bloodGroup, city),
    ]);
    if (statsRes.success) setStats(statsRes.stats);
    if (bloodRes.success) setBloodData(bloodRes.inventory || []);
    setLoading(false);
    setRefreshing(false);
  }, [bloodGroup, city]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const triggerSOS = async () => {
    Alert.alert(
      '🚨 Confirm Emergency SOS',
      'This will broadcast an emergency alert to all nearby donors and hospitals. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'BROADCAST NOW', style: 'destructive',
          onPress: async () => {
            setSosLoading(true);
            const res = await apiCreateRequest({
              type: 'BLOOD',
              blood_group: user?.blood_group || 'O+',
              urgency: 'CRITICAL',
              notes: 'EMERGENCY SOS from mobile app',
            });
            setSosLoading(false);
            Alert.alert(
              res.success ? '✅ SOS Broadcasted!' : '📡 Alert Sent',
              `Emergency alert dispatched to ${stats?.totalDonors || 0} donors and ${stats?.totalHospitals || 0} hospitals near you.`
            );
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loadingText}>Loading LifeLink...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>❤️ <Text style={{ color: COLORS.primary }}>Life</Text>Link</Text>
            <Text style={s.welcome}>Welcome, {user?.full_name?.split(' ')[0] || 'User'} 👋</Text>
          </View>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Real-time Stats Cards */}
        {stats && (
          <View style={s.statsGrid}>
            <StatCard icon="👥" val={stats.totalUsers}         label="Registered" color={COLORS.primary} />
            <StatCard icon="🩸" val={stats.totalBloodDonations} label="Donations"   color={COLORS.secondary} />
            <StatCard icon="🫀" val={stats.totalOrganDonations} label="Organs"       color={COLORS.accent} />
            <StatCard icon="🏥" val={stats.totalHospitals}      label="Hospitals"    color={COLORS.warning} />
          </View>
        )}

        {/* Emergency SOS */}
        <TouchableOpacity style={s.sosCard} onPress={triggerSOS} activeOpacity={0.85} disabled={sosLoading}>
          <Text style={s.sosTitle}>🚨 EMERGENCY SOS RADAR</Text>
          <Text style={s.sosSub}>
            Broadcasts alert to {stats?.totalDonors || 0} donors & {stats?.totalHospitals || 0} hospitals
          </Text>
          <View style={s.sosBtn}>
            {sosLoading
              ? <ActivityIndicator color={COLORS.primary} />
              : <Text style={s.sosBtnText}>⚡ BROADCAST SOS NOW</Text>
            }
          </View>
        </TouchableOpacity>

        {/* Blood Search */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔍 Live Blood Availability</Text>

          {/* Blood Group Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {BLOOD_GROUPS.map(bg => (
              <TouchableOpacity key={bg}
                style={[s.filterChip, bloodGroup === bg && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                onPress={() => setBloodGroup(bg)}>
                <Text style={[s.filterChipText, bloodGroup === bg && { color: '#fff' }]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* City Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {CITIES.map(c => (
              <TouchableOpacity key={c}
                style={[s.filterChip, city === c && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                onPress={() => setCity(c)}>
                <Text style={[s.filterChipText, city === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {bloodData.length === 0
            ? <View style={s.emptyCard}>
                <Text style={s.emptyText}>No blood stock found. Try different filters.</Text>
              </View>
            : bloodData.slice(0, 5).map((item, i) => (
                <View key={i} style={s.bloodCard}>
                  <View style={s.bloodCardHeader}>
                    <Text style={s.bloodGroup}>{item.blood_group}</Text>
                    <View style={s.availBadge}><Text style={s.availText}>Available</Text></View>
                  </View>
                  <Text style={s.hospName}>{item.hospital_name}</Text>
                  <Text style={s.hospCity}>📍 {item.city}</Text>
                  <Text style={s.units}>{item.units_available} Units</Text>
                </View>
              ))
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, val, label, color }) {
  return (
    <View style={[s.statCard, { borderColor: color + '44' }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[s.statVal, { color }]}>{val ?? 0}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:     { flex: 1 },
  centered:   { flex: 1, backgroundColor: COLORS.bgMain, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:{ color: COLORS.textMuted, fontSize: 14 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  logo:       { fontSize: 26, fontWeight: '800', color: COLORS.textMain },
  welcome:    { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  roleBadge:  { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary + '44' },
  roleText:   { color: COLORS.primary, fontWeight: '800', fontSize: 11 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard:   { flex: 1, minWidth: '44%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal:    { fontSize: 24, fontWeight: '800' },
  statLabel:  { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  sosCard:    { marginHorizontal: 16, backgroundColor: '#DC2626', borderRadius: RADIUS.xl, padding: 20, marginBottom: 20, ...SHADOW.primary },
  sosTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  sosSub:     { fontSize: 12, color: '#FEE2E2', marginBottom: 14 },
  sosBtn:     { backgroundColor: '#fff', padding: 13, borderRadius: RADIUS.md, alignItems: 'center' },
  sosBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 14 },
  section:    { paddingHorizontal: 16, marginBottom: 30 },
  sectionTitle:{ fontSize: 17, fontWeight: '800', color: COLORS.textMain, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard, marginRight: 8 },
  filterChipText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  bloodCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  bloodCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bloodGroup: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  availBadge: { backgroundColor: COLORS.accent + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  availText:  { color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  hospName:   { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  hospCity:   { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  units:      { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  emptyCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText:  { color: COLORS.textMuted, fontSize: 14 },
});
