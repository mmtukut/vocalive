'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Wifi, WifiOff, Mic, MicOff, Send, ArrowLeft,
    Sparkles, Volume2, VolumeX,
} from 'lucide-react';

const SKILL_ICONS: Record<string, string> = {
    solar: '/icons/solar.png',
    welding: '/icons/welding.png',
    electrical: '/icons/electrical.png',
    mechanics: '/icons/mechanics.png',
    carpentry: '/icons/carpentry.png',
    farming: '/icons/farming.png',
};

const SKILL_COLORS: Record<string, string> = {
    solar: '#F59E0B', welding: '#EF4444', electrical: '#3B82F6',
    mechanics: '#8B5CF6', carpentry: '#D97706', farming: '#10B981',
};

const SKILL_NAMES: Record<string, { en: string; ha: string }> = {
    solar: { en: 'Solar Installation', ha: 'Girka Hasken Rana' },
    welding: { en: 'Welding', ha: 'Walda' },
    electrical: { en: 'Electrical Wiring', ha: 'Haɗa Waya' },
    mechanics: { en: 'Auto Mechanics', ha: 'Injiniya Mota' },
    carpentry: { en: 'Carpentry', ha: 'Sassaƙa' },
    farming: { en: 'Farming', ha: 'Noma' },
};

const COACH_TEXT = {
    en: {
        ready: 'Align your camera to start coaching...',
        listening: 'Listening...',
        startCoaching: 'Start Coaching',
        stopCoaching: 'Stop Coaching',
        askQuestion: 'Ask your coach...',
        tapMic: 'Tap mic to ask a question',
    },
    ha: {
        ready: 'Dubi kyamararka don fara koyo...',
        listening: 'Ina saurare...',
        startCoaching: 'Fara Koyo',
        stopCoaching: 'Daina Koyo',
        askQuestion: 'Tambaya ga malamin ka...',
        tapMic: 'Taɓa mic don yin tambaya',
    },
};

interface Props {
    skill: string;
    language: 'en' | 'ha';
}

export default function CameraStream({ skill, language }: Props) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const recognitionRef = useRef<any>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [feedback, setFeedback] = useState<string>(COACH_TEXT[language].ready);
    const [isCorrect, setIsCorrect] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const [textInput, setTextInput] = useState('');
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

    const SkillIconPath = SKILL_ICONS[skill] || '/icons/solar.png';
    const skillColor = SKILL_COLORS[skill] || '#6366f1';
    const skillName = SKILL_NAMES[skill]?.[language] || skill;
    const t = COACH_TEXT[language];

    // Text to Speech
    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis || !isSpeaking) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Try Hausa voice, fall back to English
        if (language === 'ha') {
            const hausaVoice = voices.find(v => v.lang.startsWith('ha'));
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (hausaVoice) utterance.voice = hausaVoice;
            else if (englishVoice) utterance.voice = englishVoice;
        } else {
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }, [language, isSpeaking]);

    // Draw Visual Cue on overlay
    const drawCue = useCallback((cue: any) => {
        if (!cue || !overlayCanvasRef.current || !videoRef.current) return;
        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = cue.x * canvas.width;
        const y = cue.y * canvas.height;
        const color = cue.color || 'red';

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        if (cue.type === 'circle') {
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, 2 * Math.PI);
            ctx.stroke();
            // Pulsing inner ring
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(x, y, 55, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
        } else if (cue.type === 'arrow') {
            ctx.beginPath();
            ctx.moveTo(x - 30, y);
            ctx.lineTo(x + 30, y);
            ctx.lineTo(x + 20, y - 10);
            ctx.moveTo(x + 30, y);
            ctx.lineTo(x + 20, y + 10);
            ctx.stroke();
        }
    }, []);

    // Initialize Camera
    useEffect(() => {
        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setFeedback("Camera access error. Use HTTPS or localhost.");
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false,
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch {
                setFeedback("Please allow camera access to start coaching.");
            }
        };
        startCamera();
        // Load voices
        window.speechSynthesis?.getVoices();
    }, []);

    // Initialize WebSocket
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setIsConnected(true);
                // Send skill and language selection
                ws.send(JSON.stringify({ type: 'select_skill', skill_id: skill }));
                ws.send(JSON.stringify({ type: 'set_language', language }));
            };

            ws.onclose = () => {
                setIsConnected(false);
                setTimeout(connectWebSocket, 3000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'feedback') {
                        setFeedback(data.feedback || '');
                        setIsCorrect(data.is_correct !== false);
                        if (data.feedback) speak(data.feedback);
                        if (data.visual_cue) drawCue(data.visual_cue);
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                }
            };

            wsRef.current = ws;
        };

        connectWebSocket();
        return () => { wsRef.current?.close(); };
    }, [skill, language, speak, drawCue]);

    // Frame Processing
    useEffect(() => {
        if (!isStreaming || !isConnected) return;

        const interval = setInterval(() => {
            if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);

                    const payload: any = {
                        type: 'frame',
                        image: imageData.split(',')[1],
                    };

                    // Attach pending question to next frame
                    if (pendingQuestion) {
                        payload.question = pendingQuestion;
                        setPendingQuestion(null);
                    }

                    wsRef.current.send(JSON.stringify(payload));
                }
            }
        }, 500); // 2 FPS

        return () => clearInterval(interval);
    }, [isStreaming, isConnected, pendingQuestion]);

    // Voice Input (Web Speech API)
    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setFeedback(language === 'ha' ? 'Wayarka ba ta goyan bayan magana' : 'Voice input not supported on this device');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ha' ? 'ha-NG' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            if (isStreaming) {
                setPendingQuestion(text);
            } else {
                sendTextQuestion(text);
            }
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
    };

    // Text Question
    const sendTextQuestion = (text?: string) => {
        const question = text || textInput.trim();
        if (!question || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        if (isStreaming) {
            setPendingQuestion(question);
        } else {
            wsRef.current.send(JSON.stringify({ type: 'user_message', text: question }));
        }
        setTextInput('');
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {/* AR Overlay */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 safe-area-top">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                    <button
                        onClick={() => router.push('/')}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-full border border-white/5">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden bg-white/5"
                        >
                            <Image
                                src={SkillIconPath}
                                alt={skillName}
                                fill
                                className="object-contain p-1.5"
                            />
                        </div>
                        <span className="text-sm font-semibold text-white/90">{skillName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSpeaking(!isSpeaking)}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
                        >
                            {isSpeaking ? (
                                <Volume2 className="w-4 h-4 text-white" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-white/50" />
                            )}
                        </button>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${isConnected ? 'bg-emerald-500/20' : 'bg-red-500/20'
                            }`}>
                            {isConnected ? (
                                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className="text-[10px] font-mono font-semibold text-white/70">
                                {isConnected ? 'LIVE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 safe-area-bottom">
                <div className="px-6 pb-8 pt-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent">

                    {/* Feedback Bubble */}
                    <div className={`feedback-bubble mb-4 ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                }`}>
                                <Sparkles className="w-4 h-4" style={{ color: isCorrect ? '#10b981' : '#ef4444' }} />
                            </div>
                            <p className="text-[15px] font-medium text-white/90 leading-relaxed flex-1">
                                {feedback}
                            </p>
                        </div>
                    </div>

                    {/* Input Row: Text + Voice */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendTextQuestion()}
                                placeholder={t.askQuestion}
                                className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 backdrop-blur-md shadow-lg"
                            />
                            {textInput.trim() && (
                                <button
                                    onClick={() => sendTextQuestion()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center hover:bg-indigo-600 transition-colors"
                                >
                                    <Send className="w-3.5 h-3.5 text-white" />
                                </button>
                            )}
                        </div>

                        {/* Voice Button */}
                        <button
                            onClick={toggleVoiceInput}
                            className={`voice-btn ${isListening ? 'listening' : ''}`}
                            title={t.tapMic}
                        >
                            {isListening ? (
                                <MicOff className="w-5 h-5 text-red-400" />
                            ) : (
                                <Mic className="w-5 h-5 text-white/70" />
                            )}
                        </button>
                    </div>

                    {/* Start/Stop Button */}
                    <button
                        onClick={() => setIsStreaming(!isStreaming)}
                        className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${isStreaming
                            ? 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'btn-primary text-white'
                            }`}
                        style={!isStreaming ? { background: `linear-gradient(135deg, ${skillColor}, ${skillColor}dd)`, boxShadow: `0 4px 20px ${skillColor}40` } : undefined}
                    >
                        {isStreaming ? t.stopCoaching : t.startCoaching}
                    </button>

                    {isListening && (
                        <p className="text-center text-xs text-red-400 mt-2 animate-pulse">
                            {t.listening}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
