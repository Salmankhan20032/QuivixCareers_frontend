import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, User } from "lucide-react";
// 1. IMPORT THE GOOGLE AI LIBRARY
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./BlazeAI.css"; // Assuming you are still using the custom CSS

// 2. INITIALIZE THE GEMINI MODEL OUTSIDE THE COMPONENT
// This uses your .env variable. Make sure your server is restarted after changing .env
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
// NOTE: "gemini-1.5-flash-latest" is the current stable name for the fast model.
// "gemini-2.5-flash-lite" does not exist yet. This is the correct one to use.
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

  // 3. UPDATED handleSubmit TO MAKE A REAL API CALL
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // This is the prompt that defines the AI's personality and instructions
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

      // Start a chat session with the system prompt history
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

      // Send the user's actual message
      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      let errorMessage = "Unknown error";
      if (err.message) {
        // Try to extract a more user-friendly error message
        const match = err.message.match(/\[\d{3}\s\w+\]\s(.*)/);
        errorMessage = match ? match[1] : err.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `## Error Occurred\n\nI apologize, but I encountered an error connecting to the service. Please check your API key and ensure it is valid and has billing enabled.\n\n**Details**: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // The rest of your component remains the same...
  // (renderMarkdown, formatInline, and the JSX return statement)

  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("```")) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={i}>
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        i++;
        continue;
      }
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
      if (line.trim()) {
        elements.push(<p key={i}>{formatInline(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  const formatInline = (text) => {
    const parts = [];
    let current = "";
    let i = 0;
    while (i < text.length) {
      if (text[i] === "*" && text[i + 1] === "*") {
        if (current) parts.push(current);
        current = "";
        i += 2;
        let bold = "";
        while (i < text.length && !(text[i] === "*" && text[i + 1] === "*")) {
          bold += text[i];
          i++;
        }
        parts.push(<strong key={i}>{bold}</strong>);
        i += 2;
        continue;
      }
      if (text[i] === "`") {
        if (current) parts.push(current);
        current = "";
        i++;
        let code = "";
        while (i < text.length && text[i] !== "`") {
          code += text[i];
          i++;
        }
        parts.push(<code key={i}>{code}</code>);
        i++;
        continue;
      }
      current += text[i];
      i++;
    }
    if (current) parts.push(current);
    return parts;
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
