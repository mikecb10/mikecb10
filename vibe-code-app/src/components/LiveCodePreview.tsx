import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LiveCodePreviewProps {
  code: string;
  isComplete: boolean;
}

export default function LiveCodePreview({ code, isComplete }: LiveCodePreviewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Auto-scroll to bottom as new code appears
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [code]);

  // Blinking cursor animation
  useEffect(() => {
    if (!isComplete) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isComplete]);

  return (
    <LinearGradient
      colors={['#1e1e3f', '#2a2a4a']}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={['#667eea22', '#764ba222']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.statusDot} />
          <Text style={styles.headerText}>
            {isComplete ? '✅ Generation Complete' : '✨ Claude is coding...'}
          </Text>
        </View>
      </LinearGradient>

      {/* Code Display */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.codeScrollView}
        contentContainerStyle={styles.codeScrollContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.codeText}>
          {code}
          {!isComplete && (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
              |
            </Animated.Text>
          )}
        </Text>
      </ScrollView>

      {/* Footer with progress indicator */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressBar}
        />
        <Text style={styles.footerText}>
          {isComplete
            ? `${code.length} characters generated`
            : `${code.length} characters...`}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
    maxHeight: 400,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#667eea33',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    marginRight: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  codeScrollView: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  codeScrollContent: {
    padding: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#00ff88',
    lineHeight: 18,
  },
  cursor: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#667eea33',
  },
  progressBar: {
    height: 2,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#a0a0c0',
    textAlign: 'center',
  },
});
