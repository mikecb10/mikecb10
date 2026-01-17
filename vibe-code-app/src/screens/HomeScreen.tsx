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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import claudeService from '../services/claudeService';
import LiveCodePreview from '../components/LiveCodePreview';

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
  const [streamingCode, setStreamingCode] = useState('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);

  const examplePrompts = [
    { emoji: '💪', text: 'A fitness tracker app with calorie counting, workout logging, weight tracking, and progress charts. Include a clean modern UI with tabs for Dashboard, Workouts, Nutrition, and Profile.' },
    { emoji: '✅', text: 'A minimalist to-do list app with categories, priority levels (high, medium, low), due dates, and completion status. Use a card-based layout with smooth animations.' },
    { emoji: '💰', text: 'A personal finance app to track expenses and income by category. Include a dashboard with total balance, monthly spending chart, recent transactions list, and ability to add new transactions.' },
    { emoji: '📊', text: 'A content management dashboard with analytics including total views, engagement rate, subscriber count, and a list of posts with their status (published, draft, scheduled). Include a modern dark mode UI.' },
    { emoji: '🍳', text: 'A recipe finder app with search functionality, ingredient lists, cooking instructions, prep time, and ratings. Include a favorites feature and clean card-based layout.' },
    { emoji: '🎯', text: 'A habit tracker app where users can create daily habits, mark them as complete, and view their streak. Include a calendar view and motivational stats.' },
  ];

  const handleGenerate = async () => {
    console.log('🔵 Generate button clicked');
    console.log('📝 Description:', description);
    console.log('📱 App type:', appType);
    console.log('🌐 Platform:', Platform.OS);

    if (!description.trim()) {
      console.log('❌ Description is empty');
      Alert.alert('Error', 'Please describe what you want to build');
      return;
    }

    console.log('✅ Description validation passed');
    setIsGenerating(true);
    setStreamingCode('');
    setIsStreamComplete(false);
    console.log('⏳ isGenerating set to true');

    try {
      console.log('🚀 Calling claudeService.generateAppStreaming...');

      // Use streaming API
      await claudeService.generateAppStreaming(
        {
          description,
          appType,
        },
        // onChunk callback - called for each piece of code
        (chunk: string) => {
          setStreamingCode((prev) => prev + chunk);
        },
        // onComplete callback - called when generation is complete
        (finalCode: string) => {
          console.log('✅ Streaming complete');
          console.log('📄 Final code length:', finalCode.length);

          setIsStreamComplete(true);
          setIsGenerating(false);

          // Auto-navigate to Preview after a short delay
          setTimeout(() => {
            console.log('🧭 Navigating to Preview screen...');
            navigation.navigate('Preview', {
              code: finalCode,
              appType,
              description,
            });

            // Reset streaming state
            setStreamingCode('');
            setIsStreamComplete(false);
          }, 1500);
        },
        // onError callback - called if there's an error
        (error: Error) => {
          console.log('❌ Error in streaming:', error);
          setIsGenerating(false);
          setStreamingCode('');
          setIsStreamComplete(false);
          Alert.alert('Error', error.message || 'Failed to generate app. Please try again.');
        }
      );
    } catch (error) {
      console.log('❌ Error caught in handleGenerate:', error);
      console.error('❌ Full error object:', error);
      setIsGenerating(false);
      setStreamingCode('');
      setIsStreamComplete(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app. Please try again.';
      console.log('❌ Error message:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <LinearGradient
      colors={['#0F0F23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logo}>✨ Vibe Code</Text>
              </LinearGradient>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <LinearGradient
                  colors={['#667eea22', '#764ba222']}
                  style={styles.settingsIconContainer}
                >
                  <Text style={styles.settingsIcon}>⚙️</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
              <Text style={styles.title}>Bring your ideas to life</Text>
              <Text style={styles.subtitle}>
                Describe what you want to build and watch AI create it instantly
              </Text>
            </View>

            {/* App Type Toggle */}
            <LinearGradient
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.toggleContainer}
            >
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setAppType('mobile')}
              >
                {appType === 'mobile' ? (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.toggleButtonActive}
                  >
                    <Text style={styles.toggleTextActive}>📱 Mobile app</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>📱 Mobile app</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setAppType('web')}
              >
                {appType === 'web' ? (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.toggleButtonActive}
                  >
                    <Text style={styles.toggleTextActive}>🌐 Web app</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>🌐 Web app</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Describe your vision</Text>
              <LinearGradient
                colors={['#1e1e3f', '#2a2a4a']}
                style={styles.inputGradient}
              >
                <TextInput
                  style={styles.input}
                  placeholder="A revolutionary app that..."
                  placeholderTextColor="#7a7a9e"
                  multiline
                  numberOfLines={6}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </LinearGradient>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isGenerating ? ['#555577', '#666688'] : ['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.generateButton}
              >
                <Text style={styles.generateButtonText}>
                  {isGenerating ? '✨ Generating Magic...' : '🚀 Generate App'}
                </Text>
                {!isGenerating && <Text style={styles.generateButtonSubtext}>Powered by Claude AI</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Live Code Preview */}
            {isGenerating && streamingCode && (
              <LiveCodePreview
                code={streamingCode}
                isComplete={isStreamComplete}
              />
            )}

            {/* Example Prompts */}
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>✨ Try an example</Text>
              {examplePrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setDescription(prompt.text)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#1e1e3f', '#2a2a4a']}
                    style={styles.exampleCard}
                  >
                    <View style={styles.exampleHeader}>
                      <Text style={styles.exampleEmoji}>{prompt.emoji}</Text>
                    </View>
                    <Text style={styles.exampleText} numberOfLines={2}>
                      {prompt.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Workspace Button */}
            <TouchableOpacity
              style={styles.workspaceButton}
              onPress={() => navigation.navigate('Workspace')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#1e1e3f', '#2a2a4a']}
                style={styles.workspaceGradient}
              >
                <Text style={styles.workspaceButtonText}>📂 View My Projects</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer Spacer */}
            <View style={styles.footer} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  logoGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  settingsButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingsIconContainer: {
    padding: 12,
    borderRadius: 15,
  },
  settingsIcon: {
    fontSize: 24,
  },
  hero: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#a0a0c0',
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: '90%',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButtonActive: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 16,
    color: '#7a7a9e',
    fontWeight: '600',
    paddingVertical: 14,
    textAlign: 'center',
  },
  toggleTextActive: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0c0',
    marginBottom: 12,
    marginLeft: 4,
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
    minHeight: 150,
    fontWeight: '400',
  },
  generateButton: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  generateButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  generateButtonSubtext: {
    fontSize: 12,
    color: '#ffffffcc',
    marginTop: 4,
    fontWeight: '500',
  },
  examplesContainer: {
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  exampleCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  exampleHeader: {
    marginBottom: 10,
  },
  exampleEmoji: {
    fontSize: 32,
  },
  exampleText: {
    fontSize: 14,
    color: '#a0a0c0',
    lineHeight: 22,
    fontWeight: '500',
  },
  workspaceButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  workspaceGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  workspaceButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    height: 40,
  },
});
