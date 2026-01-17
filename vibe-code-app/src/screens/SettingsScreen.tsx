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
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
      const storedKey = await SecureStore.getItemAsync('claude_api_key');
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
      await SecureStore.setItemAsync('claude_api_key', apiKey);
      setKeyExists(true);
      setIsEditing(false);
      setApiKey(MASKED_KEY);
      setShowSuccessMessage(true);

      // Show success alert
      Alert.alert('Success', 'API key saved securely!', [
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
              await SecureStore.deleteItemAsync('claude_api_key');
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claude API Key</Text>
          <Text style={styles.sectionDescription}>
            To use Vibe Code, you need a Claude API key from your Anthropic account.
          </Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={openAnthropicConsole}
          >
            <Text style={styles.linkButtonText}>
              Get your API key from Anthropic Console →
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>API Key</Text>
              {keyExists && !isEditing && (
                <View style={styles.savedBadge}>
                  <Text style={styles.savedBadgeText}>✓ Saved</Text>
                </View>
              )}
            </View>
            <TextInput
              style={[
                styles.input,
                showSuccessMessage && styles.inputSuccess,
              ]}
              placeholder="sk-ant-..."
              placeholderTextColor="#666"
              value={apiKey}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
            {showSuccessMessage && (
              <View style={styles.successMessage}>
                <Text style={styles.successMessageText}>✓ API key saved successfully!</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save API Key'}
            </Text>
          </TouchableOpacity>

          {keyExists && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
            >
              <Text style={styles.removeButtonText}>Remove API Key</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to get your API key</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Vibe Code is a free, open-source AI app builder powered by Claude.
            Your API key is stored securely on your device and never sent to our servers.
          </Text>
          <Text style={styles.aboutText}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 15,
  },
  linkButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  linkButtonText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  savedBadge: {
    backgroundColor: '#00aa00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputSuccess: {
    borderColor: '#00aa00',
    borderWidth: 2,
  },
  successMessage: {
    marginTop: 8,
    backgroundColor: '#00330011',
    borderRadius: 8,
    padding: 12,
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
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  removeButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
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
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
    width: 24,
  },
  stepText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 10,
  },
});
