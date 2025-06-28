# AI Mind Map Generator

A React-based application that uses AI to convert raw text into interactive, multi-level mind maps with bullet points on all nodes.

## Features

- **AI-Powered Generation**: Uses Groq Cloud's Llama 3 model to analyze text and create structured mind maps
- **Multi-Level Hierarchy**: Automatically creates multiple levels of organization
- **Bullet Points**: Every node contains relevant bullet points extracted from the text
- **Interactive Visualization**: Built with React Flow for smooth interactions
- **Clean UI**: Minimal, modern design with a simple theme
- **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with JavaScript
- **Visualization**: React Flow
- **AI**: Groq Cloud API (Llama 3-8B model)
- **Build Tool**: Vite
- **Styling**: CSS with minimal theme

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mindmap
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Groq API Key**

   Create a `.env` file in the root directory:

   ```bash
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

   Get your API key from [Groq Cloud Console](https://console.groq.com/)

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## Usage

1. **Paste your text** into the text area (lecture notes, meeting minutes, articles, etc.)
2. **Click "Generate Mind Map"** to process with AI
3. **View the interactive mind map** with multiple levels and bullet points
4. **Use React Flow controls** to zoom, pan, and interact with the visualization
5. **Click "Generate New Mind Map"** to start over

## How It Works

1. **Text Analysis**: The AI analyzes your input text to identify main concepts, subtopics, and key details
2. **Structure Generation**: Creates a hierarchical JSON structure with multiple levels
3. **Node Creation**: Converts the structure into React Flow nodes with bullet points
4. **Visualization**: Renders an interactive mind map with proper positioning and connections

## Project Structure

```
src/
├── components/
│   ├── MindMap.jsx          # Main React Flow component
│   ├── MindMapNode.jsx      # Custom node component with bullets
│   └── TextInput.jsx        # Text input and form handling
├── utils/
│   ├── llm.js              # Groq Cloud API integration
│   └── mindMapConverter.js # Convert LLM output to React Flow format
├── App.jsx                 # Main application component
├── main.jsx               # React entry point
└── index.css              # Global styles
```

## API Configuration

The app uses Groq Cloud's Llama 3-8B model with the following configuration:

- **Model**: llama3-8b-8192
- **Temperature**: 0.3 (for consistent, structured output)
- **Max Tokens**: 2000
- **System Prompt**: Optimized for mind map generation

## Development

- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Development server**: `npm run dev`

## Fallback Mode

If no Groq API key is provided, the app will use mock data for demonstration purposes.

## License

MIT License
