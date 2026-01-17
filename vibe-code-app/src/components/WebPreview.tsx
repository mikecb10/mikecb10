import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebPreviewProps {
  code: string;
  description: string;
}

export default function WebPreview({ code, description }: WebPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePreviewHTML();
  }, [code]);

  const generatePreviewHTML = () => {
    try {
      setLoading(true);
      setError(null);

      // Create a complete HTML document with the React code
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${description}</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React and ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    #root {
      width: 100%;
      min-height: 100vh;
    }

    .error-container {
      padding: 20px;
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      margin: 20px;
    }

    .error-title {
      color: #c00;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .error-message {
      color: #600;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo } = React;

    // Wrap the user's code in a try-catch
    try {
      ${code}

      // Render the app
      const root = ReactDOM.createRoot(document.getElementById('root'));

      // Try to render the default export or App component
      if (typeof App !== 'undefined') {
        root.render(<App />);
      } else {
        root.render(
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Preview Ready</h2>
            <p>The code has been loaded. Make sure to export a default component named "App".</p>
          </div>
        );
      }
    } catch (error) {
      // Show error in the preview
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <div className="error-container">
          <div className="error-title">Preview Error</div>
          <div className="error-message">{error.toString()}</div>
        </div>
      );
    }
  </script>
</body>
</html>
      `.trim();

      setHtmlContent(html);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
      setLoading(false);
    }
  };

  const handleWebViewError = () => {
    setError('Failed to load preview. The code might have errors.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Generating preview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Preview Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Try viewing the code directly or check for syntax errors.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Live Web Preview</Text>
        <Text style={styles.previewSubtitle}>Interactive preview of your generated app</Text>
      </View>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webView}
        onError={handleWebViewError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={styles.webViewLoader}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
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
    padding: 20,
    backgroundColor: '#000',
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
    marginBottom: 15,
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  previewHeader: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});
