import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { fetchMobileApi } from '../services/api';

export default function HospitalScreen() {
  const [group, setGroup] = useState('O+');
  const [units, setUnits] = useState('30');

  const updateStock = async () => {
    const res = await fetchMobileApi('/hospital/stock', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: 1, blood_group: group, units_available: Number(units) })
    });

    if (res.success) {
      Alert.alert("Stock Updated", `Blood inventory updated for ${group} (${units} Units)`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏥 Hospital Stock & Organ Manager</Text>

      <View style={styles.card}>
        <Text style={styles.badge}>VERIFIED HOSPITAL LICENSE</Text>
        <Text style={styles.hospTitle}>Apex Multi-Specialty Care</Text>
        <Text style={styles.hospLic}>License: LIC-MED-2026-1001</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Update Blood Stock Inventory</Text>
        <TextInput style={styles.input} value={group} onChangeText={setGroup} placeholder="Blood Group (e.g. O+)" placeholderTextColor="#64748B" />
        <TextInput style={styles.input} value={units} onChangeText={setUnits} keyboardType="numeric" placeholder="Units Count" placeholderTextColor="#64748B" />
        
        <TouchableOpacity style={styles.button} onPress={updateStock}>
          <Text style={styles.buttonText}>UPDATE STOCK IN REAL DB</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 20, marginBottom: 16 },
  card: { backgroundColor: '#161C28', padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#263147' },
  badge: { color: '#43A047', fontWeight: '800', fontSize: 11, marginBottom: 4 },
  hospTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  hospLic: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10 },
  input: { backgroundColor: '#0B0F17', color: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#263147', marginBottom: 10 },
  button: { backgroundColor: '#1976D2', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }
});
