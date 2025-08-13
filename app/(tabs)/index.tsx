import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { VolumeManager } from 'react-native-volume-manager';
import { saveMix as saveMixToStorage } from '../../utils/MixStorage';
import { useMix } from '../../contexts/MixContext';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 36) / 2;

// Dual-color theme
const COLORS = {
  PRIMARY: ['#667eea', '#764ba2'], // Purple gradient
  SECONDARY: ['#10b981', '#0ea5e9'], // Teal-blue gradient
  BACKGROUND: '#0f172a', // Dark slate background
  SURFACE: '#1e293b', // Card/button backgrounds
  TEXT: '#fff',
  MUTED: 'rgba(255,255,255,0.7)',
  ACCENT: '#f43f5e',
};

// Types
interface SoundFile {
  id: string;
  name: string;
  category: string;
  icon: string;
  iconFamily: 'FontAwesome' | 'FontAwesome5';
  color: string[];
  source: any;
}

interface SoundState {
  isPlaying: boolean;
  volume: number;
  sound: Audio.Sound | null;
  loading: boolean;
}

// Categories
const SOUND_CATEGORIES = {
  NATURE: 'Nature',
  URBAN: 'Urban',
  AMBIENT: 'Ambient',
  WHITE_NOISE: 'White Noise',
} as const;


const SOUND_FILES: SoundFile[] = [
  // Nature (calm, cool gradients)
  {
    id: 'birds',
    name: 'Birds Chirping',
    category: SOUND_CATEGORIES.NATURE,
    icon: 'twitter',
    iconFamily: 'FontAwesome',
    color: ['#5dc8de', '#7ee8fa'], // Morning mist blue → Light aqua
    source: require('../../assets/sounds/birds.mp3'),
  },
{
  id: 'rain',
  name: 'Gentle Rain',
  category: SOUND_CATEGORIES.NATURE,
  icon: 'cloud-rain',
  iconFamily: 'FontAwesome5',
  color: ['#4294c3', '#c7e0f4'], // Rain cloud blue → Soft sky
  source: require('../../assets/sounds/rain.mp3'),
},
{
  id: 'waves',
  name: 'Ocean Waves',
  category: SOUND_CATEGORIES.NATURE,
  icon: 'water',
  iconFamily: 'FontAwesome5',
  color: ['#1cb9e6', '#d1f2ff'], // Ocean blue → Wave foam
  source: require('../../assets/sounds/waves.mp3'),
},
{
  id: 'stream',
  name: 'Babbling Stream',
  category: SOUND_CATEGORIES.NATURE,
  icon: 'tint',
  iconFamily: 'FontAwesome',
  color: ['#38b2ac', '#e6fffa'], // Stream green → Crystal water
  source: require('../../assets/sounds/stream.mp3'),
},
{
  id: 'wind',
  name: 'Forest Wind',
  category: SOUND_CATEGORIES.NATURE,
  icon: 'leaf',
  iconFamily: 'FontAwesome',
  color: ['#4bc076', '#e3f7ec'], // Forest green → Wind-touched leaf
  source: require('../../assets/sounds/wind.mp3'),
},
{
  id: 'summer-night',
  name: 'Summer Night',
  category: SOUND_CATEGORIES.NATURE,
  icon: 'moon',
  iconFamily: 'FontAwesome5',
  color: ['#3c70c7', '#8e9eed'], // Midnight blue → Moonlit haze
  source: require('../../assets/sounds/summer-night.mp3'),
},

// Urban (energetic, contrasting)
{
  id: 'city',
  name: 'City Ambience',
  category: SOUND_CATEGORIES.URBAN,
  icon: 'building',
  iconFamily: 'FontAwesome',
  color: ['#505d7e', '#a4b0c6'], // City dusk → Neon reflection
  source: require('../../assets/sounds/city.mp3'),
},
{
  id: 'coffee-shop',
  name: 'Coffee Shop',
  category: SOUND_CATEGORIES.URBAN,
  icon: 'coffee',
  iconFamily: 'FontAwesome',
  color: ['#ad8b73', '#f5e6ca'], // Roast brown → Latte foam
  source: require('../../assets/sounds/coffee-shop.mp3'),
},
{
  id: 'train',
  name: 'Train Journey',
  category: SOUND_CATEGORIES.URBAN,
  icon: 'train',
  iconFamily: 'FontAwesome',
  color: ['#4e6582', '#b5c8d9'], // Steel gray → Glossy metal
  source: require('../../assets/sounds/train.mp3'),
},
{
  id: 'boat',
  name: 'Boat Engine',
  category: SOUND_CATEGORIES.URBAN,
  icon: 'ship',
  iconFamily: 'FontAwesome',
  color: ['#36454f', '#b0c4de'], // Deep harbor → Ship deck
  source: require('../../assets/sounds/boat.mp3'),
},

// Ambient (warm, dramatic)
{
  id: 'fireplace',
  name: 'Crackling Fire',
  category: SOUND_CATEGORIES.AMBIENT,
  icon: 'fire',
  iconFamily: 'FontAwesome',
  color: ['#f39c12', '#f1c40f'], // Fire orange → Ember yellow
  source: require('../../assets/sounds/fireplace.mp3'),
},
{
  id: 'storm',
  name: 'Thunder Storm',
  category: SOUND_CATEGORIES.AMBIENT,
  icon: 'bolt',
  iconFamily: 'FontAwesome',
  color: ['#2c3e50', '#95a5a6'], // Storm cloud → Lightning flash
  source: require('../../assets/sounds/storm.mp3'),
},

// White noise (cool, neutral)
{
  id: 'white-noise',
  name: 'White Noise',
  category: SOUND_CATEGORIES.WHITE_NOISE,
  icon: 'volume-up',
  iconFamily: 'FontAwesome',
  color: ['#8e9eab', '#eef2f3'], // Misty gray → Pure white
  source: require('../../assets/sounds/white-noise.mp3'),
},
{
  id: 'pink-noise',
  name: 'Pink Noise',
  category: SOUND_CATEGORIES.WHITE_NOISE,
  icon: 'volume-up',
  iconFamily: 'FontAwesome',
  color: ['#d0c7e8', '#f4f1fa'], // Lavender mist → Soft pink
  source: require('../../assets/sounds/pink-noise.mp3'),
},
];

// Clamp volume helper
const clampVolume = (value: number) => Math.max(0, Math.min(1, value));

// System Volume Control
const SystemVolumeControl = () => {
  const [systemVolume, setSystemVolume] = useState(0.5);
  const volumeListenerRef = useRef<any>();
  const isManualControlRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const fetchVolume = async () => {
      try {
        const current = await VolumeManager.getVolume();
        if (mounted) setSystemVolume(clampVolume(current));
      } catch (error) {
        console.error('Error fetching initial volume:', error);
        if (mounted) setSystemVolume(0.5);
      }
    };

    fetchVolume();

    volumeListenerRef.current = VolumeManager.addVolumeListener(volumeEvent => {
      if (mounted && !isManualControlRef.current && volumeEvent?.volume !== undefined) {
        setSystemVolume(clampVolume(volumeEvent.volume));
      }
    });

    return () => {
      mounted = false;
      if (volumeListenerRef.current?.remove) volumeListenerRef.current.remove();
    };
  }, []);

  const handleVolumeChange = useCallback(async (volume: number) => {
    const safeVolume = clampVolume(volume);
    isManualControlRef.current = true;
    setSystemVolume(safeVolume);

    try {
      await VolumeManager.setVolume(safeVolume, {
        type: 'music',
        showUI: false,
        playSound: false,
      });
      if (Haptics?.selectionAsync) Haptics.selectionAsync();
    } catch (error) {
      console.error('Error setting system volume:', error);
    }

    setTimeout(() => {
      isManualControlRef.current = false;
    }, 800);
  }, []);

  return (
    <View style={styles.systemVolumeContainer}>
    <View style={styles.systemVolumeHeader}>
    <Text style={styles.systemVolumeText}>System Volume</Text>
    <Text style={styles.systemVolumeValue}>
    {Math.round(systemVolume * 100)}%
    </Text>
    </View>
    <LinearGradient
    colors={COLORS.SECONDARY}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.systemVolumeGradient}
    >
    <Slider
    style={styles.systemVolumeSlider}
    minimumValue={0}
    maximumValue={1}
    value={systemVolume}
    onValueChange={handleVolumeChange}
    minimumTrackTintColor="transparent"
    maximumTrackTintColor="transparent"
    thumbTintColor={COLORS.TEXT}
    thumbStyle={styles.systemVolumeThumb}
    step={0.01}
    />
    </LinearGradient>
    </View>
  );
};

// Sound Tile
const SoundTile = React.memo(({
  soundFile,
  soundState,
  onTogglePlay,
  onVolumeChange,
}: {
  soundFile: SoundFile;
  soundState: SoundState;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
}) => {
  const Icon = soundFile.iconFamily === 'FontAwesome5' ? FontAwesome5 : FontAwesome;
  const volumeTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounce volume changes
  const handleVolumeChange = useCallback(
    (volume: number) => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = setTimeout(() => {
        onVolumeChange(volume);
      }, 50);
    },
    [onVolumeChange]
  );

  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    };
  }, []);

  return (
    <TouchableOpacity
    style={styles.tileContainer}
    activeOpacity={0.8}
    onPress={onTogglePlay}
    >
    <LinearGradient
    colors={soundFile.color}
    style={styles.tileGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <View style={styles.tileHeader}>
    <View style={styles.iconContainer}>
    <Icon name={soundFile.icon} size={22} color={COLORS.TEXT} />
    </View>
    <View style={styles.categoryBadge}>
    <Text style={styles.categoryText}>{soundFile.category}</Text>
    </View>
    </View>

    <Text style={styles.tileTitle} numberOfLines={2}>
    {soundFile.name}
    </Text>

    <LinearGradient
    colors={soundFile.color}
    style={styles.volumeGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    >
    <Text style={styles.volumeLabel}>
    {Math.round(soundState.volume * 100)}%
    </Text>
    <Slider
    style={styles.volumeSlider}
    value={soundState.volume}
    onValueChange={handleVolumeChange}
    minimumValue={0}
    maximumValue={1}
    minimumTrackTintColor="transparent"
    maximumTrackTintColor="transparent"
    thumbTintColor={COLORS.TEXT}
    thumbStyle={{ width: 16, height: 16 }}
    step={0.01}
    />
    </LinearGradient>

    <TouchableOpacity
    style={[
      styles.playButton,
      soundState.isPlaying && styles.playButtonActive,
    ]}
    onPress={onTogglePlay}
    disabled={soundState.loading}
    >
    <MaterialIcons
    name={soundState.isPlaying ? 'pause' : 'play-arrow'}
    size={24}
    color={COLORS.TEXT}
    />
    </TouchableOpacity>

    {soundState.isPlaying && (
      <View style={styles.playingIndicator}>
      <View style={styles.playingDot} />
      </View>
    )}
    </LinearGradient>
    </TouchableOpacity>
  );
});

// Main Screen
export default function SoundsScreen() {
  // State hooks
  const [soundStates, setSoundStates] = useState<Record<string, SoundState>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mixName, setMixName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
  'ALL' | keyof typeof SOUND_CATEGORIES
  >('ALL');
  const [isLoadingMix, setIsLoadingMix] = useState(false);

  // Context and refs
  const { activeMix, setActiveMix } = useMix();
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const volumeTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize sound states
  useEffect(() => {
    const initialStates: Record<string, SoundState> = {};
    SOUND_FILES.forEach(file => {
      initialStates[file.id] = {
        isPlaying: false,
        volume: 0.7,
        sound: null,
        loading: false,
      };
    });
    setSoundStates(initialStates);

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
      } catch (error) {
        console.error('Audio setup failed:', error);
      }
    };
    setupAudio();

    return () => {
      Object.values(soundsRef.current).forEach(sound => {
        sound?.stopAsync().catch(() => {});
        sound?.unloadAsync().catch(() => {});
      });
      Object.values(volumeTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  // Back handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSaveModal) {
        setShowSaveModal(false);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [showSaveModal]);

  // Focus effect for mix loading
  useFocusEffect(
    useCallback(() => {
      if (activeMix && !isLoadingMix) {
        loadMix(activeMix);
        setActiveMix(null);
      }
    }, [activeMix, isLoadingMix, setActiveMix])
  );

  // Memoized filtered sounds and playing count
  const filteredSounds = useMemo(
    () =>
    selectedCategory === 'ALL'
    ? SOUND_FILES
    : SOUND_FILES.filter(sound => sound.category === selectedCategory),
                                 [selectedCategory]
  );

  const playingCount = useMemo(
    () => Object.values(soundStates).filter(state => state.isPlaying).length,
                               [soundStates]
  );

  // Create sound instance
  const createSound = useCallback(
    async (soundFile: SoundFile) => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          soundFile.source,
          {
            shouldPlay: false,
            isLooping: true,
            volume: clampVolume(soundStates[soundFile.id]?.volume || 0.7),
          }
        );
        soundsRef.current[soundFile.id] = sound;
        return sound;
      } catch (error) {
        console.error(`Error creating sound ${soundFile.name}:`, error);
        return null;
      }
    },
    [soundStates]
  );

  // Toggle play/stop
  const toggleSound = useCallback(
    async (soundFile: SoundFile) => {
      const currentState = soundStates[soundFile.id];
      if (!currentState || currentState.loading) return;

      setSoundStates(prev => ({
        ...prev,
        [soundFile.id]: { ...prev[soundFile.id], loading: true },
      }));

      try {
        let sound = soundsRef.current[soundFile.id];

        if (currentState.isPlaying) {
          if (sound) await sound.pauseAsync();
          setSoundStates(prev => ({
            ...prev,
            [soundFile.id]: { ...prev[soundFile.id], isPlaying: false, loading: false },
          }));
        } else {
          if (!sound) sound = await createSound(soundFile);
          if (!sound) {
            setSoundStates(prev => ({
              ...prev,
              [soundFile.id]: { ...prev[soundFile.id], loading: false },
            }));
            return;
          }
          await sound.setVolumeAsync(clampVolume(currentState.volume));
          await sound.playAsync();
          setSoundStates(prev => ({
            ...prev,
            [soundFile.id]: { ...prev[soundFile.id], isPlaying: true, loading: false },
          }));
        }
        if (Haptics?.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error(`Error toggling ${soundFile.name}:`, error);
        setSoundStates(prev => ({
          ...prev,
          [soundFile.id]: { ...prev[soundFile.id], loading: false },
        }));
      }
    },
    [soundStates, createSound]
  );

  // Change volume (debounced)
  const changeVolume = useCallback(
    async (soundFile: SoundFile, volume: number) => {
      const safeVolume = clampVolume(volume);
      const sound = soundsRef.current[soundFile.id];

      setSoundStates(prev => ({
        ...prev,
        [soundFile.id]: { ...prev[soundFile.id], volume: safeVolume },
      }));

      if (volumeTimeoutsRef.current[soundFile.id]) {
        clearTimeout(volumeTimeoutsRef.current[soundFile.id]);
      }
      volumeTimeoutsRef.current[soundFile.id] = setTimeout(async () => {
        if (sound) await sound.setVolumeAsync(safeVolume);
      }, 100);
    },
    []
  );

  // Stop all sounds
  const stopAllSounds = useCallback(async () => {
    const promises = Object.entries(soundsRef.current).map(
      async ([id, sound]) => {
        if (sound && soundStates[id]?.isPlaying) {
          try {
            await sound.pauseAsync();
          } catch (error) {
            console.error(`Error stopping ${id}:`, error);
          }
        }
      }
    );
    await Promise.all(promises);

    setSoundStates(prev => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach(id => {
        newStates[id].isPlaying = false;
      });
      return newStates;
    });
    if (Haptics?.impactAsync) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [soundStates]);

    // Load mix
    const loadMix = useCallback(
      async (mix: any) => {
        setIsLoadingMix(true);
        try {
          await stopAllSounds();
          await new Promise(resolve => setTimeout(resolve, 300));

          const promises = mix.sounds.map(async (mixSound: any) => {
            const soundFile = SOUND_FILES.find(sf => sf.id === mixSound.id);
            if (soundFile && mixSound.isPlaying) {
              const safeVolume = clampVolume(mixSound.volume);

              setSoundStates(prev => ({
                ...prev,
                [soundFile.id]: {
                  ...prev[soundFile.id],
                  volume: safeVolume,
                  isPlaying: true,
                  loading: true,
                },
              }));

              let sound = soundsRef.current[soundFile.id];
              if (!sound) sound = await createSound(soundFile);
              if (!sound) {
                setSoundStates(prev => ({
                  ...prev,
                  [soundFile.id]: { ...prev[soundFile.id], loading: false },
                }));
                return;
              }

              await sound.setVolumeAsync(safeVolume);
              await sound.playAsync();
              setSoundStates(prev => ({
                ...prev,
                [soundFile.id]: { ...prev[soundFile.id], loading: false },
              }));
            }
          });

          await Promise.all(promises);
          if (Haptics?.notificationAsync) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert(
            'Mix Loaded!',
            `"${mix.name}" is now playing.`,
            [{ text: 'Great!', style: 'default' }]
          );
        } catch (error) {
          console.error('Error loading mix:', error);
          if (Haptics?.notificationAsync) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          Alert.alert('Error', 'Failed to load mix. Please try again.');
        } finally {
          setIsLoadingMix(false);
        }
      },
      [stopAllSounds, createSound]
    );

    // Save mix
    const saveMix = useCallback(() => {
      if (playingCount === 0) {
        if (Haptics?.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        Alert.alert('No Sounds', 'Play at least one sound before saving.');
        return;
      }
      setShowSaveModal(true);
      if (Haptics?.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, [playingCount]);

    const handleSaveMix = useCallback(async () => {
      if (!mixName.trim()) {
        if (Haptics?.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        Alert.alert('Name Required', 'Please enter a mix name.');
        return;
      }

      try {
        const mixData = SOUND_FILES.map(file => ({
          id: file.id,
          name: file.name,
          isPlaying: soundStates[file.id]?.isPlaying || false,
          volume: clampVolume(soundStates[file.id]?.volume || 0.7),
        }));

        const success = await saveMixToStorage(mixName.trim(), mixData);
        if (success) {
          if (Haptics?.notificationAsync) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert('Saved!', `${mixName} with ${playingCount} sounds`);
          setMixName('');
          setShowSaveModal(false);
        } else {
          throw new Error('Save failed');
        }
      } catch (error) {
        console.error('Error saving mix:', error);
        if (Haptics?.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Error', 'Failed to save mix. Please try again.');
      }
    }, [mixName, playingCount, soundStates]);

    // Render helpers
    const renderSoundTile = useCallback(
      ({ item }: { item: SoundFile }) => (
        <SoundTile
        soundFile={item}
        soundState={
          soundStates[item.id] || {
            isPlaying: false,
            volume: 0.7,
            sound: null,
            loading: false,
          }
        }
        onTogglePlay={() => toggleSound(item)}
        onVolumeChange={volume => changeVolume(item, volume)}
        />
      ),
      [soundStates, toggleSound, changeVolume]
    );

    const renderCategoryFilter = useCallback(() => (
      <View style={styles.categoryContainer}>
      <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={['ALL', ...Object.values(SOUND_CATEGORIES)]}
      keyExtractor={item => item}
      contentContainerStyle={styles.categoryList}
      renderItem={({ item }) => (
        <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === item && styles.categoryButtonActive,
        ]}
        onPress={() => {
          setSelectedCategory(item);
          if (Haptics?.selectionAsync) Haptics.selectionAsync();
        }}
        >
        <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}
        >
        {item}
        </Text>
        </TouchableOpacity>
      )}
      />
      </View>
    ), [selectedCategory]);

    return (
      <LinearGradient
      colors={[COLORS.BACKGROUND, COLORS.BACKGROUND]}
      style={styles.container}
      >
      {Platform.OS === 'ios' && <View style={styles.statusBar} />}

      <View style={styles.content}>
      {/* System Volume Control */}
      <SystemVolumeControl />

      {/* Header */}
      <View style={styles.header}>
      <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
      <TouchableOpacity
      style={[styles.actionButton, styles.stopButton]}
      onPress={stopAllSounds}
      >
      <MaterialIcons name="stop" size={18} color={COLORS.TEXT} />
      <Text style={styles.actionButtonText}>Stop All</Text>
      </TouchableOpacity>
      <TouchableOpacity
      style={[styles.actionButton, styles.saveButton]}
      onPress={saveMix}
      >
      <MaterialIcons name="save" size={18} color={COLORS.TEXT} />
      <Text style={styles.actionButtonText}>Save Mix</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.statItem}>
      <MaterialIcons name="music-note" size={18} color={COLORS.MUTED} />
      <Text style={styles.statText}>{playingCount} playing</Text>
      </View>
      </View>
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Loading Overlay */}
      {isLoadingMix && (
        <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
        <MaterialIcons name="refresh" size={40} color={COLORS.PRIMARY[0]} />
        <Text style={styles.loadingText}>Loading</Text>
        </View>
        </View>
      )}

      {/* Sound Grid */}
      <FlatList
      data={filteredSounds}
      renderItem={renderSoundTile}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.gridRow}
      removeClippedSubviews
      maxToRenderPerBatch={6}
      windowSize={10}
      />
      </View>

      {/* Save Modal */}
      <Modal
      visible={showSaveModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowSaveModal(false)}
      >
      <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Save Your Mix</Text>
      </View>
      <Text style={styles.modalSubtitle}>
      {playingCount} sounds will be saved.
      </Text>
      <TextInput
      style={styles.textInput}
      placeholder="Name your mix"
      placeholderTextColor={COLORS.MUTED}
      value={mixName}
      onChangeText={setMixName}
      autoFocus
      maxLength={30}
      />
      <View style={styles.modalButtons}>
      <TouchableOpacity
      style={[styles.modalButton, styles.cancelButton]}
      onPress={() => setShowSaveModal(false)}
      >
      <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <LinearGradient
      colors={COLORS.PRIMARY}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.modalButton, styles.saveButton]}
      >
      <TouchableOpacity
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      onPress={handleSaveMix}
      >
      <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      </LinearGradient>
      </View>
      </View>
      </View>
      </Modal>
      </LinearGradient>
    );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: 50,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stopButton: {
    backgroundColor: COLORS.ACCENT,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY[0],
    marginLeft: 8,
  },
  actionButtonText: {
    color: COLORS.TEXT,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: COLORS.MUTED,
    fontSize: 14,
    fontWeight: '500',
  },
  systemVolumeContainer: {
    marginBottom: 24,
  },
  systemVolumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemVolumeText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  systemVolumeValue: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  systemVolumeGradient: {
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  systemVolumeSlider: {
    width: '100%',
    height: 24,
  },
  systemVolumeThumb: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.TEXT,
    borderRadius: 6,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryList: {
    paddingLeft: 0,
    paddingRight: 16,
    paddingBottom: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.SURFACE,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.PRIMARY[0],
  },
  categoryButtonText: {
    color: COLORS.TEXT,
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,46,0.7)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 zIndex: 100,
  },
  loadingContent: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 180,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  grid: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tileContainer: {
    aspectRatio: 1,
    marginBottom: 16,
    width: TILE_WIDTH,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  tileGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#2c3e50',
    overflow: 'hidden',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 borderWidth: 1,
                                 borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
                                 paddingHorizontal: 8,
                                 paddingVertical: 4,
                                 borderRadius: 12,
  },
  categoryText: {
    color: COLORS.TEXT,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.TEXT,
    marginVertical: 8,
    lineHeight: 20,
  },
  volumeGradient: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
  },
  volumeLabel: {
    color: COLORS.TEXT,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  volumeSlider: {
    width: '100%',
    height: 28,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 alignSelf: 'center',
                                 marginTop: 4,
                                 borderWidth: 2,
                                 borderColor: 'rgba(255,255,255,0.15)',
  },
  playButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
                                 borderColor: 'rgba(255,255,255,0.3)',
                                 transform: [{ scale: 1.05 }],
  },
  playingIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND + 'dd',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 380,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: COLORS.TEXT,
    borderWidth: 1,
    borderColor: '#2c3e50',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: COLORS.SURFACE,
  },
  cancelButtonText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
  },
  saveButtonText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    padding: 16,
  },
});
