import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';
import { SoundState } from '../utils/AudioPlayer';

interface SoundTileProps {
  soundFile: {
    id: string;
    name: string;
    path: any;
  };
  soundState?: SoundState;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

const SoundTile: React.FC<SoundTileProps> = ({
  soundFile,
  soundState,
  onToggle,
  onVolumeChange,
}) => {
  const isPlaying = soundState?.isPlaying || false;
  const volume = soundState?.volume || 0.7;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title} numberOfLines={2}>
          {soundFile.name}
        </Text>

        <TouchableOpacity
          style={styles.playButton}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={64}
            color="#6200ee"
          />
        </TouchableOpacity>

        <View style={styles.volumeContainer}>
          <Text style={styles.volumeLabel}>Volume</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={onVolumeChange}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#cccccc"
            thumbTintColor="#6200ee"
          />
          <Text style={styles.volumeValue}>
            {Math.round(volume * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '50%',
    aspectRatio: 0.8,
    padding: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  volumeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  volumeValue: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

export default SoundTile;
