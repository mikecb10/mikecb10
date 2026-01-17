import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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
    setProjectToDelete(projectId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const updatedProjects = projects.filter((p) => p.id !== projectToDelete);
      setProjects(updatedProjects);
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      setDeleteModalVisible(false);
      setProjectToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete project');
      setDeleteModalVisible(false);
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setProjectToDelete(null);
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
      <LinearGradient
        colors={['#0F0F23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading workspace...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (projects.length === 0) {
    return (
      <LinearGradient
        colors={['#0F0F23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContent}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyDescription}>
              Start building your first app from the home screen
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>🚀 Create Your First App</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
              <Text style={styles.headerTitle}>💼 My Workspace</Text>
            </LinearGradient>
            <Text style={styles.headerSubtitle}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
          </View>

          {/* Project Cards */}
          {projects.map((project) => (
            <LinearGradient
              key={project.id}
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.projectCard}
            >
              <TouchableOpacity
                onPress={() => handleProjectPress(project)}
                activeOpacity={0.9}
              >
                <View style={styles.projectHeader}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.projectType}
                  >
                    <Text style={styles.projectTypeText}>
                      {project.appType === 'mobile' ? '📱 Mobile' : '🌐 Web'}
                    </Text>
                  </LinearGradient>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#ff444422', '#ff666622']}
                      style={styles.deleteButtonGradient}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <Text style={styles.projectDescription} numberOfLines={3}>
                  {project.description}
                </Text>

                <View style={styles.projectFooter}>
                  <Text style={styles.projectDate}>📅 {formatDate(project.createdAt)}</Text>
                  <LinearGradient
                    colors={['#667eea22', '#764ba222']}
                    style={styles.viewCodeButton}
                  >
                    <Text style={styles.viewCode}>View Code →</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent={true}
          visible={deleteModalVisible}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={['#1e1e3f', '#2a2a4a']}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>🗑️ Delete Project?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete this project? This cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={cancelDelete}
                  activeOpacity={0.8}
                  style={styles.modalButtonWrapper}
                >
                  <LinearGradient
                    colors={['#1e1e3f', '#2a2a4a']}
                    style={styles.modalButtonSecondary}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmDelete}
                  activeOpacity={0.8}
                  style={styles.modalButtonWrapper}
                >
                  <LinearGradient
                    colors={['#ff4444', '#ff6666']}
                    style={styles.modalButtonPrimary}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Delete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#a0a0c0',
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#a0a0c0',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 300,
  },
  createButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#a0a0c0',
    fontWeight: '500',
  },
  projectCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  projectType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteIcon: {
    fontSize: 20,
  },
  projectDescription: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: '400',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 13,
    color: '#7a7a9e',
    fontWeight: '500',
  },
  viewCodeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#a0a0c0',
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonWrapper: {
    flex: 1,
  },
  modalButtonSecondary: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalButtonPrimary: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
