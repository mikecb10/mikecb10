import Anthropic from '@anthropic-ai/sdk';
import * as SecureStore from 'expo-secure-store';

export interface GenerateAppRequest {
  description: string;
  appType: 'mobile' | 'web';
}

export interface GenerateAppResponse {
  code: string;
  framework: string;
  files: { path: string; content: string }[];
}

class ClaudeService {
  private async getApiKey(): Promise<string> {
    const apiKey = await SecureStore.getItemAsync('claude_api_key');
    if (!apiKey) {
      throw new Error('Claude API key not found. Please configure it in Settings.');
    }
    return apiKey;
  }

  private getSystemPrompt(appType: 'mobile' | 'web'): string {
    if (appType === 'mobile') {
      return `You are an expert React Native developer. Generate complete, production-ready React Native code based on user descriptions.

IMPORTANT INSTRUCTIONS:
1. Generate ONLY the component code - no explanations, no markdown, no code fences
2. Use TypeScript with proper typing
3. Use modern React Native best practices (hooks, functional components)
4. Include all necessary imports
5. Use React Native's built-in components (View, Text, TouchableOpacity, ScrollView, etc.)
6. Add proper styling with StyleSheet
7. Make the UI look modern and polished
8. Handle edge cases and errors gracefully
9. Add loading states where appropriate
10. Use safe area views for proper device compatibility

The code should be ready to copy-paste into an App.tsx file and run immediately.`;
    } else {
      return `You are an expert React/Next.js developer. Generate complete, production-ready web application code based on user descriptions.

IMPORTANT INSTRUCTIONS:
1. Generate ONLY the component code - no explanations, no markdown, no code fences
2. Use TypeScript with proper typing
3. Use modern React best practices (hooks, functional components)
4. Include all necessary imports
5. Use Tailwind CSS for styling (assume it's already configured)
6. Make the UI responsive and mobile-friendly
7. Add proper error handling and loading states
8. Use semantic HTML
9. Ensure accessibility (ARIA labels, keyboard navigation)
10. Follow best practices for performance

The code should be ready to copy-paste and run immediately.`;
    }
  }

  private buildPrompt(description: string, appType: 'mobile' | 'web'): string {
    const framework = appType === 'mobile' ? 'React Native' : 'React with Next.js and Tailwind CSS';

    return `Build a ${framework} app with the following requirements:

${description}

Remember: Output ONLY the code, no explanations or markdown formatting.`;
  }

  async generateApp(request: GenerateAppRequest): Promise<GenerateAppResponse> {
    try {
      const apiKey = await this.getApiKey();

      // Initialize Anthropic client
      const client = new Anthropic({
        apiKey,
      });

      const systemPrompt = this.getSystemPrompt(request.appType);
      const userPrompt = this.buildPrompt(request.description, request.appType);

      // Call Claude API
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929', // Latest Claude model
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract the generated code
      const content = message.content[0];
      let code = '';

      if (content.type === 'text') {
        code = content.text;
      }

      // Clean up the code if Claude wrapped it in markdown code blocks
      code = this.cleanCode(code);

      return {
        code,
        framework: request.appType === 'mobile' ? 'React Native' : 'React + Next.js',
        files: [
          {
            path: request.appType === 'mobile' ? 'App.tsx' : 'page.tsx',
            content: code,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate app: ${error.message}`);
      }
      throw new Error('Failed to generate app: Unknown error');
    }
  }

  private cleanCode(code: string): string {
    // Remove markdown code blocks if present
    let cleaned = code.trim();

    // Remove opening code fence (```typescript, ```tsx, ```jsx, etc.)
    cleaned = cleaned.replace(/^```[\w]*\n/, '');

    // Remove closing code fence
    cleaned = cleaned.replace(/\n```$/, '');

    return cleaned.trim();
  }

  async refineApp(
    originalCode: string,
    refinementRequest: string,
    appType: 'mobile' | 'web'
  ): Promise<string> {
    try {
      const apiKey = await this.getApiKey();

      const client = new Anthropic({
        apiKey,
      });

      const systemPrompt = this.getSystemPrompt(appType);
      const userPrompt = `Here's the current code:

${originalCode}

Please modify it based on this request: ${refinementRequest}

Output ONLY the complete updated code, no explanations.`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      let code = '';

      if (content.type === 'text') {
        code = content.text;
      }

      return this.cleanCode(code);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to refine app: ${error.message}`);
      }
      throw new Error('Failed to refine app: Unknown error');
    }
  }
}

export default new ClaudeService();
