import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { fetchMobileApi } from '../services/api';

export default function ReceiverScreen() {
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [city, setCity] = useState('Mumbai');
  const [requests, setRequests] = useState([]);

  const submitRequest = async () => {
    const res = await fetchMobileApi('/requests', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: 1,
        request_type: 'BLOOD',
        item_requested: bloodGroup,
        units: 2,
        urgency: 'HIGH',
        notes: `Urgent requirement in ${city}`
      })
    });

    if (res.success) {
      Alert.alert("Request Submitted", "Your blood request has been posted to nearby hospitals.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🤲 Receiver Request Portal</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Blood Group Needed</Text>
        <TextInput
          style={styles.input}
          value={bloodGroup}
          onChangeText={setBloodGroup}
          placeholder="e.g. A+"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>City / Location</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Mumbai"
          placeholderTextColor="#64748B"
        />

        <TouchableOpacity style={styles.button} onPress={submitRequest}>
          <Text style={styles.buttonText}>SEND EMERGENCY REQUEST</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Request Tracker Timeline</Text>
        <Text style={{ color: '#43A047', fontWeight: '700', marginVertical: 4 }}>✅ Request #102: FULFILLED (Apex Hospital)</Text>
        <Text style={{ color: '#FB8C00', fontWeight: '700' }}>⌛ Request #108: PENDING (City Care)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 20, marginBottom: 16 },
  card: { backgroundColor: '#161C28', padding: 16, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#263147' },
  label: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  input: { backgroundColor: '#0B0F17', color: '#FFFFFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#263147', marginBottom: 14 },
  button: { backgroundColor: '#E53935', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }
});
