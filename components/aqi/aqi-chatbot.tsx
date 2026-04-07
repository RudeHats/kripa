"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, X, MessageCircle, Minimize2, Loader2, Camera, Settings, Maximize2 } from "lucide-react";
import { AQICharacter } from "./aqi-character";
import { getAQIColor, getAQICategory } from "@/lib/aqi-data";
import { SettingsModal } from "./settings-modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

interface AQIChatbotProps {
  aqi: number;
  city: string;
}

// generateResponse has been moved to Chatbot.py FastAPI Backend
export function AQIChatbot({ aqi, city }: AQIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = getAQIColor(aqi);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setIsCameraOpen(false);
    }
  };

  const captureCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setImagePreview(dataUrl);
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((t) => t.stop());
        setIsCameraOpen(false);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000); // 2 seconds fake CNN processing
      }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imagePreview) || isLoading) return;

    const messageContent = input.trim() || "What can you tell me about this image related to air quality?";
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      image: imagePreview || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setIsLoading(true);

    // Simulate typing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent, city: city, aqi: aqi })
      });
      const resData = await res.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: resData.response || "No response received.",
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const errorMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Error: Could not connect to the Backend API. Ensure python Chatbot.py is running on port 8000.",
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setIsLoading(false);
  }, [input, imagePreview, isLoading, aqi, city]);

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full glass-card transition-all duration-300 hover:scale-110 group"
        style={{
          boxShadow: `0 0 20px ${color}40`,
          border: `1px solid ${color}40`,
        }}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6 text-foreground" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-foreground" />
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed z-50 flex flex-col transition-all duration-500 glass-card overflow-hidden ${isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          } ${isExpanded
            ? "inset-4 md:inset-10 rounded-xl"
            : "bottom-24 right-6 w-[380px] max-h-[600px] rounded-2xl"
          }`}
        style={{
          boxShadow: `0 0 40px ${color}20`,
          border: `1px solid ${color}20`,
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center gap-3 border-b border-border"
          style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)` }}
        >
          <AQICharacter aqi={aqi} size="sm" isTyping={isLoading} />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">AQI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Typing..." : "Ask me about air quality"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              {isExpanded ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="animate-fade-in">
              <div className="flex items-start gap-3">
                <AQICharacter aqi={aqi} size="sm" />
                <div
                  className="glass-card rounded-2xl rounded-tl-sm p-3 max-w-[85%]"
                  style={{ borderColor: `${color}20` }}
                >
                  <p className="text-sm text-foreground">
                    Hello! I&apos;m your AQI assistant. The current air quality in {city} is{" "}
                    <span style={{ color }} className="font-semibold">{aqi}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 animate-message-in ${isUser ? "flex-row-reverse" : ""
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {!isUser && <AQICharacter aqi={aqi} size="sm" />}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "glass-card rounded-bl-sm"
                    }`}
                  style={!isUser ? { borderColor: `${color}20` } : {}}
                >
                  {message.image && (
                    <div className="mb-2">
                      <img src={message.image} alt="Uploaded" className="rounded-lg max-w-full h-auto max-h-32 object-cover" />
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-wrap ${isUser ? "" : "text-foreground"}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2 animate-message-in">
              <AQICharacter aqi={aqi} size="sm" isTyping />
              <div className="glass-card rounded-2xl rounded-bl-sm p-3" style={{ borderColor: `${color}20` }}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground loading-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Camera stream view */}
        {isCameraOpen && (
          <div className="px-4 py-2 border-t border-border relative">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4">
              <button onClick={captureCamera} className="w-12 h-12 rounded-full bg-white border-4 border-primary hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              <button onClick={() => {
                const stream = videoRef.current?.srcObject as MediaStream;
                stream?.getTracks().forEach(t => t.stop());
                setIsCameraOpen(false);
              }} className="p-2 rounded-full bg-destructive text-white hover:scale-105 transition-transform absolute right-8">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 py-2 border-t border-border">
            <div className="relative inline-block overflow-hidden rounded-lg group">
              <img src={imagePreview} alt="Preview" className="h-16 w-auto object-cover" />
              {/* CNN Scanning Effect */}
              {isLoading && (
                <div
                  className="absolute inset-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] opacity-70 z-10 animate-ml-scan"
                  style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }}
                />
              )}
              {isLoading && (
                <div className="absolute inset-x-0 bottom-0 top-0 bg-primary/10 animate-pulse z-0" />
              )}
              <button onClick={removeImage} className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:scale-110 transition-transform z-20">
                <X className="w-3 h-3" />
              </button>
            </div>
            {isLoading && <p className="text-[10px] text-primary animate-pulse mt-1 font-mono tracking-widest">CNN PROCESSING IMAGE...</p>}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-secondary transition-all" disabled={isLoading}>
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </button>
            <button type="button" onClick={startCamera} className="p-2 rounded-lg hover:bg-secondary transition-all" disabled={isLoading}>
              <Camera className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about air quality..."
              disabled={isLoading}
              className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !imagePreview)}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
