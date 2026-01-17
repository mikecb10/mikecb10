import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import storageService from '../services/storageService';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const MASKED_KEY = 'sk-ant-' + '*'.repeat(40);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const storedKey = await storageService.getItem('claude_api_key');
      if (storedKey) {
        setKeyExists(true);
        setIsEditing(false);
        // Show masked version
        setApiKey(MASKED_KEY);
      } else {
        setKeyExists(false);
        setIsEditing(true);
        setApiKey('');
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
      Alert.alert('Error', 'Failed to load saved API key');
    }
  };

  const handleFocus = () => {
    // When user focuses on the field with a masked key, clear it for editing
    if (apiKey === MASKED_KEY) {
      setApiKey('');
      setIsEditing(true);
    }
  };

  const handleChangeText = (text: string) => {
    setApiKey(text);
    setIsEditing(true);
    setShowSuccessMessage(false);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your Claude API key');
      return;
    }

    // Don't allow saving the masked placeholder
    if (apiKey === MASKED_KEY) {
      Alert.alert('Error', 'Please enter a new API key. The current value is just a placeholder.');
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      Alert.alert('Error', 'Invalid API key format. Claude API keys start with "sk-ant-"');
      return;
    }

    // Basic validation - Claude API keys should be longer than just "sk-ant-"
    if (apiKey.length < 20) {
      Alert.alert('Error', 'API key appears too short. Please check your key and try again.');
      return;
    }

    setIsSaving(true);
    setShowSuccessMessage(false);

    try {
      await storageService.setItem('claude_api_key', apiKey);
      setKeyExists(true);
      setIsEditing(false);
      setApiKey(MASKED_KEY);
      setShowSuccessMessage(true);

      // Show success alert with platform info
      const storageType = storageService.getStorageType();
      const storageMessage = Platform.OS === 'web'
        ? 'API key saved to browser storage!'
        : 'API key saved securely!';

      Alert.alert('Success', storageMessage, [
        {
          text: 'OK',
          onPress: () => setShowSuccessMessage(false),
        },
      ]);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteItem('claude_api_key');
              setApiKey('');
              setKeyExists(false);
              setIsEditing(true);
              setShowSuccessMessage(false);
              Alert.alert('Success', 'API key removed');
            } catch (error) {
              console.error('Error removing API key:', error);
              Alert.alert('Error', 'Failed to remove API key');
            }
          },
        },
      ]
    );
  };

  const openAnthropicConsole = () => {
    Linking.openURL('https://console.anthropic.com/settings/keys');
  };

  return (
    <LinearGradient
      colors={['#0F0F23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>⚙️ Settings</Text>
            </LinearGradient>
          </View>

          <LinearGradient
            colors={['#1e1e3f', '#2a2a4a']}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Claude API Key</Text>
            <Text style={styles.sectionDescription}>
              To use Vibe Code, you need a Claude API key from your Anthropic account.
            </Text>

            <TouchableOpacity
              style={styles.linkButtonWrapper}
              onPress={openAnthropicConsole}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#667eea22', '#764ba222']}
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>
                  Get your API key from Anthropic Console →
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>API Key</Text>
                {keyExists && !isEditing && (
                  <LinearGradient
                    colors={['#00dd00', '#00aa00']}
                    style={styles.savedBadge}
                  >
                    <Text style={styles.savedBadgeText}>✓ Saved</Text>
                  </LinearGradient>
                )}
              </View>
              <LinearGradient
                colors={showSuccessMessage ? ['#00dd00', '#00aa00'] : ['#667eea22', '#764ba222']}
                style={styles.inputGradient}
              >
                <TextInput
                  style={styles.input}
                  placeholder="sk-ant-..."
                  placeholderTextColor="#7a7a9e"
                  value={apiKey}
                  onChangeText={handleChangeText}
                  onFocus={handleFocus}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={false}
                />
              </LinearGradient>
              {showSuccessMessage && (
                <LinearGradient
                  colors={['#00330011', '#00550011']}
                  style={styles.successMessage}
                >
                  <Text style={styles.successMessageText}>✓ API key saved successfully!</Text>
                </LinearGradient>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSaving ? ['#555577', '#666688'] : ['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? '✨ Saving...' : '💾 Save API Key'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {keyExists && (
              <TouchableOpacity
                style={styles.removeButtonWrapper}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#1e1e3f', '#2a2a4a']}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>🗑️ Remove API Key</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>

          <LinearGradient
            colors={['#1e1e3f', '#2a2a4a']}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>📖 How to get your API key</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1.</Text>
              <Text style={styles.stepText}>
                Go to console.anthropic.com and sign in
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2.</Text>
              <Text style={styles.stepText}>
                Navigate to Settings → API Keys
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3.</Text>
              <Text style={styles.stepText}>
                Create a new key and copy it
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4.</Text>
              <Text style={styles.stepText}>
                Paste it above and tap "Save API Key"
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#1e1e3f', '#2a2a4a']}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>ℹ️ About</Text>
            <Text style={styles.aboutText}>
              Vibe Code is a free, open-source AI app builder powered by Claude.
              Your API key is stored securely on your device and never sent to our servers.
            </Text>
            <Text style={styles.aboutText}>
              Storage: {Platform.OS === 'web' ? 'Browser localStorage' : 'Expo SecureStore'}
            </Text>
            <Text style={styles.aboutText}>
              Version 1.0.0
            </Text>
          </LinearGradient>

          {/* Footer Spacer */}
          <View style={styles.footer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#a0a0c0',
    lineHeight: 22,
    marginBottom: 18,
  },
  linkButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  linkButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0c0',
  },
  savedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  inputGradient: {
    borderRadius: 16,
    padding: 2,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  successMessage: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00aa00',
  },
  successMessageText: {
    fontSize: 14,
    color: '#00dd00',
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  removeButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  removeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
    marginRight: 12,
    width: 28,
  },
  stepText: {
    fontSize: 15,
    color: '#a0a0c0',
    flex: 1,
    lineHeight: 22,
  },
  aboutText: {
    fontSize: 15,
    color: '#a0a0c0',
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    height: 40,
  },
});
