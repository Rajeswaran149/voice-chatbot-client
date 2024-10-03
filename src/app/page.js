"use client";

import { useState } from 'react';
import axios from 'axios';
import { base_url } from './config';

const Home = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState(null);
    const [loading, setLoading] = useState(false); // Loading state

    const handleSendMessage = async (text) => {
        if (text.trim() === '') return;

        const newMessage = { text, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput(''); // Clear input after sending
        setLoading(true); // Set loading to true

        await sendToServer(text); // Send the text to the server
    };

    const sendToServer = async (transcript) => {
        try {
            console.log("Sending message to server:", transcript); // Log the message being sent
            const response = await axios.post(`${base_url}/api/chat`, { text: transcript });
            console.log("Response from server:", response.data); // Log the server's response

            const botMessage = { text: response.data.response, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            // Play the audio response
            if (response.data.audioUrl) {
                const audio = new Audio(response.data.audioUrl);
                audio.play();
            }
        } catch (error) {
            console.error("Error sending to server:", error);
            // Optionally, you could show an error message in the UI
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "Error sending message", sender: 'system' }
            ]);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const startRecording = () => {
        if (!speechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsRecording(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleSendMessage(transcript); // Send the transcribed message
                setIsRecording(false);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event) => {
                console.error(event.error);
                setIsRecording(false);
            };

            setSpeechRecognition(recognition);
        }
        speechRecognition.start();
    };

    return (
        <div className="bg-gray-100 h-screen flex flex-col">
          <h1 className="text-2xl font-bold text-center p-4">Chatbot</h1> 
            <div className="bg-white border border-gray-300 shadow-lg flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 border-b border-gray-200 ${msg.sender === 'bot' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        <strong>{msg.sender === 'bot' ? 'Bot' : msg.sender === 'user' ? 'You' : 'System'}:</strong> {msg.text}
                    </div>
                ))}
                {loading && <div className="text-gray-500">Sending message...</div>} {/* Loading message */}
            </div>
            <div className="p-2 border-t border-gray-200 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    placeholder="Type a message..."
                />
                <button
                    onClick={() => handleSendMessage(input)}
                    className="ml-2 p-2 bg-blue-500 text-white rounded"
                >
                    Send
                </button>
                <button
                    onClick={startRecording}
                    className={`ml-2 p-2 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}
                    disabled={isRecording}
                >
                    {isRecording ? 'Recording...' : '🎤 Speak'}
                </button>
            </div>
        </div>
    );
};

export default Home;
