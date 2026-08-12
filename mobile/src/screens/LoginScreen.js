// LifeLink Mobile — Login Screen
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const ROLES = [
  { id: 'donor',    label: 'Donor',    icon: '🩸', color: COLORS.primary },
  { id: 'receiver', label: 'Receiver', icon: '🤲', color: COLORS.warning },
  { id: 'hospital', label: 'Hospital', icon: '🏥', color: COLORS.secondary },
  { id: 'admin',    label: 'Admin',    icon: '🛡️', color: COLORS.accent },
];

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [role, setRole]         = useState('donor');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password, role);
    setLoading(false);
    if (!res.success) {
      Alert.alert('Login Failed', res.message || 'Invalid email or password.');
    }
    // Navigation handled automatically by RootNavigator
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <Text style={s.logo}>❤️ <Text style={{ color: COLORS.primary }}>Life</Text>Link</Text>
            <Text style={s.tagline}>Smart Organ & Blood Donation</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>
          </View>

          {/* Role Selector */}
          <Text style={s.sectionLabel}>Select Your Role</Text>
          <View style={s.roleGrid}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[s.roleCard, role === r.id && { borderColor: r.color, backgroundColor: `${r.color}22` }]}
                onPress={() => setRole(r.id)}
                activeOpacity={0.8}
              >
                <Text style={s.roleIcon}>{r.icon}</Text>
                <Text style={[s.roleLabel, role === r.id && { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email */}
          <Text style={s.sectionLabel}>Email Address</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>📧</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={s.sectionLabel}>Password</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[s.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.loginBtnText}>Sign In →</Text>
            }
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity style={s.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={s.registerText}>
              Don't have an account? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Join LifeLink</Text>
            </Text>
          </TouchableOpacity>

          {/* Stats Strip */}
          <View style={s.statsStrip}>
            {[
              { icon: '❤️', label: 'Lives Saved' },
              { icon: '🩸', label: 'Donors' },
              { icon: '🏥', label: 'Hospitals' },
            ].map((s2, i) => (
              <View key={i} style={s.statItem}>
                <Text style={{ fontSize: 22 }}>{s2.icon}</Text>
                <Text style={s.statLabel}>{s2.label}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:     { padding: 24, paddingBottom: 40 },
  header:     { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  logo:       { fontSize: 36, fontWeight: '800', color: COLORS.textMain },
  tagline:    { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  subtitle:   { fontSize: 18, color: COLORS.textLight, fontWeight: '600', marginTop: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  roleGrid:   { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  roleCard:   { flex: 1, minWidth: '44%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, padding: 14, alignItems: 'center', gap: 6 },
  roleIcon:   { fontSize: 24 },
  roleLabel:  { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, marginBottom: 16 },
  inputIcon:  { fontSize: 18, marginRight: 10 },
  input:      { flex: 1, color: COLORS.textMain, fontSize: 15, paddingVertical: 14 },
  loginBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 16, ...SHADOW.primary },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  registerLink: { alignItems: 'center', marginBottom: 32 },
  registerText: { color: COLORS.textMuted, fontSize: 14 },
  statsStrip: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  statItem:   { alignItems: 'center', gap: 4 },
  statLabel:  { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
});
