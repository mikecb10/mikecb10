import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform secure storage service
 * - Uses SecureStore on iOS/Android
 * - Uses localStorage on Web
 */
class StorageService {
  /**
   * Save a value to secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        } else {
          throw new Error('localStorage is not available');
        }
      } else {
        // Use SecureStore on mobile
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  /**
   * Get a value from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        } else {
          throw new Error('localStorage is not available');
        }
      } else {
        // Use SecureStore on mobile
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        } else {
          throw new Error('localStorage is not available');
        }
      } else {
        // Use SecureStore on mobile
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Storage deleteItem error:', error);
      throw error;
    }
  }

  /**
   * Get the storage type being used
   */
  getStorageType(): 'SecureStore' | 'localStorage' {
    return Platform.OS === 'web' ? 'localStorage' : 'SecureStore';
  }
}

export default new StorageService();
