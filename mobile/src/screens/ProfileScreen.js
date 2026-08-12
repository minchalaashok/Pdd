// LifeLink Mobile — Profile Screen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const ROLE_CONFIG = {
  donor:    { icon: '🩸', color: COLORS.primary,   label: 'Blood & Organ Donor' },
  receiver: { icon: '🤲', color: COLORS.warning,   label: 'Patient / Receiver' },
  hospital: { icon: '🏥', color: COLORS.secondary, label: 'Hospital / Blood Bank' },
  admin:    { icon: '🛡️', color: COLORS.accent,    label: 'Platform Administrator' },
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const cfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.donor;

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of LifeLink?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={s.infoRow}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={[s.avatar, { borderColor: cfg.color }]}>
            <Text style={s.avatarText}>{cfg.icon}</Text>
          </View>
          <Text style={s.name}>{user?.full_name || 'LifeLink User'}</Text>
          <View style={[s.roleBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
            <Text style={[s.roleText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Account Details</Text>
          <InfoRow icon="📧" label="Email"     value={user?.email} />
          <InfoRow icon="🏙️" label="City"      value={user?.city} />
          <InfoRow icon="📱" label="Phone"     value={user?.phone} />
          {user?.role === 'donor' && (
            <InfoRow icon="🩸" label="Blood Group" value={user?.blood_group} />
          )}
        </View>

        {/* Quick Actions */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Quick Actions</Text>
          <TouchableOpacity style={s.actionRow}>
            <Text style={s.actionIcon}>🔔</Text>
            <Text style={s.actionLabel}>Notifications</Text>
            <Text style={s.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionRow}>
            <Text style={s.actionIcon}>🔒</Text>
            <Text style={s.actionLabel}>Change Password</Text>
            <Text style={s.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionRow}>
            <Text style={s.actionIcon}>📄</Text>
            <Text style={s.actionLabel}>Medical Documents</Text>
            <Text style={s.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionRow}>
            <Text style={s.actionIcon}>❓</Text>
            <Text style={s.actionLabel}>Help & Support</Text>
            <Text style={s.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={s.card}>
          <Text style={s.cardTitle}>About LifeLink</Text>
          <Text style={s.aboutText}>
            LifeLink is India's most advanced organ & blood donation coordination platform.
            Connecting donors, hospitals, and receivers in real-time to save lives.
          </Text>
          <Text style={s.versionText}>Version 1.0.0 • ABDM Compliant</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:       { padding: 20, paddingBottom: 40 },
  avatarSection:{ alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar:       { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.bgCard, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:   { fontSize: 38 },
  name:         { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 8 },
  roleBadge:    { borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  roleText:     { fontWeight: '700', fontSize: 13 },
  card:         { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  infoIcon:     { fontSize: 22, width: 28 },
  infoLabel:    { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  infoValue:    { fontSize: 15, color: COLORS.textMain, fontWeight: '700', marginTop: 1 },
  actionRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionIcon:   { fontSize: 20, width: 28 },
  actionLabel:  { flex: 1, fontSize: 15, color: COLORS.textMain, fontWeight: '600' },
  actionArrow:  { fontSize: 22, color: COLORS.textMuted },
  aboutText:    { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, marginBottom: 8 },
  versionText:  { fontSize: 12, color: COLORS.textMuted + '99', fontWeight: '600' },
  logoutBtn:    { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#E53935' + '44', marginTop: 4 },
  logoutText:   { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
});
