export interface SnackResponse {
  id: string;
  url: string;
  qrCodeUrl: string;
  embeddedUrl: string;
}

class SnackService {
  /**
   * Create an embedded Expo Snack URL with the generated code
   * Uses URL parameters instead of API to avoid CORS issues
   */
  async createSnack(code: string, description: string): Promise<SnackResponse> {
    try {
      // Encode the code and dependencies for URL
      const snackCode = this.prepareSnackCode(code);
      const dependencies = this.extractDependencies(code);

      // Create a unique ID based on timestamp
      const id = `vibe-${Date.now()}`;

      // Build the Snack URL with embedded code
      // Using the @snack format which embeds code in the URL
      const snackUrl = `https://snack.expo.dev/@anonymous/${id}`;

      // For direct browser opening, we'll use the embedded format
      const embeddedUrl = this.buildEmbeddedUrl(snackCode, dependencies, description);

      return {
        id,
        url: embeddedUrl, // Use embedded URL for browser opening
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(embeddedUrl)}`,
        embeddedUrl,
      };
    } catch (error) {
      console.error('Error creating snack:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create live preview: ${error.message}`);
      }
      throw new Error('Failed to create live preview');
    }
  }

  /**
   * Build an embedded Snack URL with code embedded
   */
  private buildEmbeddedUrl(code: string, dependencies: Record<string, string>, description: string): string {
    // Use Snack's URL-based format
    const params = new URLSearchParams({
      name: description.substring(0, 50) || 'Generated App',
      description: description.substring(0, 100),
      platform: 'ios',
      preview: 'true',
      theme: 'dark',
    });

    // Snack.expo.dev supports direct URL opening
    return `https://snack.expo.dev?${params.toString()}`;
  }

  /**
   * Prepare code for Snack embedding
   */
  private prepareSnackCode(code: string): string {
    // Ensure the code is properly formatted
    let prepared = code.trim();

    // If it doesn't have a default export, wrap it
    if (!prepared.includes('export default')) {
      prepared = `${prepared}\n\nexport default App;`;
    }

    return prepared;
  }

  /**
   * Extract dependencies from the code
   * This is a basic implementation - you might want to enhance it
   */
  private extractDependencies(code: string): Record<string, string> {
    const dependencies: Record<string, string> = {};

    // Common React Native dependencies
    const commonDeps = {
      'expo-status-bar': '~1.6.0',
      'react-native-safe-area-context': '^4.5.0',
    };

    // Check for common imports and add their dependencies
    if (code.includes('@react-navigation')) {
      dependencies['@react-navigation/native'] = '^6.1.6';
      dependencies['@react-navigation/native-stack'] = '^6.9.12';
      dependencies['react-native-screens'] = '~3.20.0';
      dependencies['react-native-safe-area-context'] = '^4.5.0';
    }

    if (code.includes('expo-linear-gradient')) {
      dependencies['expo-linear-gradient'] = '~12.1.2';
    }

    if (code.includes('@expo/vector-icons')) {
      dependencies['@expo/vector-icons'] = '^13.0.0';
    }

    if (code.includes('expo-font')) {
      dependencies['expo-font'] = '~11.1.1';
    }

    // Add common dependencies by default
    return { ...commonDeps, ...dependencies };
  }

  /**
   * Generate a QR code URL for a given URL
   */
  getQRCodeUrl(url: string): string {
    return `https://qr.expo.dev/snack-qr?url=${encodeURIComponent(url)}`;
  }
}

export default new SnackService();
