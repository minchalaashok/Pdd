import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';

export default function DonorScreen() {
  const [available, setAvailable] = useState(true);
  const [bloodGroup] = useState('O+');
  const [organs] = useState(['Kidney', 'Liver', 'Heart']);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🩸 Donor Mobile Portal</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardLabel}>Donation Availability</Text>
          <Switch value={available} onValueChange={setAvailable} trackColor={{ true: '#43A047', false: '#DC2626' }} />
        </View>
        <Text style={{ color: available ? '#43A047' : '#DC2626', fontWeight: '700', marginTop: 4 }}>
          {available ? '🟢 AVAILABLE FOR EMERGENCY CALLS' : '🔴 BUSY / UNAVAILABLE'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Registered Blood Group</Text>
        <Text style={styles.bloodBadge}>{bloodGroup}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Pledged Organs for Donation</Text>
        <View style={styles.tagContainer}>
          {organs.map((o, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>🫀 {o}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>My Donor Badges</Text>
        <Text style={styles.badgeText}>🏆 Gold Donor • 🏆 Hero of Life • 🏆 Emergency Responder</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 20, marginBottom: 16 },
  card: { backgroundColor: '#161C28', padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#263147' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  bloodBadge: { fontSize: 24, fontWeight: '800', color: '#E53935' },
  tagContainer: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { backgroundColor: 'rgba(25, 118, 210, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { color: '#1976D2', fontWeight: '700', fontSize: 13 },
  badgeText: { color: '#FB8C00', fontWeight: '700', fontSize: 13, marginTop: 4 }
});
