# Hey Lawyer

Hey Lawyer is a voice-activated legal assistant designed to provide quick, accurate, and personalized legal advice. Using real-time transcription and AI integration, it empowers users to navigate legal queries effortlessly.

---

## Features

- **Voice-Activated Assistance**: Start with "Hey Lawyer" to get instant legal advice.
- **Real-Time Transcript Processing**: Processes conversations as they happen for dynamic and relevant responses.
- **AI-Powered Legal Advice**: Integrated with OpenAI GPT-4 to deliver contextually accurate and authoritative guidance.
- **User Personalization**: Tailored advice based on user demographics and preferences.

---

## How Does It Work?

1. **User Registration**: 
   - Register on the platform with your details (e.g., name, profession, age, etc.).
   - Details are securely stored in MongoDB.

2. **Trigger Detection**: 
   - Speak the phrase "Hey Lawyer" during a conversation.
   - The app detects the trigger and starts collecting relevant context from the conversation.

3. **Question Aggregation**:
   - Extracts and aggregates user queries following the trigger phrase.

4. **AI Response**:
   - Sends the query to OpenAI for processing.
   - Receives and delivers a tailored legal response.

5. **Session Management**:
   - Manages conversation sessions in MongoDB to ensure continuity and relevance.

---

## Technologies Used

- **Frontend**: Next.js, TailwindCSS
- **Backend**: Node.js, MongoDB, OpenAI API
- **Logging**: Winston
- **Real-Time Processing**: Webhook-based transcript handling
