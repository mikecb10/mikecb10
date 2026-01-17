import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import claudeService from '../services/claudeService';

type RootStackParamList = {
  Home: undefined;
  Workspace: undefined;
  Preview: { code: string; appType: string; description: string };
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [appType, setAppType] = useState<'mobile' | 'web'>('mobile');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    'A fitness tracker app with calorie counting, workout logging, weight tracking, and progress charts. Include a clean modern UI with tabs for Dashboard, Workouts, Nutrition, and Profile.',
    'A minimalist to-do list app with categories, priority levels (high, medium, low), due dates, and completion status. Use a card-based layout with smooth animations.',
    'A personal finance app to track expenses and income by category. Include a dashboard with total balance, monthly spending chart, recent transactions list, and ability to add new transactions.',
    'A content management dashboard with analytics including total views, engagement rate, subscriber count, and a list of posts with their status (published, draft, scheduled). Include a modern dark mode UI.',
    'A recipe finder app with search functionality, ingredient lists, cooking instructions, prep time, and ratings. Include a favorites feature and clean card-based layout.',
    'A habit tracker app where users can create daily habits, mark them as complete, and view their streak. Include a calendar view and motivational stats.',
  ];

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe what you want to build');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await claudeService.generateApp({
        description,
        appType,
      });

      setIsGenerating(false);

      navigation.navigate('Preview', {
        code: result.code,
        appType,
        description,
      });
    } catch (error) {
      setIsGenerating(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Vibe Code</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.title}>Bring your ideas to life</Text>
            <Text style={styles.subtitle}>
              Describe what you want to build and watch it come to life
            </Text>
          </View>

          {/* App Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                appType === 'mobile' && styles.toggleButtonActive,
              ]}
              onPress={() => setAppType('mobile')}
            >
              <Text
                style={[
                  styles.toggleText,
                  appType === 'mobile' && styles.toggleTextActive,
                ]}
              >
                Mobile app
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                appType === 'web' && styles.toggleButtonActive,
              ]}
              onPress={() => setAppType('web')}
            >
              <Text
                style={[
                  styles.toggleText,
                  appType === 'web' && styles.toggleTextActive,
                ]}
              >
                Web app
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Describe your app idea..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate App'}
            </Text>
          </TouchableOpacity>

          {/* Example Prompts */}
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Try an example:</Text>
            {examplePrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleCard}
                onPress={() => setDescription(prompt)}
              >
                <Text style={styles.exampleText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Workspace Button */}
          <TouchableOpacity
            style={styles.workspaceButton}
            onPress={() => navigation.navigate('Workspace')}
          >
            <Text style={styles.workspaceButtonText}>View My Projects</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  hero: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#333',
  },
  generateButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  examplesContainer: {
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  exampleText: {
    fontSize: 14,
    color: '#ccc',
  },
  workspaceButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  workspaceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
