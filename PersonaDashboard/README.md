# PersonaDashboard

A sophisticated AI-powered dashboard for managing and interacting with different personas, built with Next.js and modern web technologies.

## Features

- AI-powered persona management
- Interactive visualizations
- Real-time updates
- Markdown support
- Secure API key management
- MongoDB integration
- AWS service integration (optional)

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Components
- MongoDB
- AI Integration (Gemini, Stack AI)
- AWS Services (optional)

## Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB
- npm or yarn
- Python 3.x (for backend components)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PersonaBot_Pegasus.git
cd PersonaDashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API keys and configuration:
     ```env
     # AI API Keys
     GEMINI_API_KEY=your_gemini_api_key_here
     STACK_AI_API_KEY=your_stack_ai_api_key_here
     STACK_AI_ENDPOINT=your_stack_ai_endpoint_here

     # MongoDB Configuration
     MONGODB_URI=your_mongodb_uri_here

     # Server Configuration
     PORT=3001
     NODE_ENV=development

     # Frontend Configuration
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NEXT_PUBLIC_WS_URL=ws://localhost:3001

     # Optional: AWS Configuration
     AWS_ACCESS_KEY_ID=your_aws_access_key_here
     AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
     AWS_REGION=your_aws_region_here
     ```

## Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

The application will be available at http://localhost:3001

## Project Structure

```
PersonaDashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/          # Chat API endpoints
│   │   ├── dashboard/         # Dashboard components
│   │   └── page.tsx          # Main page
│   ├── components/           # Reusable components
│   └── lib/                  # Utility functions
├── public/                   # Static assets
├── .env.example             # Example environment variables
├── .env                     # Actual environment variables (gitignored)
└── package.json             # Project dependencies
```

## API Integration

The dashboard integrates with several AI services:
- Google Gemini API for content generation
- Stack AI for inference and processing
- MongoDB for data persistence
- Optional AWS services for additional functionality

## Security

- All API keys and sensitive credentials are managed through environment variables
- `.env` file is gitignored to prevent accidental commits of sensitive data
- API endpoints are protected with proper authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database solutions
- The Next.js team for the amazing framework
- All contributors and maintainers
