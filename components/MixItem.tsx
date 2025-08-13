import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MixData } from '../utils/Storage';

interface MixItemProps {
  mix: MixData;
  onLoad: (mixName: string) => void;
  onDelete: (mixName: string) => void;
}

const MixItem: React.FC<MixItemProps> = ({ mix, onLoad, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Mix',
      `Are you sure you want to delete "${mix.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(mix.name) },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const playingSoundsCount = mix.sounds.filter(s => s.isPlaying).length;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onLoad(mix.name)}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome name="music" size={24} color="#6200ee" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name}>{mix.name}</Text>
          <Text style={styles.details}>
            {playingSoundsCount} sounds • {formatDate(mix.createdAt)}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <FontAwesome name="trash-o" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
});

export default MixItem;
