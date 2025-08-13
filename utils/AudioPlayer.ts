import { Audio } from 'expo-av';

export interface SoundState {
  id: string;
  name: string;
  isPlaying: boolean;
  volume: number;
}

class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private volume: number = 0.7;
  private loop: boolean = true;
  private isLoaded: boolean = false;
  private onStateChange?: (state: Partial<SoundState>) => void;

  constructor(
    private soundPath: any,
      private id: string,
        private name: string,
          onStateChange?: (state: Partial<SoundState>) => void
  ) {
    this.onStateChange = onStateChange;
  }

  async load() {
    if (this.isLoaded) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        this.soundPath,
        {
          shouldPlay: false,
          volume: this.volume,
          isLooping: this.loop,
        }
      );

      this.sound = sound;
      this.isLoaded = true;

      // Set up playback status update
      this.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.onStateChange?.({
            isPlaying: status.isPlaying,
          });
        }
      });
    } catch (error) {
      console.error('Error loading sound', error);
    }
  }

  async play() {
    await this.load();
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.sound) {
      await this.sound.setVolumeAsync(this.volume);
    }
    this.onStateChange?.({ volume: this.volume });
  }

  async setLoop(loop: boolean) {
    this.loop = loop;
    if (this.sound) {
      await this.sound.setIsLoopingAsync(loop);
    }
  }

  getVolume() {
    return this.volume;
  }

  async getStatus() {
    if (this.sound) {
      return await this.sound.getStatusAsync();
    }
    return null;
  }

  async release() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.isLoaded = false;
    }
  }

  getState(): SoundState {
    return {
      id: this.id,
      name: this.name,
      isPlaying: false, // Will be updated by status callback
      volume: this.volume,
    };
  }
}

export default AudioPlayer;
