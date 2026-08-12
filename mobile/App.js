// LifeLink Mobile — Root App with Navigation
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/theme/colors';

// Screens
import LoginScreen    from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen     from './src/screens/HomeScreen';
import DonorScreen    from './src/screens/DonorScreen';
import ReceiverScreen from './src/screens/ReceiverScreen';
import HospitalScreen from './src/screens/HospitalScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import AdminScreen    from './src/screens/AdminScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Bottom Tab Navigator (shown when logged in) ──────────
function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingVertical: 8,
          height: 64,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />, tabBarLabel: 'Home' }}
      />
      {(user?.role === 'donor') && (
        <Tab.Screen
          name="Donor"
          component={DonorScreen}
          options={{ tabBarIcon: ({ color }) => <TabIcon icon="🩸" color={color} />, tabBarLabel: 'Donor' }}
        />
      )}
      {(user?.role === 'receiver') && (
        <Tab.Screen
          name="Receiver"
          component={ReceiverScreen}
          options={{ tabBarIcon: ({ color }) => <TabIcon icon="🤲" color={color} />, tabBarLabel: 'Receiver' }}
        />
      )}
      {(user?.role === 'hospital') && (
        <Tab.Screen
          name="Hospital"
          component={HospitalScreen}
          options={{ tabBarIcon: ({ color }) => <TabIcon icon="🏥" color={color} />, tabBarLabel: 'Hospital' }}
        />
      )}
      {(user?.role === 'admin') && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />, tabBarLabel: 'Admin' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />, tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ opacity: color === COLORS.primary ? 1 : 0.6 }}>
        {/* Use Text for emoji icons - no native module required */}
        {React.createElement(require('react-native').Text, { style: { fontSize: 20 } }, icon)}
      </View>
    </View>
  );
}

// ─── Root Navigator ───────────────────────────────────────
function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bgMain, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

// ─── App Root ─────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgMain} />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
