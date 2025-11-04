import { useState } from 'react';
import AgentSelector from './AgentSelector';
import type { PlaygroundSettings } from '../../types/playground';
import type { Agent } from '../../types/agent';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsSidebarProps {
  settings: PlaygroundSettings;
  onUpdateSetting: <K extends keyof PlaygroundSettings>(
    key: K,
    value: PlaygroundSettings[K]
  ) => void;
}

export default function SettingsSidebar({ settings, onUpdateSetting }: SettingsSidebarProps) {
  const [selectedAgentData, setSelectedAgentData] = useState<Agent | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  const handleScenarioSelect = (scenarioName: string) => {
    setSelectedScenario(scenarioName);

    if (selectedAgentData) {
      const scenario = selectedAgentData.settings.find((s) => s.name === scenarioName);
      if (scenario && scenario.data) {
        const jsonStr = JSON.stringify(scenario.data, null, 2);
        onUpdateSetting('settings', jsonStr);
      }
    }
  };

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
          onAgentDataChange={setSelectedAgentData}
        />

        {/* Force Human Approval */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="force-human-approval">Force Human Approval</Label>
            <Switch
              id="force-human-approval"
              checked={settings.forceHumanApproval}
              onCheckedChange={(checked) => onUpdateSetting('forceHumanApproval', checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, you'll need to manually approve each tool call before execution
          </p>
        </div>

        {/* Scenario Selector */}
        {selectedAgentData && selectedAgentData.settings.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="scenario-select">Select Scenario</Label>
            <Select value={selectedScenario} onValueChange={handleScenarioSelect}>
              <SelectTrigger id="scenario-select">
                <SelectValue placeholder="Choose a scenario..." />
              </SelectTrigger>
              <SelectContent>
                {selectedAgentData.settings.map((scenario) => (
                  <SelectItem key={scenario.name} value={scenario.name}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a scenario to auto-fill the JSON below
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-2">
          <Label htmlFor="settings">Agent Settings</Label>
          <Textarea
            id="settings"
            value={settings.settings}
            onChange={(e) => onUpdateSetting('settings', e.target.value)}
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
