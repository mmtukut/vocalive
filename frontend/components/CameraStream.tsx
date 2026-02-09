'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Mic, Wifi, WifiOff } from 'lucide-react';

export default function CameraStream() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [feedback, setFeedback] = useState<string>("Align your camera to start coaching...");
    const [isStreaming, setIsStreaming] = useState(false);
    const [language, setLanguage] = useState("en");

    // Text to Speech
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel previous utterances to avoid queue buildup
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Try to select appropriate voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(language === 'ha' ? 'en' : language)); // Fallback for Hausa to English for now
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    }, [language]);

    // Draw Visual Cue
    const drawCue = (ctx: CanvasRenderingContext2D, cue: any) => {
        if (!cue) return;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const x = cue.x * width;
        const y = cue.y * height;

        ctx.strokeStyle = cue.color || 'red';
        ctx.lineWidth = 4;

        if (cue.type === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (cue.type === 'arrow') {
            // Simple arrow drawing logic
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 50, y); // pointing right placeholder
            ctx.stroke();
        }
    };

    // Initialize Camera
    useEffect(() => {
        const startCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setFeedback("Camera access error. If testing on network, use HTTPS or localhost.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: true
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setFeedback("Error accessing camera. Please allow permissions.");
            }
        };
        startCamera();
    }, []);

    // Initialize WebSocket
    useEffect(() => {
        const connectWebSocket = () => {
            // Use environment variable for backend URL, fallback to localhost
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setIsConnected(true);
                console.log("Connected to VocaLive Backend");
            };

            ws.onclose = () => {
                setIsConnected(false);
                console.log("Disconnected from VocaLive Backend");
                // Reconnect logic could go here
                setTimeout(connectWebSocket, 3000);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'session_created') {
                    console.log("Session ID:", data.session_id);
                }

                if (data.type === 'feedback') {
                    setFeedback(data.feedback);
                    if (data.feedback) speak(data.feedback);

                    // Draw cues if present (needs overlay canvas)
                    // For now, we update the main canvas if we weren't clearing it
                    // Ideally we'd have a separate overlay canvas
                    if (data.visual_cue && canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) drawCue(ctx, data.visual_cue);
                    }
                }
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            wsRef.current?.close();
        };
    }, []);

    // Frame Processing Loop
    useEffect(() => {
        if (!isStreaming || !isConnected) return;

        const interval = setInterval(() => {
            if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    // Draw video frame to canvas
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0);

                    // Convert to base64 jpeg
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);

                    // Send to backend
                    wsRef.current.send(JSON.stringify({
                        type: 'frame',
                        image: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
                    }));
                }
            }
        }, 500); // 2 FPS for initial testing

        return () => clearInterval(interval);
    }, [isStreaming, isConnected]);

    const toggleStreaming = () => {
        setIsStreaming(!isStreaming);
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center">
            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent text-white">
                <h1 className="text-xl font-bold tracking-tight">VocaLive</h1>
                <div className="flex items-center gap-2">
                    {isConnected ? <Wifi className="text-green-400 w-5 h-5" /> : <WifiOff className="text-red-400 w-5 h-5" />}
                    <span className="text-xs font-mono">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
            </div>

            {/* Feedback-Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-black/80 to-transparent">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                    <p className="text-lg font-medium text-white text-center leading-relaxed">
                        {feedback}
                    </p>
                </div>

                <button
                    onClick={toggleStreaming}
                    className={`w-full py-4 rounded-full font-bold text-lg transition-all ${isStreaming
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isStreaming ? 'Stop Coaching' : 'Start Coaching'}
                </button>
            </div>
        </div>
    );
}
