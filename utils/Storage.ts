import * as SecureStore from 'expo-secure-store';

export interface MixData {
  name: string;
  sounds: Array<{
    id: string;
    name: string;
    isPlaying: boolean;
    volume: number;
  }>;
  createdAt: string;
}

const MIX_PREFIX = 'mix_';
const MIXES_LIST_KEY = 'saved_mixes_list';

export const saveMix = async (mixName: string, soundStates: any[]): Promise<boolean> => {
  try {
    const mixData: MixData = {
      name: mixName,
      sounds: soundStates,
      createdAt: new Date().toISOString(),
    };

    // Save the mix data
    await SecureStore.setItemAsync(
      `${MIX_PREFIX}${mixName}`,
      JSON.stringify(mixData)
    );

    // Update the mixes list
    const existingMixes = await getMixesList();
    if (!existingMixes.includes(mixName)) {
      existingMixes.push(mixName);
      await SecureStore.setItemAsync(
        MIXES_LIST_KEY,
        JSON.stringify(existingMixes)
      );
    }

    return true;
  } catch (error) {
    console.error('Error saving mix:', error);
    return false;
  }
};

export const loadMix = async (mixName: string): Promise<MixData | null> => {
  try {
    const mixDataString = await SecureStore.getItemAsync(`${MIX_PREFIX}${mixName}`);
    if (mixDataString) {
      return JSON.parse(mixDataString);
    }
    return null;
  } catch (error) {
    console.error('Error loading mix:', error);
    return null;
  }
};

export const deleteMix = async (mixName: string): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(`${MIX_PREFIX}${mixName}`);

    // Update the mixes list
    const existingMixes = await getMixesList();
    const updatedMixes = existingMixes.filter(name => name !== mixName);
    await SecureStore.setItemAsync(
      MIXES_LIST_KEY,
      JSON.stringify(updatedMixes)
    );

    return true;
  } catch (error) {
    console.error('Error deleting mix:', error);
    return false;
  }
};

export const getMixesList = async (): Promise<string[]> => {
  try {
    const mixesListString = await SecureStore.getItemAsync(MIXES_LIST_KEY);
    if (mixesListString) {
      return JSON.parse(mixesListString);
    }
    return [];
  } catch (error) {
    console.error('Error getting mixes list:', error);
    return [];
  }
};
