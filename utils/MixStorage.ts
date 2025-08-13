import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MixData {
    name: string;
    sounds: Array<{
        id: string;
        name: string;
        isPlaying: boolean;
        volume: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

const MIX_PREFIX = '@SoundBlanket:mix_';
const MIXES_LIST_KEY = '@SoundBlanket:mixes_list';

// Save a mix
export const saveMix = async (name: string, soundStates: any[]): Promise<boolean> => {
    try {
        const mixData: MixData = {
            name,
            sounds: Object.values(soundStates).filter((state: any) => state.isPlaying),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save the mix data
        await AsyncStorage.setItem(MIX_PREFIX + name, JSON.stringify(mixData));

        // Update the mixes list
        const existingMixes = await getMixesList();
        if (!existingMixes.includes(name)) {
            existingMixes.push(name);
            await AsyncStorage.setItem(MIXES_LIST_KEY, JSON.stringify(existingMixes));
        }

        console.log(`Mix "${name}" saved successfully`);
        return true;
    } catch (error) {
        console.error('Error saving mix:', error);
        return false;
    }
};

// Load a specific mix
export const loadMix = async (name: string): Promise<MixData | null> => {
    try {
        const mixData = await AsyncStorage.getItem(MIX_PREFIX + name);
        return mixData ? JSON.parse(mixData) : null;
    } catch (error) {
        console.error('Error loading mix:', error);
        return null;
    }
};

// Get all saved mix names
export const getMixesList = async (): Promise<string[]> => {
    try {
        const mixesList = await AsyncStorage.getItem(MIXES_LIST_KEY);
        return mixesList ? JSON.parse(mixesList) : [];
    } catch (error) {
        console.error('Error getting mixes list:', error);
        return [];
    }
};

// Delete a mix
export const deleteMix = async (name: string): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(MIX_PREFIX + name);

        // Update the mixes list
        const existingMixes = await getMixesList();
        const updatedMixes = existingMixes.filter(mixName => mixName !== name);
        await AsyncStorage.setItem(MIXES_LIST_KEY, JSON.stringify(updatedMixes));

        console.log(`Mix "${name}" deleted successfully`);
        return true;
    } catch (error) {
        console.error('Error deleting mix:', error);
        return false;
    }
};

// Get all mixes with their data
export const getAllMixes = async (): Promise<MixData[]> => {
    try {
        const mixNames = await getMixesList();
        const mixes: MixData[] = [];

        for (const name of mixNames) {
            const mix = await loadMix(name);
            if (mix) {
                mixes.push(mix);
            }
        }

        return mixes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
        console.error('Error getting all mixes:', error);
        return [];
    }
};
