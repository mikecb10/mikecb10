import React, { useState } from 'react';
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
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Preview: { code: string; appType: string; description: string };
};

type PreviewRouteProp = RouteProp<RootStackParamList, 'Preview'>;

export default function PreviewScreen() {
  const route = useRoute<PreviewRouteProp>();
  const navigation = useNavigation();
  const { code, appType, description } = route.params;
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

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
      <ScrollView style={styles.content}>
        {viewMode === 'code' ? (
          <View style={styles.codeContainer}>
            <ScrollView horizontal>
              <Text style={styles.codeText}>{code}</Text>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={styles.previewPlaceholder}>
              Preview mode is under development
            </Text>
            <Text style={styles.previewSubtext}>
              For now, you can copy the code and run it in your development environment
            </Text>
          </View>
        )}
      </ScrollView>

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
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  previewPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  previewSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
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
