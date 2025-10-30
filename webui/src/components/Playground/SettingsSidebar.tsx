import AgentSelector from './AgentSelector';
import type { PlaygroundSettings } from '../../types/playground';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

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
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            type="text"
            value={settings.baseUrl}
            onChange={(e) => onUpdateSetting('baseUrl', e.target.value)}
            placeholder="http://localhost:8000"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">API server endpoint</p>
        </div>

        {/* Agent Selector */}
        <AgentSelector
          baseUrl={settings.baseUrl}
          selectedAgent={settings.agent}
          onAgentChange={(agent) => onUpdateSetting('agent', agent)}
        />

        {/* Dependencies */}
        <div className="space-y-2">
          <Label htmlFor="dependencies">Agent Dependencies</Label>
          <Textarea
            id="dependencies"
            value={settings.dependencies}
            onChange={(e) => onUpdateSetting('dependencies', e.target.value)}
            placeholder="{}"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            JSON object with agent-specific configuration
          </p>
        </div>
      </div>
    </div>
  );
}
