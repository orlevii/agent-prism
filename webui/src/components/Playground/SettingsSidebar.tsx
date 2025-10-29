import ModelSelector from './ModelSelector';
import ToolsEditor from './ToolsEditor';
import type { PlaygroundSettings } from '../../types/playground';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsSidebarProps {
  settings: PlaygroundSettings;
  onUpdateSetting: <K extends keyof PlaygroundSettings>(
    key: K,
    value: PlaygroundSettings[K]
  ) => void;
}

export default function SettingsSidebar({ settings, onUpdateSetting }: SettingsSidebarProps) {
  return (
    <div className="w-80 border-l border-border/50 bg-sidebar p-6 overflow-y-auto">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-violet-500 bg-clip-text text-transparent mb-6">
        Run Settings
      </h2>

      <div className="space-y-6">
        {/* Base URL */}
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL</Label>
          <Input
            id="base-url"
            type="text"
            value={settings.baseUrl}
            onChange={(e) => onUpdateSetting('baseUrl', e.target.value)}
            placeholder="http://localhost:11434"
          />
          <p className="text-xs text-muted-foreground">Ollama API endpoint</p>
        </div>

        {/* Model Selector */}
        <ModelSelector
          baseUrl={settings.baseUrl}
          selectedModel={settings.model}
          onModelChange={(model) => onUpdateSetting('model', model)}
        />

        {/* System Prompt */}
        <div className="space-y-2">
          <Label htmlFor="system-prompt">System instructions</Label>
          <Textarea
            id="system-prompt"
            value={settings.systemPrompt}
            onChange={(e) => onUpdateSetting('systemPrompt', e.target.value)}
            placeholder="Optional tone and style instructions for the model"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Optional instructions to set behavior and context
          </p>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[settings.temperature]}
            onValueChange={(value) => onUpdateSetting('temperature', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Enable Thinking Toggle */}
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="enable-thinking" className="flex flex-col space-y-1 cursor-pointer">
            <span>Enable Thinking</span>
            <span className="text-xs text-muted-foreground font-normal">
              Enable reasoning trace for supported models (DeepSeek-R1, QwQ)
            </span>
          </Label>
          <Switch
            id="enable-thinking"
            checked={settings.enableThinking}
            onCheckedChange={(checked) => onUpdateSetting('enableThinking', checked)}
          />
        </div>

        {/* Tools Editor */}
        <ToolsEditor value={settings.tools} onChange={(value) => onUpdateSetting('tools', value)} />
      </div>
    </div>
  );
}
