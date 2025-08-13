import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <FontAwesome
    size={props.focused ? 24 : 22}
    style={{ marginBottom: -2, marginTop: 4 }}
    {...props}
    />
  );
}

export default function TabLayout() {
  const theme = useTheme();

  // Modern dual-tone dark palette
  const tabBarBackground = '#0F1627';    // Deep slate blue
  const activeTint = '#916CFA';          // Modern soft purple (avoiding harshness)
  const inkActiveTint = 'rgba(145,108,250,0.1)'; // Soft purple ink
  const inactiveTint = '#63717F';        // Cool gray-blue
  const headerBg = '#1D2333';            // Slightly elevated header (dark blue-gray)
  const headerTitleColor = '#E0EAD3';    // Off-white for clarity

  return (
    <Tabs
    // Tab bar options
    screenOptions={{
      // Tab styling
      tabBarActiveTintColor: activeTint,
      tabBarInactiveTintColor: inactiveTint,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: Platform.select({ android: 'Roboto', ios: 'SFProDisplay' }),
          marginTop: 4,
      },
      tabBarIconStyle: {
        marginBottom: 4,
      },
      // Modern, professional bar with subtle edge lighting
      tabBarStyle: {
        backgroundColor: tabBarBackground,
        borderTopWidth: 0,
        elevation: 16,
        shadowColor: '#0A0E17',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },

      tabBarItemStyle: {
        paddingVertical: 0,
        marginVertical : -14,
      },
      // Header: elevated, muted, readable
      headerStyle: {
        backgroundColor: headerBg,
        borderBottomWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: headerTitleColor,
        fontFamily: Platform.select({ android: 'Roboto', ios: 'SFProDisplay' }),
      },
      headerTintColor: activeTint,
    }}
    >
    <Tabs.Screen
    name="index"
    options={{
      title: 'Sounds',
      tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name="music" color={color} focused={focused} />
      ),
      headerTitle: 'Sound Blanket',
    }}
    />
    <Tabs.Screen
    name="mixes"
    options={{
      title: 'Mixes',
      tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name="list" color={color} focused={focused} />
      ),
      headerTitle: 'Saved Mixes',
    }}
    />
    <Tabs.Screen
    name="explore"
    options={{
      title: 'Info',
      tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name="info-circle" color={color} focused={focused} />
      ),
      headerTitle: 'Developer Info',
    }}
    />
    </Tabs>
  );
}
