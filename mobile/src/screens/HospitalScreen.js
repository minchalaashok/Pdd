// LifeLink Mobile — Hospital Screen (Real data)
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchMobileApi } from '../services/api';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

export default function HospitalScreen() {
  const [hospitals, setHospitals] = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]             = useState('hospitals');

  const loadData = async () => {
    const [hospRes, reqRes] = await Promise.all([
      fetchMobileApi('/admin/hospitals'),
      fetchMobileApi('/requests'),
    ]);
    if (hospRes.success) setHospitals(hospRes.hospitals || []);
    if (reqRes.success)  setRequests(reqRes.requests || []);
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateRequestStatus = async (id, status) => {
    const res = await fetchMobileApi(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      Alert.alert('✅ Updated', `Request marked as ${status}`);
      loadData();
    }
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pending   = requests.filter(r => r.status === 'PENDING');
  const fulfilled = requests.filter(r => r.status === 'FULFILLED');
  const approved  = hospitals.filter(h => h.is_approved === 1);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
      >
        <Text style={s.title}>🏥 Hospital Portal</Text>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <StatBox icon="🏥" val={approved.length}  label="Approved"  color={COLORS.accent} />
          <StatBox icon="⏳" val={pending.length}   label="Pending"   color={COLORS.warning} />
          <StatBox icon="✅" val={fulfilled.length} label="Fulfilled" color={COLORS.secondary} />
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          {[['hospitals', '🏥 Hospitals'], ['requests', '📋 Requests']].map(([id, label]) => (
            <TouchableOpacity key={id} style={[s.tab, tab === id && s.activeTab]} onPress={() => setTab(id)}>
              <Text style={[s.tabText, tab === id && s.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HOSPITALS TAB */}
        {tab === 'hospitals' && (
          hospitals.length === 0
            ? <View style={s.emptyCard}><Text style={s.emptyText}>No hospitals registered yet.</Text></View>
            : hospitals.map((h, i) => (
                <View key={i} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.hospName}>{h.hospital_name || h.owner_name}</Text>
                    <View style={[s.badge,
                      h.is_approved === 1 && { backgroundColor: COLORS.accent + '22', borderColor: COLORS.accent + '55' },
                      h.is_approved === 2 && { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary + '55' },
                    ]}>
                      <Text style={[s.badgeText,
                        h.is_approved === 1 && { color: COLORS.accent },
                        h.is_approved === 2 && { color: COLORS.primary },
                      ]}>
                        {h.is_approved === 1 ? '✅ Approved' : h.is_approved === 2 ? '❌ Rejected' : '⏳ Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.hospEmail}>📧 {h.email}</Text>
                  {h.owner_phone && <Text style={s.hospPhone}>📱 {h.owner_phone}</Text>}
                </View>
              ))
        )}

        {/* REQUESTS TAB */}
        {tab === 'requests' && (
          requests.length === 0
            ? <View style={s.emptyCard}><Text style={s.emptyText}>No active requests. ✅</Text></View>
            : requests.map((req, i) => (
                <View key={i} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.reqType}>
                      {req.type === 'BLOOD' ? '🩸' : '🫀'} {req.blood_group || req.organ_type} — {req.urgency}
                    </Text>
                    <View style={[s.badge,
                      req.status === 'PENDING'   && { backgroundColor: COLORS.warning + '22', borderColor: COLORS.warning + '55' },
                      req.status === 'FULFILLED' && { backgroundColor: COLORS.accent + '22',  borderColor: COLORS.accent + '55' },
                    ]}>
                      <Text style={[s.badgeText,
                        req.status === 'PENDING'   && { color: COLORS.warning },
                        req.status === 'FULFILLED' && { color: COLORS.accent },
                      ]}>{req.status}</Text>
                    </View>
                  </View>
                  <Text style={s.reqNote}>{req.notes || 'Emergency request'}</Text>
                  {req.status === 'PENDING' && (
                    <View style={s.actionRow}>
                      <TouchableOpacity style={s.fulfillBtn} onPress={() => updateRequestStatus(req.id, 'FULFILLED')}>
                        <Text style={s.fulfillBtnText}>✅ Fulfill</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.rejectBtn} onPress={() => updateRequestStatus(req.id, 'REJECTED')}>
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

function StatBox({ icon, val, label, color }) {
  return (
    <View style={[s.statBox, { borderColor: color + '44' }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[s.statVal, { color }]}>{val}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:    { padding: 16, paddingBottom: 40 },
  centered:  { flex: 1, backgroundColor: COLORS.bgMain, justifyContent: 'center', alignItems: 'center' },
  title:     { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginTop: 10, marginBottom: 16 },
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox:   { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal:   { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  tabRow:    { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 4, marginBottom: 14, gap: 4 },
  tab:       { flex: 1, padding: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  activeTab: { backgroundColor: COLORS.primary },
  tabText:   { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  activeTabText: { color: '#fff' },
  card:      { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  hospName:  { fontSize: 15, fontWeight: '700', color: COLORS.textMain, flex: 1 },
  hospEmail: { fontSize: 13, color: COLORS.textMuted, marginBottom: 2 },
  hospPhone: { fontSize: 13, color: COLORS.textMuted },
  badge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, borderWidth: 1, backgroundColor: COLORS.bgCard2 },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  reqType:   { fontSize: 15, fontWeight: '700', color: COLORS.textMain, flex: 1 },
  reqNote:   { fontSize: 13, color: COLORS.textMuted, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  fulfillBtn:{ flex: 1, backgroundColor: COLORS.accent + '22', borderRadius: RADIUS.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.accent + '55' },
  fulfillBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  rejectBtn: { flex: 1, backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.md, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '55' },
  rejectBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textMuted },
});
