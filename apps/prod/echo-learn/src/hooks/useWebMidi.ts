'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseWebMidiReturn {
  isSupported: boolean;
  isConnected: boolean;
  deviceName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  onNoteOn: (callback: (note: number, velocity: number) => void) => void;
  onNoteOff: (callback: (note: number) => void) => void;
}

export function useWebMidi(): UseWebMidiReturn {
  const [isSupported] = useState(() => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const accessRef = useRef<MIDIAccess | null>(null);
  const inputRef = useRef<MIDIInput | null>(null);
  const noteOnRef = useRef<((note: number, velocity: number) => void) | null>(null);
  const noteOffRef = useRef<((note: number) => void) | null>(null);

  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    const data = event.data;
    if (!data || data.length < 3) return;

    const status = data[0] & 0xf0; // mask channel
    const note = data[1];
    const velocity = data[2];

    if (status === 0x90 && velocity > 0) {
      // Note On
      noteOnRef.current?.(note, velocity);
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      // Note Off
      noteOffRef.current?.(note);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) return;

    try {
      const access = await navigator.requestMIDIAccess();
      accessRef.current = access;

      // Find first available input
      const inputs = Array.from(access.inputs.values());
      if (inputs.length === 0) return;

      const input = inputs[0];
      input.onmidimessage = handleMidiMessage;
      inputRef.current = input;
      setDeviceName(input.name || 'MIDI Device');
      setIsConnected(true);

      // Listen for device changes
      access.onstatechange = () => {
        const currentInputs = Array.from(access.inputs.values());
        if (inputRef.current && !currentInputs.includes(inputRef.current)) {
          // Device disconnected
          setIsConnected(false);
          setDeviceName(null);
          inputRef.current = null;
        }
      };
    } catch {
      // MIDI access denied or not available
    }
  }, [isSupported, handleMidiMessage]);

  const disconnect = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.onmidimessage = null;
      inputRef.current = null;
    }
    setIsConnected(false);
    setDeviceName(null);
  }, []);

  const onNoteOn = useCallback((callback: (note: number, velocity: number) => void) => {
    noteOnRef.current = callback;
  }, []);

  const onNoteOff = useCallback((callback: (note: number) => void) => {
    noteOffRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.onmidimessage = null;
      }
    };
  }, []);

  return { isSupported, isConnected, deviceName, connect, disconnect, onNoteOn, onNoteOff };
}
