import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';

interface QRCodeDisplayProps {
  url: string;
  snackId?: string;
  loading?: boolean;
  code?: string;
}

export default function QRCodeDisplay({ url, snackId, loading, code }: QRCodeDisplayProps) {
  const handleOpenSnack = () => {
    // Open a blank Snack where users can paste the code
    Linking.openURL('https://snack.expo.dev');
  };

  const handleCopyCode = async () => {
    if (code) {
      await Clipboard.setStringAsync(code);
      Alert.alert('Success', 'Code copied! Open Expo Snack and paste it in.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Preparing preview...</Text>
      </View>
    );
  }

  // Embed Snack in iframe for web preview
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mobile App Preview</Text>
        <Text style={styles.subtitle}>Open Expo Snack to test on your device</Text>

        <View style={styles.iframeContainer}>
          <WebView
            source={{ uri: 'https://snack.expo.dev' }}
            style={styles.webView}
            javaScriptEnabled={true}
          />
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>How to preview on your phone:</Text>
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Copy the generated code below</Text>
          </View>
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>Click "Open Expo Snack" to open a new Snack</Text>
          </View>
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Paste the code in App.js</Text>
          </View>
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>4.</Text>
            <Text style={styles.stepText}>Scan the QR code with Expo Go app on your phone</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.copyButtonText}>📋 Copy Code to Clipboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleOpenSnack}>
          <Text style={styles.linkButtonText}>🚀 Open Expo Snack →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For mobile, show instructions
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preview Your App</Text>
      <Text style={styles.subtitle}>Test on Expo Snack</Text>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Quick preview steps:</Text>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>Tap "Copy Code" below</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>Tap "Open Expo Snack"</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>Paste the code in App.js</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>Scan QR code with Expo Go to test on your phone</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
        <Text style={styles.copyButtonText}>📋 Copy Code to Clipboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleOpenSnack}>
        <Text style={styles.linkButtonText}>🚀 Open Expo Snack →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  iframeContainer: {
    height: 400,
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  webView: {
    flex: 1,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 10,
    width: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  copyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 10,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  linkButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 15,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});
