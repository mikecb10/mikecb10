import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  url: string;
  snackId?: string;
  loading?: boolean;
}

export default function QRCodeDisplay({ url, snackId, loading }: QRCodeDisplayProps) {
  const handleOpenInBrowser = () => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Creating live preview...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Preview on Your Phone</Text>
      <Text style={styles.subtitle}>Open with Expo Go app</Text>

      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            value={url}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>How to preview:</Text>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>Install Expo Go on your phone (App Store/Play Store)</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>Open the Expo Go app</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>Scan this QR code with your phone's camera</Text>
        </View>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>Your app will load and run live!</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.linkButton} onPress={handleOpenInBrowser}>
        <Text style={styles.linkButtonText}>Open in Expo Snack Browser →</Text>
      </TouchableOpacity>

      {snackId && (
        <View style={styles.snackIdContainer}>
          <Text style={styles.snackIdLabel}>Snack ID:</Text>
          <Text style={styles.snackIdText}>{snackId}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
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
    marginBottom: 25,
    textAlign: 'center',
  },
  qrContainer: {
    marginBottom: 30,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#fff',
    marginRight: 10,
    width: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
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
  snackIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  snackIdLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  snackIdText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
