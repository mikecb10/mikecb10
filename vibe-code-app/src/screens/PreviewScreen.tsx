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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.appTypeText}>{appType === 'mobile' ? 'Mobile App' : 'Web App'}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'code' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('code')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'code' && styles.toggleTextActive,
            ]}
          >
            Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'preview' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('preview')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'preview' && styles.toggleTextActive,
            ]}
          >
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Code/Preview Content */}
      {viewMode === 'code' ? (
        <ScrollView style={styles.content}>
          <View style={styles.codeContainer}>
            <ScrollView horizontal>
              <Text style={styles.codeText}>{code}</Text>
            </ScrollView>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.content}>
          {appType === 'mobile' ? (
            <ScrollView style={styles.previewScrollView}>
              {isCreatingSnack ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Creating live preview...</Text>
                </View>
              ) : snackError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Preview Error</Text>
                  <Text style={styles.errorText}>{snackError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={createSnackPreview}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : snackData ? (
                <QRCodeDisplay
                  url={snackData.url}
                  snackId={snackData.id}
                  loading={false}
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
          style={styles.actionButton}
          onPress={handleCopyCode}
        >
          <Text style={styles.actionButtonText}>Copy Code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareCode}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonPrimary}
          onPress={handleSaveToWorkspace}
        >
          <Text style={styles.actionButtonPrimaryText}>Save to Workspace</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerInfo: {
    marginBottom: 10,
  },
  appTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 12,
    padding: 4,
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
  content: {
    flex: 1,
  },
  codeContainer: {
    padding: 20,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#0f0',
    lineHeight: 20,
  },
  previewScrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonPrimary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
