import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Preview: { code: string; appType: string; description: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Project {
  id: string;
  description: string;
  appType: 'mobile' | 'web';
  code: string;
  createdAt: string;
}

export default function WorkspaceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsJson = await AsyncStorage.getItem('projects');
      if (projectsJson) {
        const loadedProjects = JSON.parse(projectsJson);
        setProjects(loadedProjects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectPress = (project: Project) => {
    navigation.navigate('Preview', {
      code: project.code,
      appType: project.appType,
      description: project.description,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedProjects = projects.filter((p) => p.id !== projectId);
              setProjects(updatedProjects);
              await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptyDescription}>
            Start building your first app from the home screen
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.createButtonText}>Create Your First App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Projects</Text>
          <Text style={styles.headerSubtitle}>{projects.length} total</Text>
        </View>

        {projects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => handleProjectPress(project)}
          >
            <View style={styles.projectHeader}>
              <View style={styles.projectType}>
                <Text style={styles.projectTypeText}>
                  {project.appType === 'mobile' ? '📱' : '🌐'}{' '}
                  {project.appType === 'mobile' ? 'Mobile' : 'Web'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProject(project.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.projectDescription} numberOfLines={3}>
              {project.description}
            </Text>

            <View style={styles.projectFooter}>
              <Text style={styles.projectDate}>{formatDate(project.createdAt)}</Text>
              <Text style={styles.viewCode}>View Code →</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  projectCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectType: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  projectTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 20,
  },
  projectDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
  viewCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
