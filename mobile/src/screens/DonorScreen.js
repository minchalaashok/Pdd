// LifeLink Mobile — Donor Screen (Real data)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { fetchMobileApi } from '../services/api';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

export default function DonorScreen() {
  const { user } = useAuth();
  const [available, setAvailable]     = useState(true);
  const [donations, setDonations]     = useState([]);
  const [requests, setRequests]       = useState([]);
  const [refreshing, setRefreshing]   = useState(false);

  const loadData = async () => {
    const [donRes, reqRes] = await Promise.all([
      fetchMobileApi('/requests'),
      fetchMobileApi('/requests'),
    ]);
    if (donRes.success) setRequests(donRes.requests?.slice(0, 5) || []);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleAvailability = (val) => {
    setAvailable(val);
    Alert.alert(
      val ? '✅ You are Available' : '🔴 You are Unavailable',
      val ? 'You will receive emergency alerts from nearby hospitals.' : 'You will not receive emergency alerts.'
    );
  };

  const ORGANS = user?.organs_registered?.split(',').filter(Boolean) || ['Kidney', 'Liver'];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
      >
        <Text style={s.title}>🩸 Donor Portal</Text>

        {/* Availability Toggle */}
        <View style={[s.card, { borderColor: available ? COLORS.accent + '55' : COLORS.primary + '55' }]}>
          <View style={s.row}>
            <View>
              <Text style={s.cardLabel}>Donation Availability</Text>
              <Text style={[s.statusText, { color: available ? COLORS.accent : COLORS.primary }]}>
                {available ? '🟢 AVAILABLE FOR EMERGENCY' : '🔴 UNAVAILABLE'}
              </Text>
            </View>
            <Switch
              value={available}
              onValueChange={toggleAvailability}
              trackColor={{ true: COLORS.accent, false: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Blood Group */}
        <View style={s.card}>
          <Text style={s.cardLabel}>My Blood Group</Text>
          <Text style={s.bloodBadge}>{user?.blood_group || 'O+'}</Text>
          <Text style={s.cardSub}>Registered type for donation matching</Text>
        </View>

        {/* Organs */}
        {ORGANS.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardLabel}>Pledged Organs for Donation</Text>
            <View style={s.tagRow}>
              {ORGANS.map((o, i) => (
                <View key={i} style={s.tag}>
                  <Text style={s.tagText}>🫀 {o.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Donor Stats */}
        <View style={s.statsRow}>
          <StatBox icon="🩸" val="0" label="Donations" color={COLORS.primary} />
          <StatBox icon="🏆" val="Gold" label="Donor Rank" color={COLORS.warning} />
          <StatBox icon="❤️" val="0" label="Lives Saved" color={COLORS.accent} />
        </View>

        {/* Donor Badges */}
        <View style={s.card}>
          <Text style={s.cardLabel}>My Badges</Text>
          <View style={s.tagRow}>
            {['🏆 Registered Donor', '⚡ Quick Responder', '❤️ Hero of Life'].map((b, i) => (
              <View key={i} style={[s.tag, { backgroundColor: COLORS.warning + '22', borderColor: COLORS.warning + '44' }]}>
                <Text style={[s.tagText, { color: COLORS.warning }]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Requests Near Me */}
        <View>
          <Text style={s.sectionTitle}>🚨 Active Emergency Requests Near You</Text>
          {requests.length === 0
            ? <View style={s.emptyCard}><Text style={s.emptyText}>No active requests. All clear! ✅</Text></View>
            : requests.map((req, i) => (
                <View key={i} style={s.reqCard}>
                  <View style={s.row}>
                    <Text style={s.reqType}>{req.type === 'BLOOD' ? '🩸' : '🫀'} {req.blood_group || req.organ_type}</Text>
                    <View style={[s.urgBadge, req.urgency === 'CRITICAL' && { backgroundColor: COLORS.primary + '33' }]}>
                      <Text style={[s.urgText, req.urgency === 'CRITICAL' && { color: COLORS.primary }]}>{req.urgency}</Text>
                    </View>
                  </View>
                  <Text style={s.reqNotes}>{req.notes || 'Emergency blood request'}</Text>
                </View>
              ))
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, val, label, color }) {
  return (
    <View style={[s.statBox, { borderColor: color + '44' }]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={[s.statVal, { color }]}>{val}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:     { padding: 16, paddingBottom: 40 },
  title:      { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginTop: 10, marginBottom: 16 },
  card:       { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel:  { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  cardSub:    { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  statusText: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  bloodBadge: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  tagRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag:        { backgroundColor: COLORS.secondary + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.secondary + '44' },
  tagText:    { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  statsRow:   { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox:    { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal:    { fontSize: 20, fontWeight: '800' },
  statLabel:  { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: COLORS.textMain, marginBottom: 10 },
  emptyCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText:  { color: COLORS.textMuted },
  reqCard:    { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reqType:    { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
  reqNotes:   { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  urgBadge:   { backgroundColor: COLORS.bgCard2, paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  urgText:    { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
});
