import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import DonorScreen from './src/screens/DonorScreen';
import ReceiverScreen from './src/screens/ReceiverScreen';
import HospitalScreen from './src/screens/HospitalScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      
      <View style={styles.content}>
        {activeScreen === 'home' && <HomeScreen onNavigate={setActiveScreen} />}
        {activeScreen === 'donor' && <DonorScreen />}
        {activeScreen === 'receiver' && <ReceiverScreen />}
        {activeScreen === 'hospital' && <HospitalScreen />}
      </View>

      {/* Bottom Mobile Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveScreen('home')}>
          <Text style={[styles.tabIcon, activeScreen === 'home' && styles.activeTabIcon]}>🏠</Text>
          <Text style={[styles.tabLabel, activeScreen === 'home' && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveScreen('donor')}>
          <Text style={[styles.tabIcon, activeScreen === 'donor' && styles.activeTabIcon]}>🩸</Text>
          <Text style={[styles.tabLabel, activeScreen === 'donor' && styles.activeTabLabel]}>Donor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveScreen('receiver')}>
          <Text style={[styles.tabIcon, activeScreen === 'receiver' && styles.activeTabIcon]}>🤲</Text>
          <Text style={[styles.tabLabel, activeScreen === 'receiver' && styles.activeTabLabel]}>Receiver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveScreen('hospital')}>
          <Text style={[styles.tabIcon, activeScreen === 'hospital' && styles.activeTabIcon]}>🏥</Text>
          <Text style={[styles.tabLabel, activeScreen === 'hospital' && styles.activeTabLabel]}>Hospital</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#161C28',
    borderTopWidth: 1,
    borderTopColor: '#263147',
    paddingVertical: 10,
    justifyContent: 'space-around'
  },
  tabItem: { alignItems: 'center' },
  tabIcon: { fontSize: 18, opacity: 0.6 },
  tabLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  activeTabIcon: { opacity: 1 },
  activeTabLabel: { color: '#E53935', fontWeight: '700' }
});
