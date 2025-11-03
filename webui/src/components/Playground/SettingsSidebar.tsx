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
  const [selectedDependency, setSelectedDependency] = useState<string>('');

  const handleDependencySelect = (dependencyName: string) => {
    setSelectedDependency(dependencyName);

    if (selectedAgentData) {
      const dependency = selectedAgentData.dependencies.find((dep) => dep.name === dependencyName);
      if (dependency && dependency.data) {
        const jsonStr = JSON.stringify(dependency.data, null, 2);
        onUpdateSetting('dependencies', jsonStr);
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

        {/* Dependency Selector */}
        {selectedAgentData && selectedAgentData.dependencies.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="dependency-select">Select Dependency</Label>
            <Select value={selectedDependency} onValueChange={handleDependencySelect}>
              <SelectTrigger id="dependency-select">
                <SelectValue placeholder="Choose a dependency..." />
              </SelectTrigger>
              <SelectContent>
                {selectedAgentData.dependencies.map((dep) => (
                  <SelectItem key={dep.name} value={dep.name}>
                    {dep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a dependency to auto-fill the JSON below
            </p>
          </div>
        )}

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
