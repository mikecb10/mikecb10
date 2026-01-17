export interface SnackResponse {
  id: string;
  url: string;
  qrCodeUrl: string;
  embeddedUrl: string;
}

class SnackService {
  private readonly SNACK_API_URL = 'https://snack.expo.dev/api/v2/snacks';

  /**
   * Create a new Expo Snack with the generated code
   */
  async createSnack(code: string, description: string): Promise<SnackResponse> {
    try {
      // Prepare the snack data
      const snackData = {
        name: description.substring(0, 50) || 'Generated App',
        description: description,
        files: {
          'App.js': {
            type: 'CODE',
            contents: code,
          },
        },
        dependencies: this.extractDependencies(code),
      };

      // Create the snack
      const response = await fetch(this.SNACK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snackData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create snack: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Construct URLs
      const snackId = result.id;
      const url = `https://snack.expo.dev/${snackId}`;
      const qrCodeUrl = `https://qr.expo.dev/snack-qr?url=${encodeURIComponent(url)}`;
      const embeddedUrl = `https://snack.expo.dev/embedded/${snackId}?preview=true&platform=android`;

      return {
        id: snackId,
        url,
        qrCodeUrl,
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
