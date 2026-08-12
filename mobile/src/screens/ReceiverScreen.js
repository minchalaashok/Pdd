// LifeLink Mobile — Receiver Screen (real blood/organ search + request form)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiSearchBlood, apiSearchOrgans, apiCreateRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGAN_TYPES  = ['ALL', 'Kidney', 'Liver', 'Heart', 'Lungs', 'Cornea', 'Pancreas'];
const CITIES       = ['ALL', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];
const URGENCY_OPTS = ['NORMAL', 'URGENT', 'CRITICAL'];

export default function ReceiverScreen() {
  const { user } = useAuth();
  const [tab, setTab]             = useState('blood'); // 'blood' | 'organ' | 'request'
  const [bloodGroup, setBloodGroup] = useState('ALL');
  const [organType, setOrganType] = useState('ALL');
  const [city, setCity]           = useState('ALL');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  // Request form
  const [reqType, setReqType]     = useState('BLOOD');
  const [reqBg, setReqBg]         = useState('O+');
  const [urgency, setUrgency]     = useState('URGENT');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const search = async () => {
    setLoading(true); setSearched(true);
    const res = tab === 'blood'
      ? await apiSearchBlood(bloodGroup, city)
      : await apiSearchOrgans(organType, city);
    if (res.success) setResults(tab === 'blood' ? res.inventory || [] : res.inventory || []);
    setLoading(false);
  };

  const submitRequest = async () => {
    setSubmitting(true);
    const res = await apiCreateRequest({
      type: reqType,
      blood_group: reqBg,
      urgency,
      notes: notes.trim() || `Emergency ${reqType.toLowerCase()} request from mobile app`,
    });
    setSubmitting(false);
    if (res.success) {
      Alert.alert('✅ Request Submitted!', 'Your request has been sent to matched donors and hospitals. You will be notified when a match is found.');
      setNotes('');
    } else {
      Alert.alert('Failed', res.message || 'Could not submit request. Please try again.');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>🤲 Receiver Portal</Text>

        {/* Tabs */}
        <View style={s.tabRow}>
          {[['blood', '🩸 Blood'], ['organ', '🫀 Organ'], ['request', '📋 Request']].map(([id, label]) => (
            <TouchableOpacity key={id} style={[s.tab, tab === id && s.activeTab]} onPress={() => { setTab(id); setResults([]); setSearched(false); }}>
              <Text style={[s.tabText, tab === id && s.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BLOOD SEARCH */}
        {tab === 'blood' && (
          <View>
            <Text style={s.label}>Blood Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {BLOOD_GROUPS.map(bg => (
                <TouchableOpacity key={bg} style={[s.chip, bloodGroup === bg && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                  onPress={() => setBloodGroup(bg)}>
                  <Text style={[s.chipText, bloodGroup === bg && { color: '#fff' }]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CITIES.map(c => (
                <TouchableOpacity key={c} style={[s.chip, city === c && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                  onPress={() => setCity(c)}>
                  <Text style={[s.chipText, city === c && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.searchBtn} onPress={search} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.searchBtnText}>🔍 Search Blood</Text>}
            </TouchableOpacity>

            {searched && results.length === 0 && !loading && (
              <View style={s.emptyCard}><Text style={s.emptyText}>No blood stock found. Try ALL categories or a different city.</Text></View>
            )}
            {results.map((item, i) => (
              <View key={i} style={s.resultCard}>
                <View style={s.resultHeader}>
                  <Text style={s.resultGroup}>{item.blood_group}</Text>
                  <Text style={[s.units, { color: COLORS.accent }]}>{item.units_available} Units</Text>
                </View>
                <Text style={s.hospName}>{item.hospital_name}</Text>
                <Text style={s.hospCity}>📍 {item.city}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ORGAN SEARCH */}
        {tab === 'organ' && (
          <View>
            <Text style={s.label}>Organ Type</Text>
            <View style={s.chipWrap}>
              {ORGAN_TYPES.map(o => (
                <TouchableOpacity key={o} style={[s.chip, organType === o && { backgroundColor: COLORS.accent, borderColor: COLORS.accent }]}
                  onPress={() => setOrganType(o)}>
                  <Text style={[s.chipText, organType === o && { color: '#fff' }]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>City</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {CITIES.map(c => (
                <TouchableOpacity key={c} style={[s.chip, city === c && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }]}
                  onPress={() => setCity(c)}>
                  <Text style={[s.chipText, city === c && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[s.searchBtn, { backgroundColor: COLORS.accent }]} onPress={search} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.searchBtnText}>🔍 Search Organs</Text>}
            </TouchableOpacity>

            {searched && results.length === 0 && !loading && (
              <View style={s.emptyCard}><Text style={s.emptyText}>No organs found in registry for your search.</Text></View>
            )}
            {results.map((item, i) => (
              <View key={i} style={s.resultCard}>
                <Text style={[s.resultGroup, { color: COLORS.accent }]}>{item.organ_type}</Text>
                <Text style={s.hospName}>{item.hospital_name}</Text>
                <Text style={s.hospCity}>📍 {item.city} • Waiting: {item.waiting_list_count || 0}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SUBMIT REQUEST */}
        {tab === 'request' && (
          <View>
            <Text style={s.label}>Request Type</Text>
            <View style={s.tabRow}>
              {[['BLOOD', '🩸 Blood'], ['ORGAN', '🫀 Organ']].map(([id, label]) => (
                <TouchableOpacity key={id} style={[s.tab, reqType === id && s.activeTab]} onPress={() => setReqType(id)}>
                  <Text style={[s.tabText, reqType === id && s.activeTabText]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {reqType === 'BLOOD' && (
              <>
                <Text style={s.label}>Blood Group Needed</Text>
                <View style={s.chipWrap}>
                  {BLOOD_GROUPS.filter(b => b !== 'ALL').map(bg => (
                    <TouchableOpacity key={bg} style={[s.chip, reqBg === bg && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                      onPress={() => setReqBg(bg)}>
                      <Text style={[s.chipText, reqBg === bg && { color: '#fff' }]}>{bg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={s.label}>Urgency Level</Text>
            <View style={s.tabRow}>
              {URGENCY_OPTS.map(u => (
                <TouchableOpacity key={u} style={[s.tab, urgency === u && s.activeTab]} onPress={() => setUrgency(u)}>
                  <Text style={[s.tabText, urgency === u && s.activeTabText]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Additional Notes</Text>
            <TextInput
              style={[s.textArea]}
              placeholder="Describe your condition, hospital name, any specific requirements..."
              placeholderTextColor={COLORS.textMuted}
              value={notes} onChangeText={setNotes}
              multiline numberOfLines={4} textAlignVertical="top"
            />

            <TouchableOpacity style={[s.searchBtn, submitting && { opacity: 0.7 }]} onPress={submitRequest} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.searchBtnText}>📋 Submit Request</Text>}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:     { padding: 16, paddingBottom: 40 },
  title:      { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginTop: 10, marginBottom: 16 },
  tabRow:     { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 4, marginBottom: 16, gap: 4 },
  tab:        { flex: 1, padding: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  activeTab:  { backgroundColor: COLORS.primary },
  tabText:    { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  activeTabText: { color: '#fff' },
  label:      { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard, marginRight: 8, marginBottom: 4 },
  chipWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chipText:   { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  searchBtn:  { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 15, alignItems: 'center', marginBottom: 16, ...SHADOW.primary },
  searchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resultCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  resultHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultGroup: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  units:      { fontSize: 14, fontWeight: '800' },
  hospName:   { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  hospCity:   { fontSize: 13, color: COLORS.textMuted },
  emptyCard:  { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  emptyText:  { color: COLORS.textMuted, textAlign: 'center' },
  textArea:   { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, color: COLORS.textMain, fontSize: 14, padding: 14, minHeight: 100, marginBottom: 16 },
});
