# Voice Recognizer Sandbox

A real-time voice recognition application that combines a React-based frontend with a Kotlin-powered backend, utilizing
WebSocket connections for streaming audio data and AI-powered speech recognition.

## Features

- Real-time voice recording and streaming
- WebSocket-based communication
- AI-powered speech recognition using Google Gemini AI
- Live transcription display
- Connection status indicators

## Tech Stack

### Frontend

- React 19.0.0
- Next.js 15.1.7
- Material-UI (MUI) 6.4.5
- TypeScript
- WebSocket API for real-time communication
- Media Recorder API for audio capture

### Backend

- Kotlin
- Ktor (Web framework)
- LangChain4j for AI integration
- Google Gemini AI for speech recognition
- WebSocket for bi-directional communication

## Prerequisites

- Node.js and yarn
- JDK 21
- Google Gemini API key

## Setup

1. Clone the repository

2. Backend Setup
   ```bash
   # Configure your Gemini API key in the application configuration
   geminiApiKey=your_api_key_here
   ```

3. Frontend Setup
   ```bash
   yarn install
   ```

## Running the Application

1. Start the Backend Server

- The server will run on `http://127.0.0.1:8080`

2. Start the Frontend Development Server
   ```bash
   yarn run dev
   ```

- The frontend will be available at `http://localhost:3000`

## How it Works

1. **Audio Recording**: The application uses the browser's MediaRecorder API to capture audio input from the user's
   microphone.

2. **Real-time Streaming**: Audio data is streamed to the backend server in WAV format through WebSocket connections.

3. **Speech Recognition**: The backend processes the audio using Google Gemini AI for speech recognition.

4. **Live Updates**: Transcribed text is sent back to the frontend and displayed in real-time.

## WebSocket Endpoints

- `/input` - Receives audio data streams
- `/messages` - Handles transcribed text communication

## Features

- Real-time audio streaming with minimal latency
- Visual connection status indicators
- WAV format audio processing
- Robust error handling and connection management
- Clean and intuitive user interface
