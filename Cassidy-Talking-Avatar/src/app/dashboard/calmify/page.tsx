'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, type LiveMusicSession, type LiveMusicServerMessage } from '@google/genai';
import { decode, decodeAudioData } from '@/utils/audio';
import { throttle } from '@/utils/throttle';
import { AudioAnalyser } from '@/utils/AudioAnalyser';
import { MidiDispatcher } from '@/utils/MidiDispatcher';
import {WeightKnob} from '@/components/WeightKnob';
import {PromptController} from '@/components/PromptController';
import { PlayPauseButton } from '@/components/PlayPauseButton';
import { ToastMessage } from '@/components/ToastMessage';

interface Prompt {
  promptId: string;
  text: string;
  weight: number;
  cc: number;
  color: string;
}

type PlaybackState = 'stopped' | 'playing' | 'paused' | 'loading';

const DEFAULT_PROMPTS = [
  { color: '#4A90E2', text: 'Binaural Beats (Theta)' },
  { color: '#87CEEB', text: 'Gentle Rain Sounds' },
  { color: '#20B2AA', text: 'Ocean Waves' },
  { color: '#228B22', text: 'Forest Ambience' },
  { color: '#FFD700', text: 'Tibetan Singing Bowls' },
  { color: '#8A2BE2', text: 'Ambient Drone' },
  { color: '#D3D3D3', text: 'White Noise' },
  { color: '#FFC0CB', text: 'Pink Noise' },
  { color: '#D2B48C', text: 'Brown Noise' },
  { color: '#FF4500', text: 'Crackling Fireplace' },
  { color: '#D8BFD8', text: 'Guided Meditation Aid' },
  { color: '#FFA500', text: 'Solfeggio Frequencies' },
];

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '', apiVersion: 'v1alpha' });
const model = 'lyria-realtime-exp';

function buildDefaultPrompts(): Map<string, Prompt> {
  const startOn = [...DEFAULT_PROMPTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < DEFAULT_PROMPTS.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = DEFAULT_PROMPTS[i];
    const { text, color } = prompt;
    prompts.set(promptId, {
      promptId,
      text,
      weight: startOn.includes(prompt) ? 1 : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

function getInitialPrompts(): Map<string, Prompt> {
  if (typeof window === 'undefined') return buildDefaultPrompts();
  
  const { localStorage } = window;
  const storedPrompts = localStorage.getItem('prompts');

  if (storedPrompts) {
    try {
      const prompts = JSON.parse(storedPrompts) as Prompt[];
      console.log('Loading stored prompts', prompts);
      return new Map(prompts.map((prompt) => [prompt.promptId, prompt]));
    } catch (e) {
      console.error('Failed to parse stored prompts', e);
    }
  }

  console.log('No stored prompts, using default prompts');
  return buildDefaultPrompts();
}

function setStoredPrompts(prompts: Map<string, Prompt>) {
  if (typeof window === 'undefined') return;
  const storedPrompts = JSON.stringify([...prompts.values()]);
  const { localStorage } = window;
  localStorage.setItem('prompts', storedPrompts);
}
import { requireAuth } from '@/lib/firebase';

export default function CalmifyPage() {
 
  //------- prev part is for forced refresh imma doin
  useEffect(() => {
      requireAuth();
    }, []);
  
  const [prompts, setPrompts] = useState<Map<string, Prompt>>(new Map());
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [showMidi, setShowMidi] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [midiInputIds, setMidiInputIds] = useState<string[]>([]);
  const [activeMidiInputId, setActiveMidiInputId] = useState<string | null>(null);
  const [filteredPrompts, setFilteredPrompts] = useState<Set<string>>(new Set());
  const [connectionError, setConnectionError] = useState(false);

  const sessionRef = useRef<LiveMusicSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const bufferTime = 2;
  const midiDispatcherRef = useRef<MidiDispatcher | null>(null);
  const audioAnalyserRef = useRef<AudioAnalyser | null>(null);
  const audioLevelRafIdRef = useRef<number | null>(null);
  const toastRef = useRef<any>(null);
  const playbackStateRef = useRef(playbackState);
  const isInitializedRef = useRef(false);
  
  // Add refs to track current state and prevent callback loops
  const promptsRef = useRef(prompts);
  const filteredPromptsRef = useRef(filteredPrompts);
  const sessionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  useEffect(() => {
    promptsRef.current = prompts;
  }, [prompts]);

  useEffect(() => {
    filteredPromptsRef.current = filteredPrompts;
  }, [filteredPrompts]);
  
  // Initialize audio context and MIDI dispatcher
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    audioContextRef.current = new AudioContext({ sampleRate: 48000 });
    outputNodeRef.current = audioContextRef.current.createGain();
    midiDispatcherRef.current = new MidiDispatcher();
    audioAnalyserRef.current = new AudioAnalyser(audioContextRef.current);
    
    audioAnalyserRef.current.node.connect(audioContextRef.current.destination);
    outputNodeRef.current.connect(audioAnalyserRef.current.node);

    setPrompts(getInitialPrompts());
    isInitializedRef.current = true;

    return () => {
      if (audioLevelRafIdRef.current) {
        cancelAnimationFrame(audioLevelRafIdRef.current);
      }
      if (sessionUpdateTimeoutRef.current) {
        clearTimeout(sessionUpdateTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.suspend();
      }
    };
  }, []);

  // Audio level animation
  const updateAudioLevel = useCallback(() => {
    if (audioAnalyserRef.current) {
      setAudioLevel(audioAnalyserRef.current.getCurrentLevel());
    }
    audioLevelRafIdRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    updateAudioLevel();
    return () => {
      if (audioLevelRafIdRef.current) {
        cancelAnimationFrame(audioLevelRafIdRef.current);
      }
    };
  }, [updateAudioLevel]);

  // Stable session prompts updater - using refs to avoid dependencies
  const updateSessionPrompts = useCallback(async () => {
    if (!sessionRef.current) return;
    
    const currentPrompts = promptsRef.current;
    const currentFilteredPrompts = filteredPromptsRef.current;
    
    const promptsToSend = Array.from(currentPrompts.values())
      .filter((p) => !currentFilteredPrompts.has(p.text) && p.weight !== 0);
    
    if (promptsToSend.length === 0) {
      toastRef.current?.show('There needs to be one active prompt to play.');
      return;
    }
    
    try {
      await sessionRef.current.setWeightedPrompts({
        weightedPrompts: promptsToSend,
      });
    } catch (e: any) {
      console.error('Failed to set session prompts:', e);
      toastRef.current?.show(e.message);
    }
  }, []);

  // Throttled session prompt setter with debouncing
  const setSessionPrompts = useCallback(
    throttle(() => {
      // Clear any existing timeout
      if (sessionUpdateTimeoutRef.current) {
        clearTimeout(sessionUpdateTimeoutRef.current);
      }
      
      // Debounce the actual update
      sessionUpdateTimeoutRef.current = setTimeout(() => {
        updateSessionPrompts();
      }, 100);
    }, 200),
    [updateSessionPrompts]
  );

  const pause = useCallback(() => {
    sessionRef.current?.pause();
    setPlaybackState('paused');
    if (outputNodeRef.current && audioContextRef.current) {
      outputNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      outputNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
    }
    nextStartTimeRef.current = 0;
  }, []);

  const play = useCallback(() => {
    const currentPrompts = promptsRef.current;
    const currentFilteredPrompts = filteredPromptsRef.current;
    
    const promptsToSend = Array.from(currentPrompts.values())
      .filter((p) => !currentFilteredPrompts.has(p.text) && p.weight !== 0);
    
    if (promptsToSend.length === 0) {
      toastRef.current?.show('There needs to be one active prompt to play. Turn up a knob to resume playback.');
      return;
    }

    audioContextRef.current?.resume();
    sessionRef.current?.play();
    setPlaybackState('loading');
    if (outputNodeRef.current && audioContextRef.current) {
      outputNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      outputNodeRef.current.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.1);
    }
  }, []);

  const stop = useCallback(() => {
    sessionRef.current?.stop();
    setPlaybackState('stopped');
    if (outputNodeRef.current && audioContextRef.current) {
      outputNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      outputNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
    }
    nextStartTimeRef.current = 0;
  }, []);

  const connectToSession = useCallback(async () => {
    try {
      console.log('Connecting to session...');
      sessionRef.current = await ai.live.music.connect({
        model: model,
        callbacks: {
          onmessage: async (e: LiveMusicServerMessage) => {
            if (e.setupComplete) {
              console.log('Session setup complete');
              setConnectionError(false);
            }
            if (e.filteredPrompt && e.filteredPrompt.text) {
              const filteredText = e.filteredPrompt.text;
              setFilteredPrompts(prev => new Set([...prev, filteredText]));
              toastRef.current?.show(e.filteredPrompt.filteredReason);
            }
            if (e.serverContent?.audioChunks !== undefined) {
              if (playbackStateRef.current === 'paused' || playbackStateRef.current === 'stopped') return;
              
              const audioData = e.serverContent?.audioChunks[0].data;
              if (!audioData) {
                console.warn('No audio data received');
                return;
              }
              
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                audioContextRef.current!,
                48000,
                2,
              );
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              
              if (nextStartTimeRef.current === 0) {
                nextStartTimeRef.current = audioContextRef.current!.currentTime + bufferTime;
                setTimeout(() => {
                  setPlaybackState('playing');
                }, bufferTime * 1000);
              }

              if (nextStartTimeRef.current < audioContextRef.current!.currentTime) {
                setPlaybackState('loading');
                nextStartTimeRef.current = 0;
                return;
              }
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setConnectionError(true);
            stop();
            toastRef.current?.show('Connection error, please restart audio by refreshing the page.');
          },
          onclose: (e: CloseEvent) => {
            console.error('Session closed:', e);
            setConnectionError(true);
            stop();
            toastRef.current?.show('Connection error, please restart audio by refreshing the page.');
          },
        },
      });
      console.log('Session connected successfully');
    } catch (error) {
      console.error('Failed to connect to session:', error);
      setConnectionError(true);
      toastRef.current?.show('Failed to connect to audio service.');
    }
  }, [stop]);

  const handlePlayPause = useCallback(async () => {
    const currentState = playbackStateRef.current;
    
    if (currentState === 'playing') {
      pause();
    } else if (currentState === 'paused' || currentState === 'stopped') {
      if (connectionError || !sessionRef.current) {
        await connectToSession();
        // Wait a bit for connection to establish
        setTimeout(() => {
          setSessionPrompts();
        }, 1000);
      }
      play();
    } else if (currentState === 'loading') {
      stop();
    }
  }, [connectionError, pause, play, stop, connectToSession, setSessionPrompts]);

  const toggleShowMidi = useCallback(async () => {
    setShowMidi(prev => !prev);
    if (!showMidi && midiDispatcherRef.current) {
      const inputIds = await midiDispatcherRef.current.getMidiAccess();
      setMidiInputIds(inputIds);
      setActiveMidiInputId(midiDispatcherRef.current.activeMidiInputId);
    }
  }, [showMidi]);

  const handleMidiInputChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMidiId = event.target.value;
    setActiveMidiInputId(newMidiId);
    if (midiDispatcherRef.current) {
      midiDispatcherRef.current.activeMidiInputId = newMidiId;
    }
  }, []);

  // Stable prompt change handler - prevent infinite loops
  const handlePromptChanged = useCallback((updatedPrompt: Prompt) => {
    setPrompts(currentPrompts => {
      const existingPrompt = currentPrompts.get(updatedPrompt.promptId);
      
      // Only update if something actually changed
      if (existingPrompt && 
          existingPrompt.text === updatedPrompt.text &&
          Math.abs(existingPrompt.weight - updatedPrompt.weight) < 0.001 &&
          existingPrompt.cc === updatedPrompt.cc) {
        return currentPrompts; // No change, return same reference
      }
      
      const newPrompts = new Map(currentPrompts);
      newPrompts.set(updatedPrompt.promptId, updatedPrompt);
      
      // Store prompts
      setStoredPrompts(newPrompts);
      
      // Trigger session update
      setSessionPrompts();
      
      return newPrompts;
    });
  }, [setSessionPrompts]);

  const resetAll = useCallback(() => {
    const defaultPrompts = buildDefaultPrompts();
    setPrompts(defaultPrompts);
    setStoredPrompts(defaultPrompts);
  }, []);

  // Initialize session on mount - only once
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const initializeConnection = async () => {
      await connectToSession();
      timeoutId = setTimeout(() => {
        setSessionPrompts();
      }, 1000);
    };
    
    initializeConnection();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInitializedRef.current]); // Only depend on initialization flag

  // Generate background gradient - memoized
  const backgroundStyle = React.useMemo(() => {
    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
    const MAX_WEIGHT = 0.5;
    const MAX_ALPHA = 0.6;
    const bg: string[] = [];

    [...prompts.values()].forEach((p, i) => {
      const alphaPct = clamp01(p.weight / MAX_WEIGHT) * MAX_ALPHA;
      const alpha = Math.round(alphaPct * 0xff)
        .toString(16)
        .padStart(2, '0');

      const stop = p.weight / 2;
      const x = (i % 4) / 3;
      const y = Math.floor(i / 4) / 3;
      const s = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${p.color}${alpha} 0px, ${p.color}00 ${stop * 100}%)`;

      bg.push(s);
    });

    return { backgroundImage: bg.join(', ') };
  }, [prompts]);

  return (
    <div className="relative h-screen flex flex-col justify-center items-center box-border">
      {/* Background */}
      <div 
        className="absolute inset-0 -z-10 bg-gray-900"
        style={backgroundStyle}
      />
      <div className="banner-text fixed z-[0] w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[150px] font-[900] text-[#ffffff] text-center opacity-15 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none">
        CALMIFY
      </div>
      
      
      {/* Controls */}
      <div className="absolute top-0 left-0 p-1 flex gap-1">
        <button
          onClick={toggleShowMidi}
          className={`font-semibold cursor-pointer text-white bg-black bg-opacity-20 border border-white rounded px-2 py-1 select-none ${
            showMidi ? 'bg-white text-black' : ''
          }`}
        >
          Calmify
        </button>
        <select
          onChange={handleMidiInputChange}
          value={activeMidiInputId || ''}
          className={`p-1 bg-white text-black rounded border-none outline-none cursor-pointer ${
            showMidi ? '' : 'invisible'
          }`}
        >
          {midiInputIds.length > 0
            ? midiInputIds.map((id) => (
                <option key={id} value={id}>
                  {midiDispatcherRef.current?.getDeviceName(id)}
                </option>
              ))
            : <option value="">No devices found</option>
          }
        </select>
      </div>

      {/* Prompt Grid */}
      <div className="w-[80vmin] h-[80vmin] grid grid-cols-4 gap-[2.5vmin] mt-[8vmin]">
        {[...prompts.values()].map((prompt) => (
          <PromptController
            key={prompt.promptId}
            promptId={prompt.promptId}
            filtered={filteredPrompts.has(prompt.text)}
            cc={prompt.cc}
            text={prompt.text}
            weight={prompt.weight}
            color={prompt.color}
            midiDispatcher={midiDispatcherRef.current}
            showCC={showMidi}
            audioLevel={audioLevel}
            onPromptChanged={handlePromptChanged}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <PlayPauseButton 
        playbackState={playbackState} 
        onClick={handlePlayPause}
        className="relative w-[15vmin]"
      />

      {/* Toast Message */}
      <ToastMessage ref={toastRef} />
    </div>
  );
}