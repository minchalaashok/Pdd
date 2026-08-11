import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { fetchMobileApi } from '../services/api';

export default function HomeScreen({ onNavigate }) {
  const [bloodStats, setBloodStats] = useState([]);

  useEffect(() => {
    fetchMobileApi('/inventory/blood?city=Mumbai')
      .then(res => {
        if (res.success) setBloodStats(res.inventory || []);
      });
  }, []);

  const triggerSOS = () => {
    Alert.alert(
      "🚨 Emergency SOS Dispatched!",
      "Instant alert broadcasted to 42 donors and 8 nearby hospitals.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Life<Text style={{ color: '#E53935' }}>Link</Text></Text>
        <Text style={styles.brandSub}>Smart Organ & Blood Mobile App</Text>
      </View>

      {/* Emergency SOS Banner */}
      <TouchableOpacity style={styles.sosCard} onPress={triggerSOS}>
        <Text style={styles.sosTitle}>🚨 EMERGENCY SOS RADAR</Text>
        <Text style={styles.sosSub}>Tap for immediate 15km radial alert dispatch</Text>
        <View style={styles.sosButton}>
          <Text style={styles.sosBtnText}>BROADCAST SOS NOW</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Action Grid */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('receiver')}>
          <Text style={styles.cardIcon}>🩸</Text>
          <Text style={styles.cardTitle}>Find Blood</Text>
          <Text style={styles.cardSub}>Real-time stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => onNavigate('receiver')}>
          <Text style={styles.cardIcon}>🫀</Text>
          <Text style={styles.cardTitle}>Find Organ</Text>
          <Text style={styles.cardSub}>Match registry</Text>
        </TouchableOpacity>
      </View>

      {/* Nearby Hospitals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏥 Nearby Hospitals (Live Stock)</Text>
        {bloodStats.slice(0, 3).map((item, idx) => (
          <View key={idx} style={styles.hospItem}>
            <Text style={styles.hospName}>{item.hospital_name}</Text>
            <Text style={styles.hospDetails}>{item.city} • Group: {item.blood_group}</Text>
            <Text style={styles.hospStock}>{item.units_available} Units Available</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17', padding: 16 },
  header: { marginTop: 20, marginBottom: 16 },
  brandTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  brandSub: { fontSize: 13, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  sosCard: { backgroundColor: '#DC2626', padding: 20, borderRadius: 20, marginBottom: 20 },
  sosTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  sosSub: { fontSize: 12, color: '#FEE2E2', marginBottom: 14 },
  sosButton: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, alignItems: 'center' },
  sosBtnText: { color: '#DC2626', fontWeight: '800', fontSize: 14 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#161C28', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#263147' },
  cardIcon: { fontSize: 24, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cardSub: { fontSize: 12, color: '#94A3B8' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  hospItem: { backgroundColor: '#161C28', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#263147' },
  hospName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  hospDetails: { fontSize: 13, color: '#94A3B8', marginVertical: 4 },
  hospStock: { fontSize: 14, color: '#43A047', fontWeight: '700' }
});
