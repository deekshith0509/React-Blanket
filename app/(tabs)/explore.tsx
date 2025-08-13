import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

// Dual-color theme (match your app)
const COLORS = {
  PRIMARY: ['#667eea', '#764ba2'],
  SECONDARY: ['#f093fb', '#f5576c'],
  BACKGROUND: '#0f172a',
  SURFACE: '#1e293b',
  TEXT: '#fff',
  MUTED: 'rgba(255,255,255,0.7)',
  ACCENT: '#f43f5e',
};

export default function InfoScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  return (
    <LinearGradient colors={[COLORS.BACKGROUND, COLORS.BACKGROUND]} style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.header}>
    <LinearGradient
    colors={COLORS.PRIMARY}
    style={styles.profileIconBackground}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <FontAwesome name="user-circle" size={56} color={COLORS.TEXT} />
    </LinearGradient>
    <Text style={styles.title}>About the Developer</Text>
    </View>

    <Text style={styles.description}>
    Sound Blanket was created by Deekshith Bommarthi, a passionate Python developer and DevOps
    enthusiast specializing in automation and high-performance applications.
    </Text>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>🎓 Background</Text>
    <Text style={styles.paragraph}>
    Final-year B.Tech Computer Science student at GRIET with expertise in Python,
    Django, Docker, and modern software development practices.
    </Text>
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>🚀 Experience</Text>
    <View style={styles.highlights}>
    <Text style={styles.highlight}>• 17+ open-source projects</Text>
    <Text style={styles.highlight}>• 600+ GitHub contributions</Text>
    <Text style={styles.highlight}>• 400+ coding problems solved</Text>
    <Text style={styles.highlight}>• Top 10% on LeetCode</Text>
    <Text style={styles.highlight}>• Specialized in automation & DevOps</Text>
    </View>
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>💻 Notable Projects</Text>
    <View style={styles.highlights}>
    <Text style={styles.highlight}>• Advanced Python file-sharing server</Text>
    <Text style={styles.highlight}>• MetroNavigator web application</Text>
    <Text style={styles.highlight}>• Automated messaging systems</Text>
    <Text style={styles.highlight}>• Cross-platform mobile apps</Text>
    </View>
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>📱 About Sound Blanket</Text>
    <Text style={styles.paragraph}>
    Originally built as a Python/Kivy application, Sound Blanket has been completely
    reimagined and rebuilt for React Native to provide the best mobile experience.
    </Text>
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>🔗 Connect</Text>
    <View style={styles.contactContainer}>
    <TouchableOpacity
    style={styles.contactButton}
    onPress={() => openLink('https://github.com/deekshith0509')}
    >
    <LinearGradient
    colors={COLORS.PRIMARY}
    style={styles.contactButtonGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <FontAwesome name="github" size={20} color={COLORS.TEXT} />
    <Text style={styles.contactText}>GitHub</Text>
    </LinearGradient>
    </TouchableOpacity>

    <TouchableOpacity
    style={styles.contactButton}
    onPress={() => openLink('https://linkedin.com/in/deekshith-bommarthi')}
    >
    <LinearGradient
    colors={COLORS.PRIMARY}
    style={styles.contactButtonGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <FontAwesome name="linkedin" size={20} color={COLORS.TEXT} />
    <Text style={styles.contactText}>LinkedIn</Text>
    </LinearGradient>
    </TouchableOpacity>

    <TouchableOpacity
    style={styles.contactButton}
    onPress={() => openLink('mailto:deekshith.bh0509@gmail.com')}
    >
    <LinearGradient
    colors={COLORS.PRIMARY}
    style={styles.contactButtonGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <FontAwesome name="envelope" size={20} color={COLORS.TEXT} />
    <Text style={styles.contactText}>Email</Text>
    </LinearGradient>
    </TouchableOpacity>
    </View>
    </View>

    <View style={styles.section}>
    <Text style={styles.sectionTitle}>🛠️ App Info</Text>
    <View style={styles.appInfo}>
    <Text style={styles.appInfoText}>Version: 1.0.0</Text>
    <Text style={styles.appInfoText}>Built with: React Native + Expo</Text>
    <Text style={styles.appInfoText}>Audio: expo-av</Text>
    <Text style={styles.appInfoText}>Platform: Android</Text>
    </View>
    </View>

    <Text style={styles.footer}>Thank you for using Sound Blanket! 🎵</Text>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.MUTED,
  },
  highlights: {
    paddingLeft: 12,
  },
  highlight: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  contactButton: {
    minWidth: 120,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contactButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    color: COLORS.TEXT,
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 15,
  },
  appInfo: {
    backgroundColor: COLORS.SURFACE,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appInfoText: {
    fontSize: 14,
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  footer: {
    fontSize: 16,
    color: COLORS.TEXT,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 24,
  },
});
