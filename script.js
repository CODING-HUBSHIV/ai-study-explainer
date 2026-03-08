// Configuration for Groq API
let GROQ_API_KEY = localStorage.getItem("GROQ_API_KEY") || "";
const MODEL = "llama-3.1-8b-instant";

// Strict system prompt to keep explanations short and match UI box lengths
const SYSTEM_PROMPT = `You are a helpful study assistant. 
Your task is to explain complex topics simply. 
STRICT REQUIREMENT: Explain in short to match our UI box lengths. 
Return ONLY a valid JSON object matching this exact structure:
{
  "title": "Topic title in 1 to 4 words",
  "explanation": "1 short paragraph of simple explanation",
  "points": [
    "1 short sentence for point 1",
    "1 short sentence for point 2",
    "1 short sentence for point 3"
  ],
  "example": "1 short paragraph example"
}`;

document.addEventListener('DOMContentLoaded', () => {
    const inputView = document.getElementById('input-view');
    const resultsView = document.getElementById('results-view');

    const studyText = document.getElementById('study-text');
    const charCount = document.getElementById('char-count');
    const explainBtn = document.getElementById('explain-btn');
    const explainIcon = document.getElementById('explain-icon');
    const explainText = document.getElementById('explain-text');

    const copyBtn = document.getElementById('copy-btn');
    const copyIcon = document.getElementById('copy-icon');
    const copyText = document.getElementById('copy-text');
    const newBtn = document.getElementById('new-btn');
    const fillExampleBtn = document.getElementById('fill-example-btn');

    // UI Elements for Results
    const topicTitleDOM = document.getElementById('topic-title');
    const simpleExplanationDOM = document.getElementById('explanation-text');
    const point1DOM = document.getElementById('point-1');
    const point2DOM = document.getElementById('point-2');
    const point3DOM = document.getElementById('point-3');
    const exampleDOM = document.getElementById('example-text');
    const hardcodeExample = "Quantum entanglement is a physical phenomenon that occurs when a group of particles is generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance.";

    // Textarea input monitoring
    studyText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        if (length > 5000) {
            e.target.value = e.target.value.substring(0, 5000);
        }
        charCount.textContent = `${e.target.value.length.toLocaleString()} / 5,000 characters`;
    });

    // Fill Example
    fillExampleBtn.addEventListener('click', () => {
        studyText.value = hardcodeExample;
        studyText.dispatchEvent(new Event('input'));
    });

    // Explain Button - Integrated with Groq API
    explainBtn.addEventListener('click', async () => {
        const textToExplain = studyText.value.trim();
        if (!textToExplain) {
            alert('Please paste some text to explain first!');
            return;
        }

        // Handle missing API Key
        if (!GROQ_API_KEY) {
            const userInput = prompt("Please enter your Groq API Key (starts with gsk_).\nYou can get one for free at console.groq.com.\n\nCheck the HOW_TO_GET_API_KEY.md file for instructions.");
            if (userInput && userInput.trim() !== '') {
                GROQ_API_KEY = userInput.trim();
                localStorage.setItem("GROQ_API_KEY", GROQ_API_KEY);
            } else {
                alert("An API key is strictly required to explain the text. Request cancelled.");
                return; // halt execution
            }
        }

        // Processing State
        explainBtn.disabled = true;
        explainIcon.textContent = 'hourglass_top';
        explainIcon.classList.add('animate-[spin_2s_linear_infinite]');
        explainText.textContent = 'Thinking...';

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: `Explain this:\n\n${textToExplain}` }
                    ],
                    temperature: 0.7,
                    max_tokens: 512,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // If unauthorized or invalid API key, clear it from local storage so they get prompted again
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("GROQ_API_KEY");
                    GROQ_API_KEY = "";
                    throw new Error("Invalid or expired API Key. Key has been cleared.");
                }

                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const resultData = JSON.parse(data.choices[0].message.content);

            // Update the DOM elements with the new data
            topicTitleDOM.innerText = resultData.title || "Explanation";
            simpleExplanationDOM.innerText = resultData.explanation || "No explanation provided.";

            if (resultData.points && resultData.points.length >= 3) {
                point1DOM.innerText = resultData.points[0];
                point2DOM.innerText = resultData.points[1];
                point3DOM.innerText = resultData.points[2];
            }

            exampleDOM.innerText = resultData.example || "No example provided.";

            // Switch Views
            inputView.classList.add('hidden-view');
            resultsView.classList.remove('hidden-view');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Error generating explanation:", error);
            alert("Failed to generate explanation. Check console for details.");
        } finally {
            // Reset Button State
            explainBtn.disabled = false;
            explainIcon.textContent = 'auto_fix_high';
            explainIcon.classList.remove('animate-[spin_2s_linear_infinite]');
            explainText.textContent = 'Explain Now';
        }
    });

    // New Explanation
    newBtn.addEventListener('click', () => {
        studyText.value = '';
        studyText.dispatchEvent(new Event('input'));

        resultsView.classList.add('hidden-view');
        inputView.classList.remove('hidden-view');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Copy Text
    copyBtn.addEventListener('click', () => {
        const textToCopy = document.getElementById('explanation-text').innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyText.textContent;
            const originalIcon = copyIcon.textContent;

            copyText.textContent = 'Copied!';
            copyIcon.textContent = 'check';

            setTimeout(() => {
                copyText.textContent = originalText;
                copyIcon.textContent = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback visual feedback if clipboard fails
            const originalText = copyText.textContent;
            copyText.textContent = 'Failed to Copy';
            setTimeout(() => {
                copyText.textContent = originalText;
            }, 2000);
        });
    });
});
