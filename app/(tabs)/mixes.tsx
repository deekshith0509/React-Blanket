import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { MixData, getAllMixes, deleteMix } from '../../utils/MixStorage';
import { useMix } from '../../contexts/MixContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const COLORS = {
  PRIMARY: ['#6366f1', '#8b5cf6'],
  SECONDARY: ['#f97316', '#f59e0b'],
  TERTIARY: ['#3b82f6', '#60a5fa'],
  DARK: '#0f172a',
  LIGHT: '#f8fafc',
  ACCENT_COOL: '#2dd4bf',
  ACCENT_WARM: '#f43f5e',
  MUTED: 'rgba(248, 250, 252, 0.7)',
  DARK_MUTED: 'rgba(15, 23, 42, 0.7)',
};

const CARD_GRADIENTS = [
  COLORS.PRIMARY,
COLORS.SECONDARY,
COLORS.TERTIARY,
[COLORS.ACCENT_COOL, COLORS.ACCENT_WARM],
[COLORS.ACCENT_COOL, COLORS.PRIMARY[1]],
[COLORS.PRIMARY, COLORS.ACCENT_WARM],
].map(g => g.map(c => c + 'bb'));

const CARD_PADDING = 24;
const CARD_RADIUS = 20;
const CARD_ELEVATION = 12;

/**
 * Simple toast-style component. Optional, but helpful for UX.
 */
const Toast = ({ message, visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 4000); // 4 secs visible
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return visible ? (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
    <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  ) : null;
};

const MixItem = React.memo(({ mix, onLoad, onDelete }: MixItemProps) => {
  const [pressed, setPressed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const colors = CARD_GRADIENTS[Math.abs(mix.name.charCodeAt(0)) % CARD_GRADIENTS.length];
  const playingSounds = mix.sounds.filter(s => s.isPlaying);
  const playSoundNames = playingSounds.map(s => s.name).join(' • ');

  const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleLoad = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
                      Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(() => onLoad(mix));
  };

  const handleDelete = () => {
    setDeleting(true);
    onDelete(mix.name)
    .finally(() => {
      setDeleting(false);
    });
  };

  return (
    <TouchableOpacity
    onPressIn={() => setPressed(true)}
    onPressOut={() => setPressed(false)}
    onPress={handleLoad}
    activeOpacity={1}
    >
    <Animated.View
    style={[
      styles.mixCard,
      {
        transform: [
          { scale: scaleAnim },
          { translateY: pressed ? 2 : 0 },
        ],
        opacity: deleting ? 0.7 : 1,
      },
    ]}
    >
    <LinearGradient
    colors={colors}
    style={styles.cardGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    >
    <View style={styles.cardDarkener}>
    <View style={styles.cardInner}>
    <View style={styles.cardHeader}>
    <View style={styles.cardIcon}>
    <FontAwesome name="music" size={22} color="white" />
    </View>
    <View style={styles.cardDate}>
    <Text style={styles.dateText}>{formatDate(mix.createdAt)}</Text>
    </View>
    <TouchableOpacity
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    style={styles.deleteButton}
    onPress={handleDelete}
    disabled={deleting}
    >
    <FontAwesome
    name={deleting ? "circle-o-notch" : "trash-o"}
    size={18}
    color="white"
    />
    </TouchableOpacity>
    </View>
    <Text style={styles.mixName}>{mix.name}</Text>
    <Text style={styles.mixDetails}>
    {playingSounds.length} sounds playing
    </Text>
    {playSoundNames && (
      <Text style={styles.mixSounds} numberOfLines={1}>
      🎵 {playSoundNames}
      </Text>
    )}
    <View style={styles.playPrompt}>
    <FontAwesome name="play-circle" size={28} color="#f8fafc" />
    <Text style={styles.tapToPlay}>Tap->Go to Sounds</Text>
    </View>
    </View>
    </View>
    </LinearGradient>
    </Animated.View>
    </TouchableOpacity>
  );
});

interface MixItemProps {
  mix: MixData;
  onLoad: (mix: MixData) => void;
  onDelete: (mixName: string) => Promise<any>;
}

const LoadingPlaceholder = () => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.loadingContainer}>
    <Animated.View style={[styles.loadingIcon, { opacity: pulseAnim }]}>
    <ActivityIndicator color="white" size={44} />
    </Animated.View>
    <Text style={styles.loadingText}>Loading your mixes...</Text>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
  <FontAwesome name="music" size={72} color={COLORS.MUTED} style={styles.emptyIcon} />
  <Text style={styles.emptyTitle}>No mixes found</Text>
  <Text style={styles.emptySubtitle}>
  Create and save your favorite mixes from the Sounds tab.
  </Text>
  </View>
);

export default function MixesScreen() {
  const [mixes, setMixes] = useState<MixData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { setActiveMix } = useMix();
  const flatListRef = useRef<FlatList>(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setToastVisible(true);
    const timer = setTimeout(() => setToastVisible(false), 3000); // 3s visible
    return () => clearTimeout(timer); // Clean up timer on unmount
  }, []);

  const loadMixes = useCallback(async () => {
    try {
      const savedMixes = await getAllMixes();
      setMixes(savedMixes);
    } catch (error) {
      showToast('Failed to load mixes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetch() {
        setLoading(true);
        await loadMixes();
        if (isActive) setLoading(false);
      }
      fetch();
      return () => { isActive = false; };
    }, [loadMixes])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMixes();
    setRefreshing(false);
  }, [loadMixes]);

  const handleLoadMix = useCallback((mix) => {
    setActiveMix(mix);
    showToast(`“${mix.name}” now playing in Sounds Tab.`);
  }, [setActiveMix]);

  const handleDeleteMix = useCallback((mixName) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Delete Mix',
        `Are you sure you want to delete “${mixName}”?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await deleteMix(mixName);
                        setMixes(prev => prev.filter(m => m.name !== mixName));
                        showToast(`“${mixName}” deleted.`);
                        resolve();
                      } catch (error) {
                        showToast('Failed to delete mix. Please try again.');
                        resolve(); // Still resolve, but show error
                      }
                    },
                  },
        ],
        { cancelable: true, onDismiss: () => resolve() }
      );
    });
  }, []);

  return (
    <LinearGradient
    colors={[COLORS.DARK, COLORS.DARK]}
    style={styles.pageBackground}
    >
    {loading ? (
      <LoadingPlaceholder />
    ) : (
      <FlatList
      ref={flatListRef}
      data={mixes}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <MixItem
        mix={item}
        onLoad={handleLoadMix}
        onDelete={handleDeleteMix}
        />
      )}
      contentContainerStyle={[
        mixes.length ? styles.list : styles.emptyContainer,
      ]}
      ListEmptyComponent={<EmptyState />}
      ListFooterComponent={() => <View style={{ height: 72 }} />}
      refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={[COLORS.ACCENT_COOL, COLORS.PRIMARY[0]]}
        tintColor={COLORS.PRIMARY}
        progressBackgroundColor="transparent"
        />
      }
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={11}
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      style={{ flex: 1 }}
      />
    )}
    <Toast message={toastMessage} visible={toastVisible} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageBackground: {
    flexGrow:1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingText: {
    color: COLORS.LIGHT,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 32,
  },
  emptyTitle: {
    color: COLORS.LIGHT,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.MUTED,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                 borderRadius: 12,
                                 padding: 16,
                                 justifyContent: 'center',
                                 alignItems: 'center',
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  mixCard: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: CARD_RADIUS,
    elevation: CARD_ELEVATION,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  cardDarkener: {
    backgroundColor: 'rgba(0,0,0,0.1)',
                                 borderRadius: CARD_RADIUS,
                                 overflow: 'hidden',
  },
  cardInner: {
    padding: CARD_PADDING,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 shadowColor: '#000',
                                 shadowOffset: { width: 0, height: 2 },
                                 shadowOpacity: 0.15,
                                 shadowRadius: 4,
                                 elevation: 2,
  },
  cardDate: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                 borderRadius: 12,
                                 paddingHorizontal: 12,
                                 paddingVertical: 4,
  },
  dateText: {
    color: COLORS.MUTED,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
  },
  mixName: {
    color: COLORS.LIGHT,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  mixDetails: {
    color: COLORS.MUTED,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  mixSounds: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 18,
    opacity: 0.9,
  },
  playPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tapToPlay: {
    color: COLORS.MUTED,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});
