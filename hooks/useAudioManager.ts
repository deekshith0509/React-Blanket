import { useState, useCallback, useRef } from 'react';
import AudioPlayer, { SoundState } from '../utils/AudioPlayer';

interface SoundFile {
  id: string;
  name: string;
  path: any;
}

export const useAudioManager = (soundFiles: SoundFile[]) => {
  const [soundStates, setSoundStates] = useState<Record<string, SoundState>>({});
  const audioPlayersRef = useRef<Record<string, AudioPlayer>>({});

  const updateSoundState = useCallback((id: string, updates: Partial<SoundState>) => {
    setSoundStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  const getOrCreatePlayer = useCallback((soundFile: SoundFile) => {
    if (!audioPlayersRef.current[soundFile.id]) {
      audioPlayersRef.current[soundFile.id] = new AudioPlayer(
        soundFile.path,
        soundFile.id,
        soundFile.name,
        (updates) => updateSoundState(soundFile.id, updates)
      );

      // Initialize state
      setSoundStates(prev => ({
        ...prev,
        [soundFile.id]: {
          id: soundFile.id,
          name: soundFile.name,
          isPlaying: false,
          volume: 0.7,
        }
      }));
    }
    return audioPlayersRef.current[soundFile.id];
  }, [updateSoundState]);

  const toggleSound = useCallback(async (soundFile: SoundFile) => {
    const player = getOrCreatePlayer(soundFile);
    const currentState = soundStates[soundFile.id];

    if (currentState?.isPlaying) {
      await player.pause();
      updateSoundState(soundFile.id, { isPlaying: false });
    } else {
      await player.play();
      updateSoundState(soundFile.id, { isPlaying: true });
    }
  }, [soundStates, getOrCreatePlayer, updateSoundState]);

  const setVolume = useCallback(async (soundFile: SoundFile, volume: number) => {
    const player = getOrCreatePlayer(soundFile);
    await player.setVolume(volume);
    updateSoundState(soundFile.id, { volume });
  }, [getOrCreatePlayer, updateSoundState]);

  const stopAllSounds = useCallback(async () => {
    for (const player of Object.values(audioPlayersRef.current)) {
      await player.stop();
    }
    setSoundStates(prev => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach(id => {
        newStates[id] = { ...newStates[id], isPlaying: false };
      });
      return newStates;
    });
  }, []);

  const loadMixState = useCallback(async (mixSounds: SoundState[]) => {
    await stopAllSounds();

    for (const mixSound of mixSounds) {
      const soundFile = soundFiles.find(sf => sf.id === mixSound.id);
      if (soundFile) {
        const player = getOrCreatePlayer(soundFile);
        await player.setVolume(mixSound.volume);

        if (mixSound.isPlaying) {
          await player.play();
        }

        updateSoundState(soundFile.id, mixSound);
      }
    }
  }, [soundFiles, stopAllSounds, getOrCreatePlayer, updateSoundState]);

  const getCurrentMixState = useCallback(() => {
    return Object.values(soundStates);
  }, [soundStates]);

  const releaseAllPlayers = useCallback(async () => {
    for (const player of Object.values(audioPlayersRef.current)) {
      await player.release();
    }
    audioPlayersRef.current = {};
    setSoundStates({});
  }, []);

  return {
    soundStates,
    toggleSound,
    setVolume,
    stopAllSounds,
    loadMixState,
    getCurrentMixState,
    releaseAllPlayers,
  };
};
