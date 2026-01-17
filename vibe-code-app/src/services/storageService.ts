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
    console.log('💾 storageService.getItem called for key:', key);
    console.log('🌐 Platform:', Platform.OS);

    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Using localStorage (web platform)');
        // Use localStorage on web
        if (typeof window !== 'undefined' && window.localStorage) {
          const value = window.localStorage.getItem(key);
          console.log('✅ localStorage.getItem result:', value ? `${value.substring(0, 15)}... (length: ${value.length})` : 'NULL');
          return value;
        } else {
          console.log('❌ localStorage is not available');
          throw new Error('localStorage is not available');
        }
      } else {
        console.log('📱 Using SecureStore (mobile platform)');
        // Use SecureStore on mobile
        const value = await SecureStore.getItemAsync(key);
        console.log('✅ SecureStore.getItemAsync result:', value ? `${value.substring(0, 15)}... (length: ${value.length})` : 'NULL');
        return value;
      }
    } catch (error) {
      console.error('❌ Storage getItem error:', error);
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
