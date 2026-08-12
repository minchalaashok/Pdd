// LifeLink Mobile — Admin Dashboard Screen
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiGetStats, fetchMobileApi } from '../services/api';
import { COLORS, RADIUS } from '../theme/colors';

export default function AdminScreen() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]           = useState('stats');

  const loadData = async () => {
    const [statsRes, usersRes, hospRes] = await Promise.all([
      apiGetStats(),
      fetchMobileApi('/admin/users'),
      fetchMobileApi('/admin/hospitals'),
    ]);
    if (statsRes.success)  setStats(statsRes.stats);
    if (usersRes.success)  setUsers(usersRes.users?.slice(0, 20) || []);
    if (hospRes.success)   setHospitals(hospRes.hospitals || []);
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const approveHospital = async (id, approve) => {
    const res = await fetchMobileApi(`/admin/hospitals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved: approve ? 1 : 2 }),
    });
    if (res.success) { Alert.alert('✅ Done', `Hospital ${approve ? 'approved' : 'rejected'}.`); loadData(); }
  };

  const suspendUser = async (id, name) => {
    Alert.alert('Suspend User', `Suspend ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: async () => {
        const res = await fetchMobileApi(`/admin/users/${id}/suspend`, { method: 'PUT' });
        if (res.success) { Alert.alert('Done', res.message); loadData(); }
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>Loading admin data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
      >
        <Text style={s.title}>📊 Admin Dashboard</Text>

        {/* Tabs */}
        <View style={s.tabRow}>
          {[['stats', '📈 Stats'], ['users', '👥 Users'], ['hospitals', '🏥 Hospitals']].map(([id, label]) => (
            <TouchableOpacity key={id} style={[s.tab, tab === id && s.activeTab]} onPress={() => setTab(id)}>
              <Text style={[s.tabText, tab === id && s.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATS TAB */}
        {tab === 'stats' && stats && (
          <View>
            <View style={s.statsGrid}>
              <StatCard icon="👥" val={stats.totalUsers}          label="Total Users"       color={COLORS.primary} />
              <StatCard icon="🩸" val={stats.totalDonors}         label="Donors"            color={COLORS.secondary} />
              <StatCard icon="🤲" val={stats.totalReceivers}      label="Receivers"         color={COLORS.warning} />
              <StatCard icon="🏥" val={stats.totalHospitals}      label="Hospitals"         color={COLORS.accent} />
              <StatCard icon="💉" val={stats.totalBloodDonations} label="Blood Donations"   color={COLORS.primary} />
              <StatCard icon="🫀" val={stats.totalOrganDonations} label="Organ Donations"   color='#7C3AED' />
              <StatCard icon="⏳" val={stats.pendingRequests}     label="Pending Requests"  color={COLORS.warning} />
              <StatCard icon="✅" val={stats.completedRequests}   label="Completed"         color={COLORS.accent} />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Blood Inventory</Text>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Total Blood Units</Text>
                <Text style={[s.infoVal, { color: COLORS.primary }]}>{stats.totalBloodUnits}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Available Units</Text>
                <Text style={[s.infoVal, { color: COLORS.accent }]}>{stats.availableBloodUnits}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Organs Available</Text>
                <Text style={[s.infoVal, { color: COLORS.secondary }]}>{stats.availableOrgans}</Text>
              </View>
            </View>
          </View>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          users.length === 0
            ? <View style={s.emptyCard}><Text style={s.emptyText}>No users found.</Text></View>
            : users.map((u, i) => (
                <View key={i} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.userName}>{u.full_name}</Text>
                    <View style={[s.rolePill, { backgroundColor: getRoleColor(u.role) + '22' }]}>
                      <Text style={[s.rolePillText, { color: getRoleColor(u.role) }]}>{u.role}</Text>
                    </View>
                  </View>
                  <Text style={s.userEmail}>📧 {u.email}</Text>
                  {u.city && <Text style={s.userCity}>📍 {u.city}</Text>}
                  <View style={s.userActions}>
                    <View style={[s.statusBadge, u.is_suspended ? { backgroundColor: COLORS.primary + '22' } : { backgroundColor: COLORS.accent + '22' }]}>
                      <Text style={{ color: u.is_suspended ? COLORS.primary : COLORS.accent, fontSize: 12, fontWeight: '700' }}>
                        {u.is_suspended ? '🔴 Suspended' : '🟢 Active'}
                      </Text>
                    </View>
                    <TouchableOpacity style={s.suspendBtn} onPress={() => suspendUser(u.id, u.full_name)}>
                      <Text style={s.suspendBtnText}>{u.is_suspended ? 'Activate' : 'Suspend'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
        )}

        {/* HOSPITALS TAB */}
        {tab === 'hospitals' && (
          hospitals.length === 0
            ? <View style={s.emptyCard}><Text style={s.emptyText}>No hospitals registered.</Text></View>
            : hospitals.map((h, i) => (
                <View key={i} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.userName}>{h.hospital_name || h.owner_name}</Text>
                    <View style={[s.rolePill, {
                      backgroundColor: h.is_approved === 1 ? COLORS.accent + '22' : h.is_approved === 2 ? COLORS.primary + '22' : COLORS.warning + '22'
                    }]}>
                      <Text style={{ fontWeight: '700', fontSize: 12,
                        color: h.is_approved === 1 ? COLORS.accent : h.is_approved === 2 ? COLORS.primary : COLORS.warning
                      }}>
                        {h.is_approved === 1 ? 'Approved' : h.is_approved === 2 ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.userEmail}>📧 {h.email}</Text>
                  {h.is_approved === 0 && (
                    <View style={s.userActions}>
                      <TouchableOpacity style={s.approveBtn} onPress={() => approveHospital(h.id, true)}>
                        <Text style={s.approveBtnText}>✅ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.rejectBtn} onPress={() => approveHospital(h.id, false)}>
                        <Text style={s.rejectBtnText}>❌ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, val, label, color }) {
  return (
    <View style={[s.statCard, { borderColor: color + '44' }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[s.statVal, { color }]}>{val ?? 0}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function getRoleColor(role) {
  const map = { donor: COLORS.primary, receiver: COLORS.warning, hospital: COLORS.secondary, admin: COLORS.accent };
  return map[role] || COLORS.textMuted;
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:     { padding: 16, paddingBottom: 40 },
  centered:   { flex: 1, backgroundColor: COLORS.bgMain, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginTop: 10, marginBottom: 16 },
  tabRow:     { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 4, marginBottom: 16, gap: 4 },
  tab:        { flex: 1, padding: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  activeTab:  { backgroundColor: COLORS.primary },
  tabText:    { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  activeTabText: { color: '#fff' },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard:   { width: '47%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal:    { fontSize: 24, fontWeight: '800' },
  statLabel:  { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },
  card:       { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle:  { fontSize: 14, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel:  { fontSize: 14, color: COLORS.textMuted },
  infoVal:    { fontSize: 16, fontWeight: '800' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  userName:   { fontSize: 15, fontWeight: '700', color: COLORS.textMain, flex: 1, marginRight: 8 },
  userEmail:  { fontSize: 13, color: COLORS.textMuted, marginBottom: 2 },
  userCity:   { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  rolePill:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  rolePillText: { fontSize: 11, fontWeight: '700' },
  userActions:{ flexDirection: 'row', gap: 10, marginTop: 8 },
  statusBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  suspendBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.md, backgroundColor: COLORS.warning + '22', borderWidth: 1, borderColor: COLORS.warning + '55' },
  suspendBtnText: { color: COLORS.warning, fontWeight: '700', fontSize: 13 },
  approveBtn: { flex: 1, backgroundColor: COLORS.accent + '22', borderRadius: RADIUS.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '55' },
  approveBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  rejectBtn:  { flex: 1, backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '55' },
  rejectBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  emptyCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText:  { color: COLORS.textMuted },
});
