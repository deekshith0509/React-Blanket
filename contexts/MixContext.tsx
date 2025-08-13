// context/MixContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { MixData } from '../utils/MixStorage';

interface MixContextType {
  activeMix: MixData | null;
  setActiveMix: (mix: MixData | null) => void;
  isLoadingMix: boolean;
  setIsLoadingMix: (loading: boolean) => void;
  isPlaying: boolean;
  currentMix: MixData | null;
  playMix: (mix: MixData) => Promise<void>;
  stopMix: () => Promise<void>;
}

const MixContext = createContext<MixContextType>({
  activeMix: null,
  setActiveMix: () => {},
                                                 isLoadingMix: false,
                                                 setIsLoadingMix: () => {},
                                                 isPlaying: false,
                                                 currentMix: null,
                                                 playMix: async () => {},
                                                 stopMix: async () => {},
});

export const useMix = () => useContext(MixContext);

interface MixProviderProps {
  children: ReactNode;
}

export const MixProvider: React.FC<MixProviderProps> = ({ children }) => {
  const [activeMix, setActiveMix] = useState<MixData | null>(null);
  const [isLoadingMix, setIsLoadingMix] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMix, setCurrentMix] = useState<MixData | null>(null);
  // Map of sound URIs to sound objects (expo-av)
  const soundsRef = useRef<Record<string, Audio.Sound>>({});

  const stopMix = useCallback(async () => {
    try {
      setIsPlaying(false);
      setCurrentMix(null);
      // Stop all playing sounds
      for (const sound of Object.values(soundsRef.current)) {
        await sound.unloadAsync();
      }
      soundsRef.current = {};
    } catch (error) {
      console.error('Error stopping mix:', error);
    }
  }, []);

  const playMix = useCallback(async (mix: MixData) => {
    try {
      setIsLoadingMix(true);
      // Stop any currently playing mix
      await stopMix();

      // For every sound in the mix, start playing if isPlaying = true
      const playPromises = mix.sounds.map(async (sound) => {
        if (sound.isPlaying) {
          // Load and play the sound (replace with your actual sound URI logic)
          // Example: sound is stored as {id, name, isPlaying, volume, uri}
          const soundObj = new Audio.Sound();
          await soundObj.loadAsync({ uri: sound.id }); // If you store URIs, use sound.uri
          await soundObj.setVolumeAsync(sound.volume / 100);
          await soundObj.playAsync();
          soundsRef.current[sound.id] = soundObj;
        }
      });

      await Promise.all(playPromises);
      setIsPlaying(true);
      setCurrentMix(mix);
      setIsLoadingMix(false);
    } catch (error) {
      setIsLoadingMix(false);
      console.error('Error playing mix:', error);
    }
  }, [stopMix]);

  return (
    <MixContext.Provider
    value={{
      activeMix,
      setActiveMix,
      isLoadingMix,
      setIsLoadingMix,
      isPlaying,
      currentMix,
      playMix,
      stopMix,
    }}
    >
    {children}
    </MixContext.Provider>
  );
};

