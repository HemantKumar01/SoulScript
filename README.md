# PersonaBot_Pegasus

A sophisticated AI-powered platform that combines journaling capabilities with persona management, built with Next.js, Python, and modern web technologies.

## Project Overview

PersonaBot_Pegasus is a multi-component application that provides:
- AI-powered journaling and personal reflection
- Interactive persona management and visualization
- Real-time chat interactions with AI personas
- Safety monitoring and content filtering
- Secure API key management and authentication

## Components

### 1. Journal App
A modern journaling application with rich text editing and personal reflection features.
- Rich text editing
- Personal reflection tools
- Modern UI with dark/light mode
- Responsive design
- MongoDB integration

### 2. Persona Dashboard
An AI-powered dashboard for managing and interacting with different personas.
- AI-powered persona management
- Interactive visualizations
- Real-time updates
- Markdown support
- Stack AI integration

### 3. Interactive Chatbot
A conversational interface for persona interactions.
- Natural language processing
- Context-aware responses
- Multi-persona support
- Gemini AI integration
- Real-time chat capabilities

### 4. NVIDIA Guardrail
Safety and monitoring components for AI interactions.
- AI safety monitoring
- Content filtering
- Usage analytics
- Email notifications
- Rate limiting

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- Various modern React libraries

### Backend
- Python 3.x
- MongoDB
- AI Integration (Gemini, Stack AI)
- AWS Services (optional)

## Prerequisites

- Node.js (Latest LTS version recommended)
- Python 3.x
- MongoDB
- npm or yarn
- Git

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PersonaBot_Pegasus.git
cd PersonaBot_Pegasus
```

2. Set up each component:

### Journal App
```bash
cd journal-app
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```
now head to http://localhost:3002 or https://v0-mongo-db-journal-app.vercel.app/

### Persona Dashboard
```bash
cd PersonaDashboard
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```
now head to http://localhost:3001 for know yourself better chat and http://localhost:3001/dashboard to see user persona dashboard 

### Interactive Chatbot
```bash
cd InteractiveChatbot
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python backend/main.py
```
now head to http://localhost:3000/chat


## Environment Variables

Each component requires its own environment variables. See the respective component's `.env.example` file for details:

- [Persona Dashboard Environment Variables](PersonaDashboard/.env.example)
- [Interactive Chatbot Environment Variables](InteractiveChatbot/.env.example)


## Project Structure

```
PersonaBot_Pegasus/
├── journal-app/          # Main journaling application
├── PersonaDashboard/     # AI-powered persona management dashboard
├── InteractiveChatbot/   # Chat interface for persona interactions
├── NVIDIA_guardrail/     # Safety and monitoring components
└── .gitignore
```

## Security

- All API keys and sensitive credentials are managed through environment variables
- `.env` files are gitignored to prevent accidental commits of sensitive data
- API endpoints are protected with proper authentication
- Rate limiting and content filtering are implemented
- Regular security updates and monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database solutions
- The Next.js team for the amazing framework
- Google for Gemini AI
- Stack AI for inference capabilities
- All contributors and maintainers

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 