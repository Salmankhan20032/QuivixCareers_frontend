// src/pages/BlazeAIPage.js

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, User } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./BlazeAI.css"; // Ensure you have this CSS file in the same folder

// Initialize the Gemini Model with your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// --- THE FIX IS HERE ---
// "gemini-1.5-flash-latest" is the correct, current name for Google's fast model.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const BlazeAIPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const systemPrompt = `You are Blaze AI by Quivix, a professional internship assistant.

      CRITICAL IDENTITY RULES:
      - If asked about your name, identity, creator, or "who are you": Always respond "I am Blaze AI by Quivix, your personal internship assistant."
      - Never claim to be any other AI, including Gemini.
      - Always maintain your identity as Blaze AI by Quivix.

      Format all responses professionally with markdown:
      - Use ## for main sections, ### for subsections, **bold** for key points, \`code\` for inline code, bullet points with -, numbered lists with 1. 2. 3., and code blocks with \`\`\`.

      Focus on topics related to: internships, career advice, cover letters, resumes, interview preparation, and explaining technical concepts for students and early-career professionals.`;

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I am Blaze AI by Quivix, ready to assist with internship and career questions.",
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      let errorMessage = err.message
        ? err.message.split("] ")[1] || err.message
        : "Unknown error";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `## Error Occurred\n\nI apologize, but I encountered an error. Please check your API key and ensure it's valid and has billing enabled in your Google Cloud project.\n\n**Details**: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
    return <>{parts}</>;
  };

  const renderMarkdown = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return <h2 key={i}>{formatInline(line.substring(3))}</h2>;
      if (line.startsWith("### "))
        return <h3 key={i}>{formatInline(line.substring(4))}</h3>;
      if (line.startsWith("- "))
        return <li key={i}>{formatInline(line.substring(2))}</li>;
      if (line.match(/^[\d]+\.\s/))
        return <li key={i}>{formatInline(line.replace(/^[\d]+\.\s/, ""))}</li>;
      if (line.startsWith("```"))
        return (
          <pre key={i}>
            <code>{text.split("```")[1]}</code>
          </pre>
        );
      if (line === "") return null;
      // Handle edge case for code blocks to not render extra paragraphs
      if (text.includes("```")) {
        if (
          line.startsWith("```") ||
          (text.split("```")[1] && text.split("```")[1].includes(line))
        ) {
          return null;
        }
      }
      return <p key={i}>{formatInline(line)}</p>;
    });
  };

  return (
    <div className="blaze-container">
      <div className="blaze-messages-area">
        {messages.length === 0 ? (
          <div className="blaze-empty-state">
            <div className="blaze-empty-content">
              <div className="blaze-logo">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="blaze-title">Blaze AI</h1>
              <p className="blaze-subtitle">by Quivix</p>
              <div className="blaze-suggestions">
                <button
                  onClick={() =>
                    setInput(
                      "Write a cover letter for a software engineer internship"
                    )
                  }
                  className="blaze-suggestion-card"
                >
                  <div className="blaze-suggestion-title">Cover Letter</div>
                  <div className="blaze-suggestion-desc">
                    Write a professional cover letter
                  </div>
                </button>
                <button
                  onClick={() =>
                    setInput("What are common interview questions?")
                  }
                  className="blaze-suggestion-card"
                >
                  <div className="blaze-suggestion-title">Interview Prep</div>
                  <div className="blaze-suggestion-desc">
                    Practice interview questions
                  </div>
                </button>
                <button
                  onClick={() => setInput("Explain REST APIs in simple terms")}
                  className="blaze-suggestion-card"
                >
                  <div className="blaze-suggestion-title">Learn Concepts</div>
                  <div className="blaze-suggestion-desc">
                    Understand technical topics
                  </div>
                </button>
                <button
                  onClick={() => setInput("How do I optimize my resume?")}
                  className="blaze-suggestion-card"
                >
                  <div className="blaze-suggestion-title">Resume Tips</div>
                  <div className="blaze-suggestion-desc">
                    Optimize for ATS systems
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="blaze-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className="blaze-message">
                <div className="blaze-message-content">
                  <div
                    className={`blaze-avatar ${
                      msg.role === "user"
                        ? "blaze-avatar-user"
                        : "blaze-avatar-ai"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="blaze-message-body">
                    <div className="blaze-message-name">
                      {msg.role === "user" ? "You" : "Blaze AI"}
                    </div>
                    <div className="blaze-message-text">
                      {msg.role === "user" ? (
                        <p>{msg.content}</p>
                      ) : (
                        renderMarkdown(msg.content)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="blaze-message">
                <div className="blaze-message-content">
                  <div className="blaze-avatar blaze-avatar-ai">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="blaze-message-body">
                    <div className="blaze-message-name">Blaze AI</div>
                    <div className="blaze-loading">
                      <Loader2 className="blaze-spinner" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="blaze-input-area">
        <div className="blaze-input-container">
          <div className="blaze-input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message Blaze AI..."
              className="blaze-textarea"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="blaze-send-button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="blaze-footer-text">
            Blaze AI by Quivix can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlazeAIPage;
