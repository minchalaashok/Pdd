// LifeLink Mobile — Register Screen (3-step)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const ROLES = [
  { id: 'donor',    label: 'Give Blood / Organs (Donor) 🩸', icon: '❤️', desc: 'Choose this to donate blood or organs to save others.', color: COLORS.primary },
  { id: 'hospital', label: 'Hospital / Clinic Portal 🏥',icon: '🏢', desc: 'Choose this if you are representing a hospital or clinic.', color: COLORS.secondary },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [step, setStep]               = useState(1);
  const [role, setRole]               = useState('');
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [phone, setPhone]             = useState('');
  const [city, setCity]               = useState('Mumbai');
  const [bloodGroup, setBloodGroup]   = useState('O+');
  const [hospitalName, setHospName]   = useState('');
  const [loading, setLoading]         = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing Info', 'Please fill all required fields.'); return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    const res = await register({
      full_name: fullName, email, password, role, phone, city,
      blood_group: bloodGroup, hospital_name: hospitalName,
    });
    setLoading(false);
    if (!res.success) {
      Alert.alert('Registration Failed', res.message || 'Please try again.');
    }
  };

  const StepDot = ({ n }) => (
    <View style={[s.dot, step >= n && { backgroundColor: COLORS.primary }]}>
      <Text style={[s.dotText, step >= n && { color: '#fff' }]}>{step > n ? '✓' : n}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Navigation to Login */}
          <TouchableOpacity 
            style={{ 
              alignSelf: 'flex-start', 
              paddingVertical: 8, 
              paddingHorizontal: 4, 
              marginBottom: 10 
            }} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ fontSize: 16, color: COLORS.primary, fontWeight: '700' }}>← Sign In</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.logo}>Join <Text style={{ color: COLORS.primary }}>LifeLink</Text></Text>
          </View>

          {/* Step Dots */}
          <View style={s.stepRow}>
            <StepDot n={1} />
            <View style={s.stepLine} />
            <StepDot n={2} />
            <View style={s.stepLine} />
            <StepDot n={3} />
          </View>

          {/* STEP 1 — Role */}
          {step === 1 && (
            <View>
              <Text style={s.stepTitle}>Choose Your Role</Text>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[s.roleCard, role === r.id && { borderColor: r.color }]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.8}
                >
                  <Text style={s.roleIcon}>{r.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.roleLabel, role === r.id && { color: r.color }]}>{r.label}</Text>
                    <Text style={s.roleDesc}>{r.desc}</Text>
                  </View>
                  {role === r.id && <Text style={{ color: r.color, fontSize: 20 }}>✓</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.nextBtn, !role && { opacity: 0.4 }]}
                onPress={() => role ? setStep(2) : Alert.alert('Select Role', 'Please select a role.')}
              >
                <Text style={s.nextBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2 — Account */}
          {step === 2 && (
            <View>
              <Text style={s.stepTitle}>Create Account</Text>

              <Text style={s.label}>Full Name *</Text>
              <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={COLORS.textMuted}
                value={fullName} onChangeText={setFullName} />

              <Text style={s.label}>Email *</Text>
              <TextInput style={s.input} placeholder="email@example.com" placeholderTextColor={COLORS.textMuted}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <Text style={s.label}>Password *</Text>
              <TextInput style={s.input} placeholder="Min 8 characters" placeholderTextColor={COLORS.textMuted}
                value={password} onChangeText={setPassword} secureTextEntry />

              <Text style={s.label}>Phone Number</Text>
              <TextInput style={s.input} placeholder="+91 XXXXXXXXXX" placeholderTextColor={COLORS.textMuted}
                value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <View style={s.btnRow}>
                <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)}>
                  <Text style={s.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.nextBtn, { flex: 1 }]} onPress={() => setStep(3)}>
                  <Text style={s.nextBtnText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3 — Details */}
          {step === 3 && (
            <View>
              <Text style={s.stepTitle}>Complete Profile</Text>

              <Text style={s.label}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CITIES.map(c => (
                  <TouchableOpacity key={c} style={[s.chip, city === c && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                    onPress={() => setCity(c)}>
                    <Text style={[s.chipText, city === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {(role === 'donor' || role === 'receiver') && (
                <>
                  <Text style={s.label}>Blood Group</Text>
                  <View style={s.bloodGrid}>
                    {BLOOD_GROUPS.map(bg => (
                      <TouchableOpacity key={bg}
                        style={[s.bloodBtn, bloodGroup === bg && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                        onPress={() => setBloodGroup(bg)}>
                        <Text style={[s.bloodBtnText, bloodGroup === bg && { color: '#fff' }]}>{bg}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {role === 'hospital' && (
                <>
                  <Text style={s.label}>Hospital Name *</Text>
                  <TextInput style={s.input} placeholder="Full hospital name"
                    placeholderTextColor={COLORS.textMuted} value={hospitalName} onChangeText={setHospName} />
                </>
              )}

              <View style={s.btnRow}>
                <TouchableOpacity style={s.backBtn} onPress={() => setStep(2)}>
                  <Text style={s.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.nextBtn, { flex: 1 }, loading && { opacity: 0.7 }]}
                  onPress={handleRegister} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.nextBtnText}>Create Account ✓</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={s.loginLinkText}>Already have an account? <Text style={{ color: COLORS.primary }}>Sign In</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bgMain },
  scroll:    { padding: 24, paddingBottom: 40 },
  header:    { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  logo:      { fontSize: 30, fontWeight: '800', color: COLORS.textMain },
  stepRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  dot:       { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  dotText:   { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  stepLine:  { flex: 1, height: 2, backgroundColor: COLORS.border, maxWidth: 60 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain, marginBottom: 20 },
  roleCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, padding: 16, marginBottom: 12, gap: 12 },
  roleIcon:  { fontSize: 28 },
  roleLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  roleDesc:  { fontSize: 12, color: COLORS.textMuted },
  label:     { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:     { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, color: COLORS.textMain, fontSize: 15, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 14 },
  chip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard, marginRight: 8 },
  chipText:  { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  bloodBtn:  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bgCard },
  bloodBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  nextBtn:   { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 15, alignItems: 'center', marginTop: 8, ...SHADOW.primary },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnRow:    { flexDirection: 'row', gap: 12, marginTop: 8 },
  backBtn:   { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 20 },
  backBtnText: { color: COLORS.textMuted, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { color: COLORS.textMuted, fontSize: 14 },
});
