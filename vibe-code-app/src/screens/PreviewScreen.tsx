import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import snackService, { SnackResponse } from '../services/snackService';
import QRCodeDisplay from '../components/QRCodeDisplay';
import WebPreview from '../components/WebPreview';

type RootStackParamList = {
  Preview: { code: string; appType: string; description: string };
};

type PreviewRouteProp = RouteProp<RootStackParamList, 'Preview'>;

export default function PreviewScreen() {
  const route = useRoute<PreviewRouteProp>();
  const navigation = useNavigation();
  const { code, appType, description } = route.params;
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [snackData, setSnackData] = useState<SnackResponse | null>(null);
  const [isCreatingSnack, setIsCreatingSnack] = useState(false);
  const [snackError, setSnackError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-create snack for mobile apps when preview mode is selected
    if (viewMode === 'preview' && appType === 'mobile' && !snackData && !isCreatingSnack) {
      createSnackPreview();
    }
  }, [viewMode, appType]);

  const createSnackPreview = async () => {
    setIsCreatingSnack(true);
    setSnackError(null);

    try {
      const snack = await snackService.createSnack(code, description);
      setSnackData(snack);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create preview';
      setSnackError(errorMessage);
      Alert.alert('Preview Error', errorMessage);
    } finally {
      setIsCreatingSnack(false);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Success', 'Code copied to clipboard!');
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: code,
        title: 'Generated App Code',
      });
    } catch (error) {
      console.error('Error sharing code:', error);
    }
  };

  const handleSaveToWorkspace = async () => {
    try {
      // Load existing projects
      const projectsJson = await AsyncStorage.getItem('projects');
      const projects = projectsJson ? JSON.parse(projectsJson) : [];

      // Create new project
      const newProject = {
        id: Date.now().toString(),
        description,
        appType,
        code,
        createdAt: new Date().toISOString(),
      };

      // Add to projects array
      projects.unshift(newProject);

      // Save back to storage
      await AsyncStorage.setItem('projects', JSON.stringify(projects));

      Alert.alert('Success', 'Project saved to workspace!', [
        {
          text: 'View Workspace',
          onPress: () => navigation.navigate('Workspace' as never),
        },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save project. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#0F0F23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <LinearGradient
          colors={['#1e1e3f', '#2a2a4a']}
          style={styles.header}
        >
          <View style={styles.headerInfo}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.appTypeBadge}
            >
              <Text style={styles.appTypeText}>
                {appType === 'mobile' ? '📱 Mobile App' : '🌐 Web App'}
              </Text>
            </LinearGradient>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {description}
            </Text>
          </View>
        </LinearGradient>

        {/* View Mode Toggle */}
        <LinearGradient
          colors={['#1e1e3f', '#2a2a4a']}
          style={styles.toggleContainer}
        >
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode('code')}
          >
            {viewMode === 'code' ? (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.toggleButtonActive}
              >
                <Text style={styles.toggleTextActive}>📄 Code</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>📄 Code</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setViewMode('preview')}
          >
            {viewMode === 'preview' ? (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.toggleButtonActive}
              >
                <Text style={styles.toggleTextActive}>👁️ Preview</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>👁️ Preview</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Code/Preview Content */}
        {viewMode === 'code' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.codeContainer}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{code}</Text>
              </ScrollView>
            </LinearGradient>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {appType === 'mobile' ? (
              <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={false}>
                {isCreatingSnack ? (
                  <LinearGradient
                    colors={['#1e1e3f', '#2a2a4a']}
                    style={styles.loadingContainer}
                  >
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Creating live preview...</Text>
                  </LinearGradient>
                ) : snackError ? (
                  <LinearGradient
                    colors={['#1e1e3f', '#2a2a4a']}
                    style={styles.errorContainer}
                  >
                    <Text style={styles.errorTitle}>Preview Error</Text>
                    <Text style={styles.errorText}>{snackError}</Text>
                    <TouchableOpacity
                      onPress={createSnackPreview}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.retryButton}
                      >
                        <Text style={styles.retryButtonText}>🔄 Retry</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : snackData ? (
                  <QRCodeDisplay
                    url={snackData.url}
                    snackId={snackData.id}
                    loading={false}
                    code={code}
                  />
                ) : null}
              </ScrollView>
            ) : (
              <WebPreview code={code} description={description} />
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>📋 Copy Code</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareCode}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>↗️ Share</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveToWorkspace}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonPrimary}
            >
              <Text style={styles.actionButtonPrimaryText}>💾 Save to Workspace</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerInfo: {
    gap: 12,
  },
  appTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  appTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    color: '#a0a0c0',
    lineHeight: 22,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
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
    fontSize: 15,
    color: '#7a7a9e',
    fontWeight: '600',
    paddingVertical: 14,
    textAlign: 'center',
  },
  toggleTextActive: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  codeContainer: {
    padding: 20,
    borderRadius: 16,
    minHeight: 200,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#00ff88',
    lineHeight: 20,
  },
  previewScrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
    borderRadius: 16,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: '#a0a0c0',
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ff8888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  actions: {
    padding: 20,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonPrimary: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  actionButtonPrimaryText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
