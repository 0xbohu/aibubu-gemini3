# AiBubu - Interactive Language Learning Platform 🌍

AiBubu is an AI-powered educational platform that makes learning languages and core subjects fun and engaging for kids. Through interactive lessons, voice-enabled AI tutors, and gamified progression, children embark on a personalized learning journey adapted to their level and pace.

🚀 **[Try the Live Demo](https://aibubu-gemini3.vercel.app)** 🚀


 **[Video Demo](https://youtu.be/hOmouxbyCdY)** 

## 🔌 Integrations

AiBubu leverages cutting-edge AI and cloud services to deliver a powerful learning experience:

- **Google Gemini 3 Models**: AI-powered assessment and review system for intelligent content generation and answer validation, leveraging long context, deep thinking and multimedia inputs capabilities of Gemini 3 models
- **ElevenLabs Integration**: High-quality text-to-speech with both standard and custom voice models for natural-sounding AI tutors
- **Vercel AI SDK**: Seamless streaming responses and AI integration for real-time interactive experiences
- **Supabase**: Complete backend solution with PostgreSQL database and secure authentication system

## ✨ Features

### � Multi-eLanguage Learning

- **Multiple Languages**: Learn English, Spanish, Chinese, and more
- **CEFR-Aligned Levels**: From A1 (Beginner) to C2 (Proficient)
- **Adaptive Difficulty**: Content adjusts to your proficiency level
- **Speaking Practice**: Voice-enabled pronunciation exercises
- **Interactive Lessons**: Reading, writing, listening, and speaking activities

### 🎓 Core Subject Learning

- **Language Learning**: Multi-language support with speaking, reading, and writing practice
- **Mathematics**: From basic counting to advanced concepts
- **Reading Comprehension**: Stories and passages with questions
- **Writing Skills**: Creative writing and structured exercises
- **Logical Thinking**: Logic puzzles and pattern recognition
- **Science**: Interactive science lessons and experiments

### 🗣️ AI Voice Tutors

- **Multiple Voice Options**: Choose from various AI voices (male/female, different accents)
- **Text-to-Speech**: Hear lessons read aloud
- **Pronunciation Feedback**: AI-powered speech assessment
- **Conversational Practice**: Interactive dialogue with AI tutors
- **Custom Voice Settings**: Personalize your learning experience

### 🎮 Gamified Learning Journey

- **Visual Learning Path**: Step-by-step progression through tutorials
- **XP Points System**: Earn points for completing lessons
- **Level Progression**: Advance through difficulty levels
- **Achievement Badges**: Unlock rewards for milestones
- **Progress Tracking**: Visual indicators showing your journey
- **Animated Characters**: Fun mascots guide you along the way

### 📚 Personalized Learning Experience

- **Adaptive Content**: AI generates lessons tailored to your level
- **Progress-Based Filtering**: See only tutorials appropriate for your skill level
- **Language Assessment**: Initial placement tests determine your starting point
- **Custom Learning Paths**: Different tracks for different subjects
- **Age-Appropriate Content**: Lessons designed for specific age ranges (5-12 years)

### 🏆 Comprehensive Achievement System

- **Multiple Badge Types**: Earn achievements for various accomplishments
- **Progress Milestones**: Celebrate completing sections and levels
- **Social Features**: View achievements of other learners
- **Motivational Rewards**: Unlock special content and features
- **Leaderboards**: Track your progress against peers

### �‍🏫 Teatcher Mode

- **Custom Tutorial Creation**: Teachers can create personalized learning content
- **AI-Assisted Content Generation**: Use AI to help design lessons and questions
- **Custom Voice Recording**: Record your own voice for tutorials using ElevenLabs voice cloning
- **Tutorial Management**: Edit, publish, and manage your created content
- **Multi-Category Support**: Create tutorials for any subject (language, math, science, etc.)
- **Flexible Pricing**: Set tutorials as free or paid content

### 🛒 Tutorial Marketplace

- **Browse Custom Content**: Discover tutorials created by teachers and educators
- **Subscription Model**: Access premium content through subscriptions
- **Free & Paid Options**: Mix of free community content and premium tutorials
- **Category Filtering**: Find content by subject, difficulty, and age range
- **Creator Profiles**: Follow your favorite educators
- **Quality Ratings**: Community-driven content reviews

### 🔒 Security & Privacy

- **Row Level Security**: Database-level access control
- **User Data Protection**: Private progress and profiles
- **Secure Authentication**: Email-based registration with password
- **Parental Controls**: Safe, monitored learning environment
- **Content Moderation**: All content reviewed and age-appropriate

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with email confirmation
- **AI Integration**: 
  - Google Gemini 3 content generation
  - AI SDK for streaming responses
- **Voice Services**: ElevenLabs for text-to-speech
- **Icons**: Lucide React
- **Styling**: Custom kid-friendly UI components

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Google AI API key (for content generation)
- ElevenLabs API key (optional, for voice features)

### 1. Clone the Repository

```bash
git clone https://github.com/0xbohu/aibubu-gemini3.git
cd aibubu-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# ElevenLabs Voice API (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**📋 Need help getting your Google AI API key?** Check out the [Google AI Setup Guide](./GOOGLE_AI_SETUP.md)

### 4. Set up Supabase Database

1. Create a new Supabase project
2. **Option A (Recommended)**: Run the SQL commands in `database_setup_simple.sql` in your Supabase SQL editor
3. **Option B**: Use `database_setup.sql` if you need full admin policies (see [ADMIN_SETUP.md](./ADMIN_SETUP.md) if you get permission errors)
4. This will create all necessary tables, sample data, and **Row Level Security policies**

**🔒 Security Note**: The database includes comprehensive RLS policies for data protection. See [SECURITY.md](./SECURITY.md) for details.

**⚠️ Getting permission errors?** Use `database_setup_simple.sql` and follow the [Admin Setup Guide](./ADMIN_SETUP.md)

### 5. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3007](http://localhost:3007) to see the app (configured to run on port 3007).

## 📋 Database Schema

### Core Tables

- **players**: User profiles, XP points, levels, preferences, language proficiency
- **tutorials**: Learning content with interactive screens and questions
- **player_progress**: Individual progress tracking per tutorial
- **achievements**: Available badges and rewards
- **player_achievements**: Earned achievements
- **speaking_languages**: Supported languages with CEFR levels
- **generated_tutorials**: AI-personalized tutorial content
- **tutorial_responses**: Player answers with AI validation

### Sample Data Included

- 20+ tutorials across multiple subjects (language learning, maths, reading, writing, science, logical thinking)
- Difficulty levels from 1-6 (New to Master)
- Age-appropriate content (5-12 years)
- Multiple language support for speaking tutorials
- Custom tutorials created by teachers in the marketplace

## 🎯 Key Features in Detail

### Interactive Tutorial System

Each tutorial includes:

- **Content Screens**: Step-by-step explanations with images and examples
- **Interactive Questions**: Multiple choice, input, and text area responses
- **AI Validation**: Intelligent assessment of answers
- **Immediate Feedback**: Real-time scoring and explanations
- **Progress Tracking**: Visual indicators of completion
- **Points Rewards**: XP earned for correct answers

### Visual Learning Journey

- **Vertical Path Layout**: Tutorials displayed as a journey map
- **Animated Mascots**: Fun characters (owl, frog, butterfly) guide progress
- **Section Markers**: Clear difficulty level indicators
- **Curved Progression**: Alternating left/right layout for visual interest
- **Milestone Celebrations**: Special animations at key points
- **Completion Badges**: Crown icons for finished tutorials

### Language Learning Features

- **Language Selection**: Choose from multiple supported languages
- **Level Assessment**: Initial tests to determine proficiency
- **CEFR Alignment**: Standard European framework (A1-C2)
- **Custom Levels**: Non-CEFR languages use custom progression
- **Speaking Practice**: Voice-enabled pronunciation exercises
- **Listening Comprehension**: Audio-based questions
- **Reading & Writing**: Text-based exercises

### Voice & Audio Features

- **Voice Selection**: Choose from multiple AI voices during onboarding
- **Text-to-Speech**: Lessons read aloud by AI tutors
- **Voice Settings**: Adjust voice preferences anytime
- **Pronunciation Practice**: Record and get feedback
- **Audio Questions**: Listen and respond exercises

### Adaptive Learning

- **Level-Based Filtering**: Only show appropriate difficulty tutorials
- **AI Content Generation**: Personalized lessons based on performance
- **Dynamic Difficulty**: Adjust based on success rate
- **Custom Learning Paths**: Different tracks for different subjects
- **Progress-Based Unlocking**: Complete prerequisites to advance

### User Experience

- **Mobile Responsive**: Optimized for all devices
- **Kid-Friendly UI**: Large buttons, bright colors, simple navigation
- **Visual Feedback**: Animations, transitions, and celebrations
- **Error Handling**: Graceful failures with helpful messages
- **Accessibility**: Screen reader support and keyboard navigation

## 🚀 Getting Started

### For Learners

1. **Sign Up**: Create an account with email and password
2. **Email Confirmation**: Click the link in your confirmation email
3. **Onboarding**: 
   - Choose a fun nickname
   - Select your AI tutor voice
4. **Set Your Level**: Take a quick assessment or choose your starting level
5. **Start Learning**: Begin your journey with the first tutorial
6. **Complete Lessons**: Answer questions and earn XP points
7. **Track Progress**: Watch your level increase and unlock achievements
8. **Explore Subjects**: Try different categories (language learning, math, reading, science, logical thinking, writing)
9. **Browse Marketplace**: Discover custom tutorials created by teachers

### For Teachers

1. **Enable Teacher Mode**: Access the teacher dashboard from your profile
2. **Record Custom Voice**: Clone your voice using ElevenLabs for personalized tutorials
3. **Create Tutorials**: 
   - Choose a category (language, math, science, etc.)
   - Use AI assistance to generate content and questions
   - Add your custom voice narration
4. **Publish Content**: Make tutorials free or set subscription pricing
5. **Manage Library**: Edit and update your published tutorials
6. **Track Engagement**: See how students interact with your content

### Learning Flow

```
Registration → Email Confirm → Onboarding → Level Assessment → Tutorial Selection → Learning Journey
     ↓              ↓              ↓               ↓                    ↓                  ↓
  Account      Activate      Set Voice      Choose Level        Pick Subject      Earn XP & Badges
```

### Tutorial Experience

1. **Select a Tutorial**: Choose from your personalized learning path
2. **Read Content**: Go through interactive screens with explanations
3. **Answer Questions**: Multiple choice, text input, or voice responses
4. **Get Feedback**: Immediate AI validation and scoring
5. **Earn Points**: Collect XP for correct answers
6. **Complete & Celebrate**: Unlock achievements and advance to next lesson

## 📝 Project Structure

```
src/
├── app/                          # Next.js app router pages
│   ├── api/                     # API routes
│   │   ├── chat/               # AI chat endpoint
│   │   ├── generate-tutorial/  # AI content generation
│   │   ├── validate-answer/    # Answer validation
│   │   ├── speak/              # Text-to-speech
│   │   ├── teacher/            # Teacher mode APIs
│   │   │   └── generate-content/ # AI-assisted content creation
│   │   └── tutorial/           # Tutorial management
│   ├── auth/                    # Authentication pages
│   │   ├── callback/           # OAuth callback
│   │   └── confirm/            # Email confirmation
│   ├── dashboard/               # Main dashboard
│   ├── tutorials/               # Tutorial listing
│   ├── tutorial/                # Tutorial player
│   │   ├── [id]/              # Standard tutorials
│   │   └── generated/[id]/    # AI-generated tutorials
│   ├── custom-tutorials/        # Teacher-created tutorials
│   │   └── [id]/              # Custom tutorial player
│   ├── marketplace/             # Tutorial marketplace
│   ├── teacher/                 # Teacher mode
│   │   ├── dashboard/         # Teacher dashboard
│   │   ├── create/            # Create new tutorial
│   │   └── edit/[id]/         # Edit existing tutorial
│   ├── assessment/              # Language level tests
│   ├── my-levels/               # Level management
│   ├── achievements/            # Achievements page
│   ├── onboarding/              # New user setup
│   ├── signup/                  # Registration
│   ├── login/                   # Authentication
│   └── voice-settings/          # Voice preferences
├── components/                   # Reusable components
│   ├── AppHeader.tsx            # Unified header
│   ├── VoiceSelector.tsx        # Voice selection
│   ├── VoiceRecorder.tsx        # Voice recording for teachers
│   ├── UserDropdown.tsx         # User menu
│   └── ...                      # Other components
├── lib/                         # Utilities and configurations
│   ├── supabase.ts             # Database client
│   ├── voice-utils.ts          # Voice handling
│   └── level-utils.ts          # Level calculations
├── types/                       # TypeScript definitions
│   ├── database.ts             # Supabase types
│   └── agents.ts               # Agent types
└── data/                        # Static data
    └── mock-voices.ts          # Voice options
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎨 UI/UX Highlights

- **Kid-Friendly Design**: Large buttons, bright colors, playful animations
- **Visual Learning Path**: Journey-style progression with animated characters
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with keyboard navigation
- **Smooth Animations**: Engaging transitions and celebrations
- **Clear Feedback**: Visual indicators for success, errors, and progress

## 🗺️ Roadmap

- [x] Teacher mode with custom tutorial creation
- [x] Custom voice recording and cloning
- [x] Tutorial marketplace with subscriptions
- [x] Multi-category support (language, math, science, logical thinking, writing, reading)
- [ ] More language support (French, German, Japanese, etc.)
- [ ] Advanced speech recognition for pronunciation
- [ ] Multiplayer learning challenges
- [ ] Parent dashboard for progress monitoring
- [ ] Revenue sharing for content creators
- [ ] Offline mode for learning on the go
- [ ] Mobile apps (iOS/Android)
- [ ] Integration with school curricula
- [ ] Advanced analytics for teachers

## 🙏 Acknowledgments

- Inspired by Duolingo's gamification approach
- Built with amazing open-source tools
- Designed for the next generation of global learners
- Powered by cutting-edge AI technology

---

**Happy Learning! 🎉** Let's inspire the next generation of multilingual, curious minds!
