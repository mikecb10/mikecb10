import Anthropic from '@anthropic-ai/sdk';
import storageService from './storageService';

export interface GenerateAppRequest {
  description: string;
  appType: 'mobile' | 'web';
  includeAI?: boolean;
}

export interface GenerateAppResponse {
  code: string;
  framework: string;
  files: { path: string; content: string }[];
}

export interface CodeValidationResult {
  isComplete: boolean;
  issues: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Validates if generated code is complete and not truncated
 * Exported for use in other modules
 */
export function validateGeneratedCode(code: string): CodeValidationResult {
  const issues: string[] = [];

  // Check for balanced braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }

  // Check for balanced square brackets
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
  }

  // Check for unterminated strings (common truncation symptom)
  const lines = code.split('\n');
  const lastLine = lines[lines.length - 1]?.trim() || '';

  // Check if code ends mid-string (truncation symptom)
  const hasUnterminatedString = /['"`][^'"`]*$/.test(lastLine) && !lastLine.endsWith(';');
  if (hasUnterminatedString) {
    issues.push('Code appears to end with unterminated string');
  }

  // Check if ends properly (should end with }, ;, or )
  const trimmedCode = code.trim();
  const endsWithSemicolonOrBrace = /[;\}\)]\s*$/.test(trimmedCode);
  if (!endsWithSemicolonOrBrace && trimmedCode.length > 0) {
    issues.push('Code does not end with proper syntax');
  }

  // Check for incomplete StyleSheet or export (common in React Native)
  if (code.includes('StyleSheet.create') && !code.includes('});')) {
    issues.push('StyleSheet appears incomplete');
  }

  if (code.includes('export default') && !trimmedCode.endsWith(';') && !trimmedCode.endsWith('}')) {
    issues.push('Export statement appears incomplete');
  }

  // Calculate confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (issues.length === 0) {
    confidence = 'high';
  } else if (issues.length <= 2) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    isComplete: issues.length === 0,
    issues,
    confidence,
  };
}

class ClaudeService {
  private async getApiKey(): Promise<string> {
    console.log('🔐 getApiKey: Fetching API key from storage...');
    const apiKey = await storageService.getItem('claude_api_key');
    console.log('🔐 getApiKey: Retrieved value:', apiKey ? `${apiKey.substring(0, 15)}... (length: ${apiKey.length})` : 'NULL');

    if (!apiKey) {
      console.log('❌ getApiKey: API key not found in storage');
      throw new Error('Claude API key not found. Please configure it in Settings.');
    }

    console.log('✅ getApiKey: API key found and valid');
    return apiKey;
  }

  private getSystemPrompt(appType: 'mobile' | 'web', includeAI: boolean = false): string {
    if (appType === 'mobile') {
      const baseInstructions = `You are an expert React Native developer. Generate complete, production-ready React Native code based on user descriptions.

CRITICAL CODE SIZE AND QUALITY REQUIREMENTS:
1. Keep code UNDER 500 LINES - this is essential for completeness
2. Generate MINIMAL, FOCUSED apps with only essential features
3. Use simple, clean code - avoid over-engineering
4. Limit mock data to 3-5 items maximum
5. Use inline styles for simple elements instead of large StyleSheet objects
6. Avoid complex nested components - keep it flat and simple
7. Prioritize WORKING, COMPLETE code over feature richness
8. If the app idea is complex, implement only the core 2-3 features

CRITICAL EXPO SNACK COMPATIBILITY REQUIREMENTS:
1. Generate ONLY plain JavaScript code - NO TypeScript
2. DO NOT use type annotations like useState<Type[]> - just use useState([])
3. DO NOT use TypeScript interfaces or types
4. DO NOT use .tsx syntax - use .js conventions only
5. Use "export default function App()" format
6. Keep all code in a single file that works as App.js in Expo Snack

IMPORTANT INSTRUCTIONS:
1. Generate ONLY the component code - no explanations, no markdown, no code fences
2. Use modern React Native best practices (hooks, functional components)
3. Include all necessary imports at the top
4. Use React Native's built-in components (View, Text, TouchableOpacity, ScrollView, etc.)
5. Add proper styling with StyleSheet
6. Make the UI look modern and polished
7. Handle edge cases and errors gracefully
8. Add loading states where appropriate
9. Use safe area views for proper device compatibility

REMEMBER: Code must be complete and under 500 lines. Simple and working is better than complex and truncated.

The code should be ready to copy-paste into App.js in Expo Snack and run immediately.`;

      if (includeAI) {
        return baseInstructions + `

AI INTEGRATION REQUIREMENTS:
1. Include Claude API integration using @anthropic-ai/sdk
2. Add a Settings screen/section where users can enter their Claude API key
3. Store the API key securely using AsyncStorage (from @react-native-async-storage/async-storage)
4. Replace mock/static data with AI-powered features:
   - AI search and filtering
   - AI recommendations
   - AI-generated content
   - Intelligent responses to user queries
5. Add helpful code comments explaining how the AI integration works
6. Include error handling for API calls
7. Show loading states during AI operations
8. Add a warning message that users need their own Claude API key
9. Make the API key optional - app should still work with limited features if no key provided

Example AI features to include based on app type:
- Recipe apps: AI-powered recipe search, ingredient suggestions, meal planning
- Todo apps: AI task categorization, priority suggestions, smart reminders
- Fitness apps: AI workout recommendations, form tips, progress insights
- Note apps: AI summaries, auto-categorization, smart search

IMPORTANT: Add clear instructions in comments about obtaining a Claude API key from console.anthropic.com`;
      }

      return baseInstructions;
    } else {
      const baseInstructions = `You are an expert React/Next.js developer. Generate complete, production-ready web application code based on user descriptions.

CRITICAL CODE SIZE AND QUALITY REQUIREMENTS:
1. Keep code UNDER 500 LINES - this is essential for completeness
2. Generate MINIMAL, FOCUSED apps with only essential features
3. Use simple, clean code - avoid over-engineering
4. Limit mock data to 3-5 items maximum
5. Use Tailwind utility classes instead of complex custom CSS
6. Avoid complex nested components - keep it flat and simple
7. Prioritize WORKING, COMPLETE code over feature richness
8. If the app idea is complex, implement only the core 2-3 features

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

REMEMBER: Code must be complete and under 500 lines. Simple and working is better than complex and truncated.

The code should be ready to copy-paste and run immediately.`;

      if (includeAI) {
        return baseInstructions + `

AI INTEGRATION REQUIREMENTS:
1. Include Claude API integration using @anthropic-ai/sdk
2. Add a Settings panel/modal where users can enter their Claude API key
3. Store the API key in localStorage
4. Replace mock/static data with AI-powered features:
   - AI search and filtering
   - AI recommendations
   - AI-generated content
   - Intelligent responses to user queries
5. Add helpful code comments explaining how the AI integration works
6. Include error handling for API calls
7. Show loading states during AI operations
8. Add a warning message that users need their own Claude API key
9. Make the API key optional - app should still work with limited features if no key provided

IMPORTANT: Add clear instructions in comments about obtaining a Claude API key from console.anthropic.com`;
      }

      return baseInstructions;
    }
  }

  private buildPrompt(description: string, appType: 'mobile' | 'web'): string {
    const framework = appType === 'mobile' ? 'React Native' : 'React with Next.js and Tailwind CSS';

    return `Build a ${framework} app with the following requirements:

${description}

Remember: Output ONLY the code, no explanations or markdown formatting.`;
  }

  async generateApp(request: GenerateAppRequest): Promise<GenerateAppResponse> {
    console.log('📡 claudeService.generateApp called');
    console.log('📊 Request:', { appType: request.appType, descriptionLength: request.description.length });

    try {
      console.log('🔑 Loading API key...');
      const apiKey = await this.getApiKey();
      console.log('✅ API key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

      if (!apiKey) {
        console.log('❌ API key is null or empty');
        throw new Error('API key is missing');
      }

      console.log('🔧 Initializing Anthropic client...');
      // Initialize Anthropic client
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      console.log('✅ Anthropic client initialized');

      const systemPrompt = this.getSystemPrompt(request.appType, request.includeAI || false);
      const userPrompt = this.buildPrompt(request.description, request.appType);
      console.log('📝 Prompts prepared - System:', systemPrompt.length, 'chars, User:', userPrompt.length, 'chars');
      console.log('🤖 AI Integration:', request.includeAI ? 'ENABLED' : 'DISABLED');

      console.log('🌐 Calling Claude API...');
      console.log('🔢 Model: claude-sonnet-4-5-20250929');

      // Call Claude API
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929', // Latest Claude model
        max_tokens: 16000, // Increased to reduce truncation
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      console.log('✅ API response received');
      console.log('📦 Response ID:', message.id);
      console.log('📊 Content blocks:', message.content.length);

      // Extract the generated code
      const content = message.content[0];
      console.log('📄 Content type:', content.type);

      let code = '';

      if (content.type === 'text') {
        code = content.text;
        console.log('📝 Raw code length:', code.length);
      } else {
        console.log('⚠️ Content type is not text:', content.type);
      }

      // Clean up the code if Claude wrapped it in markdown code blocks
      code = this.cleanCode(code);
      console.log('✨ Cleaned code length:', code.length);

      const result = {
        code,
        framework: request.appType === 'mobile' ? 'React Native' : 'React + Next.js',
        files: [
          {
            path: request.appType === 'mobile' ? 'App.tsx' : 'page.tsx',
            content: code,
          },
        ],
      };

      console.log('✅ generateApp completed successfully');
      return result;
    } catch (error) {
      console.log('❌ Error in generateApp:', error);
      console.error('❌ Full error details:', error);

      if (error instanceof Error) {
        console.log('❌ Error name:', error.name);
        console.log('❌ Error message:', error.message);
        console.log('❌ Error stack:', error.stack);
        throw new Error(`Failed to generate app: ${error.message}`);
      }
      throw new Error('Failed to generate app: Unknown error');
    }
  }

  /**
   * Generate app with streaming support
   * Calls the onChunk callback with each piece of code as it's generated
   */
  async generateAppStreaming(
    request: GenerateAppRequest,
    onChunk: (chunk: string) => void,
    onComplete: (code: string, validation: CodeValidationResult) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    console.log('📡 claudeService.generateAppStreaming called');

    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const systemPrompt = this.getSystemPrompt(request.appType, request.includeAI || false);
      const userPrompt = this.buildPrompt(request.description, request.appType);

      console.log('🌊 Starting streaming API call...');
      console.log('🤖 AI Integration:', request.includeAI ? 'ENABLED' : 'DISABLED');

      // Use the streaming API
      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000, // Increased to reduce truncation
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      let fullCode = '';

      // Process the stream
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const chunk = event.delta.text;
          fullCode += chunk;
          onChunk(chunk);
        }
      }

      // Clean up the final code
      const cleanedCode = this.cleanCode(fullCode);
      console.log('✅ Streaming completed. Total code length:', cleanedCode.length);
      console.log('📏 Code lines:', cleanedCode.split('\n').length);

      // Validate the generated code
      const validation = validateGeneratedCode(cleanedCode);
      console.log('🔍 Code validation:', validation);

      if (!validation.isComplete) {
        console.warn('⚠️ Code validation detected issues:', validation.issues);
      }

      onComplete(cleanedCode, validation);
    } catch (error) {
      console.error('❌ Error in streaming:', error);
      const err = error instanceof Error ? error : new Error('Streaming failed');
      onError(err);
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
        dangerouslyAllowBrowser: true,
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
