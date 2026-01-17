# Vibe Code - Free AI App Builder

A free, open-source mobile app that recreates Vibe Code functionality using your Claude Max account. Build native mobile apps and web applications using natural language descriptions powered by Claude AI.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **AI-Powered Generation**: Describe your app idea and let Claude generate production-ready code
- **Multi-Platform Support**: Generate both React Native (mobile) and React/Next.js (web) applications
- **Live Code Preview**: View generated code instantly with syntax highlighting
- **Workspace Management**: Save and manage multiple projects
- **Example Templates**: Pre-built prompts for common app types (fitness, finance, content management, etc.)
- **Secure API Key Storage**: Your Claude API key is stored securely on device using Expo Secure Store
- **Export & Share**: Copy code to clipboard or share with others

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (will be installed automatically)
4. **Claude API Key** from your Anthropic account

## Getting Your Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in with your Anthropic account
3. Navigate to **Settings → API Keys**
4. Click **Create Key**
5. Copy your API key (it starts with `sk-ant-`)
6. Keep it secure - you'll need it to use the app

> **Note**: You need an active Anthropic account with API access. Claude Max subscribers should check the Anthropic console for API access details.

## Installation

1. **Clone the repository**
   ```bash
   cd vibe-code-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### On Your Phone (Recommended for Testing)

1. Install the **Expo Go** app on your phone:
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the dev server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### On iOS Simulator (macOS only)

```bash
npm run ios
```

### On Android Emulator

```bash
npm run android
```

### On Web Browser

```bash
npm run web
```

## First-Time Setup

1. **Launch the app**
2. **Tap the settings icon** (⚙️) in the top right
3. **Enter your Claude API key** from Anthropic Console
4. **Tap "Save API Key"**
5. **Go back to the home screen** and start building!

## How to Use

### Generating an App

1. **Choose your platform**: Toggle between "Mobile app" or "Web app"
2. **Describe your idea**: Enter a detailed description of what you want to build
   - Be specific about features, UI elements, and functionality
   - Example: "A fitness tracker with calorie counting, workout logging, and progress charts"
3. **Tap "Generate App"**: Claude will create production-ready code
4. **View the code**: See your generated app code in the Preview screen
5. **Save to Workspace**: Keep your projects for later reference

### Using Example Templates

Tap on any example prompt to auto-fill the description box with a detailed app template:

- **Fitness Tracker**: Calorie counting, workouts, progress charts
- **To-Do List**: Categories, priorities, due dates
- **Finance App**: Expense tracking, budgets, analytics
- **Content Dashboard**: Analytics, posts, engagement metrics
- **Recipe Finder**: Search, ingredients, cooking instructions
- **Habit Tracker**: Daily habits, streaks, calendar view

### Managing Your Workspace

- **View Projects**: Tap "View My Projects" to see all saved apps
- **Open Project**: Tap any project to view its code
- **Delete Project**: Swipe or tap the trash icon to remove

## Project Structure

```
vibe-code-app/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main app builder interface
│   │   ├── PreviewScreen.tsx       # Code preview and actions
│   │   ├── WorkspaceScreen.tsx     # Project management
│   │   └── SettingsScreen.tsx      # API key configuration
│   ├── services/
│   │   └── claudeService.ts        # Claude API integration
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── App.tsx                         # Root navigation component
└── package.json
```

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - React Native development platform
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **Anthropic SDK** - Claude AI integration
- **Expo Secure Store** - Secure API key storage
- **AsyncStorage** - Local project persistence

## Customization

### Modify Generation Prompts

Edit the system prompts in `src/services/claudeService.ts` to customize how Claude generates code:

```typescript
private getSystemPrompt(appType: 'mobile' | 'web'): string {
  // Customize the prompt here
}
```

### Add New Templates

Add more example prompts in `src/screens/HomeScreen.tsx`:

```typescript
const examplePrompts = [
  'Your custom prompt here...',
];
```

### Change UI Theme

Modify the styles in any screen file to customize colors, fonts, and layout:

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000', // Change this
  },
});
```

## API Usage & Costs

- This app uses the Claude API (pay-per-use)
- Each generation costs based on Claude's pricing tiers
- Monitor your usage at [console.anthropic.com](https://console.anthropic.com)
- Typical app generation: 2,000-4,000 tokens (~$0.06-$0.12 per generation with Claude Sonnet)

## Troubleshooting

### "API key not found" error
- Go to Settings and enter your Claude API key
- Make sure the key starts with `sk-ant-`

### "Failed to generate app" error
- Check your internet connection
- Verify your API key is valid
- Check the Anthropic Console for API status
- Make sure you have API credits available

### App won't start
```bash
# Clear cache and restart
npm start -- --clear
```

### TypeScript errors
```bash
# Check for errors
npx tsc --noEmit
```

## Building for Production

### Create a Standalone Build

1. **Configure app.json** with your app details
2. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```
3. **Build for Android**:
   ```bash
   eas build --platform android
   ```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for detailed instructions.

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Privacy & Security

- **Your API key never leaves your device** - it's stored securely using Expo Secure Store
- **Generated code is stored locally** on your device
- **No analytics or tracking** - this is 100% private
- **No backend servers** - all generation happens via direct API calls to Anthropic

## License

MIT License - feel free to use this for personal or commercial projects!

## Acknowledgments

- Inspired by [Vibe Code](https://www.vibecodeapp.com)
- Powered by [Anthropic Claude](https://www.anthropic.com)
- Built with [Expo](https://expo.dev)

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/vibe-code-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vibe-code-app/discussions)
- **Anthropic Support**: [support.anthropic.com](https://support.anthropic.com)

## Roadmap

- [ ] Code preview/live rendering
- [ ] Multi-file project generation
- [ ] Custom template creation
- [ ] Code refinement with follow-up prompts
- [ ] Export to GitHub repository
- [ ] Team collaboration features
- [ ] Built-in code editor

---

**Made with ❤️ for the AI builder community**

Start building amazing apps with AI today! 🚀
