// src/pages/BlazeAIPage.js

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, User, Copy, Check } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./BlazeAI.css";

// Initialize the Gemini Model with your API key from the .env file
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// --- CRITICAL FIX: Use the correct, current model name ---
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- NEW: Copy Button Component for Code Blocks ---
const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button onClick={handleCopy} className="blaze-copy-button">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy code"}
    </button>
  );
};

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
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message and a placeholder for AI's streaming response
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" }, // Placeholder for streaming
    ]);

    setLoading(true);

    try {
      const systemPrompt = `You are Blaze AI by Quivix, a professional internship assistant.

        CRITICAL IDENTITY RULES:
        - If asked about your name, identity, creator, or "who are you": Always respond "I am Blaze AI by Quivix, your personal internship assistant."
        - Never claim to be any other AI, including Gemini.
        - Always maintain your identity as Blaze AI by Quivix.

        Format all responses professionally with markdown:
        - Use ## for main sections
        - Use ### for subsections
        - Use **bold** for key points
        - Use \`code\` for inline code
        - Use bullet points with -
        - Use numbered lists with 1. 2. 3.
        - Use code blocks with \`\`\`

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
        generationConfig: { maxOutputTokens: 2000 },
      });

      // --- NEW: Implement Streaming Response ---
      const result = await chat.sendMessageStream(userMessage);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content += chunkText;
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      let errorMessage = "An unknown error occurred.";
      if (err.message) {
        // Extract user-friendly error from Gemini's response
        const match = err.message.match(/\[\d{3}\s\w+\]\s(.*)/);
        errorMessage = match ? match[1] : err.message;
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = `## Error Occurred\n\nI apologize, but I encountered an error. Please check your API key and ensure it is valid and has billing enabled.\n\n**Details**: ${errorMessage}`;
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Code Blocks
      if (line.startsWith("```")) {
        const lang = line.substring(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeString = codeLines.join("\n");
        elements.push(
          <div className="blaze-code-block" key={i}>
            <div className="blaze-code-header">
              <span>{lang || "code"}</span>
              <CopyButton textToCopy={codeString} />
            </div>
            <pre>
              <code>{codeString}</code>
            </pre>
          </div>
        );
        i++;
        continue;
      }
      // Headings
      if (line.startsWith("## ")) {
        elements.push(<h2 key={i}>{line.substring(3)}</h2>);
        i++;
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(<h3 key={i}>{line.substring(4)}</h3>);
        i++;
        continue;
      }

      // Lists (unordered)
      if (line.startsWith("- ")) {
        const listItems = [];
        while (i < lines.length && lines[i].startsWith("- ")) {
          listItems.push(
            <li key={i}>{formatInline(lines[i].substring(2))}</li>
          );
          i++;
        }
        elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
        continue;
      }
      // Lists (ordered)
      if (line.match(/^[\d]+\.\s/)) {
        const listItems = [];
        while (i < lines.length && lines[i].match(/^[\d]+\.\s/)) {
          listItems.push(
            <li key={i}>{formatInline(lines[i].replace(/^[\d]+\.\s/, ""))}</li>
          );
          i++;
        }
        elements.push(<ol key={`ol-${i}`}>{listItems}</ol>);
        continue;
      }
      // Paragraphs
      if (line.trim()) {
        elements.push(<p key={i}>{formatInline(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
    return parts;
  };

  return (
    <div className="blaze-container">
      <header className="blaze-header">
        <div className="blaze-header-logo">
          <Sparkles size={20} />
        </div>
        <h1 className="blaze-header-title">Blaze AI</h1>
      </header>
      <div className="blaze-messages-area">
        {messages.length === 0 ? (
          <div className="blaze-empty-state">
            <div className="blaze-logo">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="blaze-title">Blaze AI</h1>
            <p className="blaze-subtitle">Your Personal Internship Assistant</p>
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
                onClick={() => setInput("What are common interview questions?")}
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
        ) : (
          <div className="blaze-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`blaze-message-wrapper ${msg.role}`}>
                <div className="blaze-message-content">
                  <div className={`blaze-avatar ${msg.role}`}>
                    {msg.role === "user" ? (
                      <User size={20} />
                    ) : (
                      <Sparkles size={20} />
                    )}
                  </div>
                  <div className={`blaze-message-body ${msg.role}`}>
                    {msg.role === "user" ? (
                      <p>{msg.content}</p>
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                    {/* Blinking cursor for streaming effect */}
                    {loading &&
                      msg.role === "assistant" &&
                      idx === messages.length - 1 && (
                        <span className="blaze-cursor"></span>
                      )}
                  </div>
                </div>
              </div>
            ))}
            {/* This div is used to scroll to the bottom */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="blaze-input-area">
        <div className="blaze-input-container">
          <form onSubmit={handleSubmit} className="blaze-input-form">
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
              type="submit"
              disabled={!input.trim() || loading}
              className="blaze-send-button"
            >
              {loading ? (
                <Loader2 className="blaze-spinner" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
          <p className="blaze-footer-text">
            Blaze AI by Quivix can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlazeAIPage;
