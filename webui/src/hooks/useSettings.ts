import { useState, useCallback } from 'react';
import type { PlaygroundSettings } from '../types/playground';

const DEFAULT_SETTINGS: PlaygroundSettings = {
  baseUrl: 'http://localhost:11434',
  model: '',
  systemPrompt: '',
  temperature: 0.7,
  tools: '[]',
  enableThinking: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<PlaygroundSettings>(DEFAULT_SETTINGS);

  const updateSetting = useCallback(
    <K extends keyof PlaygroundSettings>(key: K, value: PlaygroundSettings[K]) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const updateSettings = useCallback((updates: Partial<PlaygroundSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
  };
}
