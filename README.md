# AI Study Explainer

An intelligent study assistant that takes complex educational texts and paragraphs and breaks them down into easily digestible, structured formats using the cutting-edge Groq AI API (`llama-3.1-8b-instant`).

## Features
- **Instant Simplification:** Summarize long, convoluted text into a single short paragraph.
- **Key Takeaways:** Extracts the top 3 core facts from the text.
- **Example Generation:** Uses a real-world or intuitive analogy to make concepts "click".
- **Responsive UI:** Clean, modern interface designed with Tailwind CSS, including a beautiful dark mode. 

## Tech Stack
- **Frontend**: HTML5, Vanilla JS, Tailwind CSS via CDN.
- **AI Model**: `llama-3.1-8b-instant` through Groq.
- **Icons**: Google Material Symbols.

## Setup Instructions

1. Clone or download this repository.
2. Open the directory on your computer.
3. You will need a Groq API Key to enable the AI features. Check out the guide: [HOW_TO_GET_API_KEY.md](./HOW_TO_GET_API_KEY.md).
4. Launch `index.html` in any modern web browser. 
5. The first time you attempt to explain a paragraph, the app will prompt you to enter your Groq API key securely in your browser!

### Running Locally
No server setup is required. The UI and API consumption logic are handled entirely by client-side browser Javascript. You can literally double-click the `index.html` file to start using it immediately!
