import { useState } from 'react';
import AgentSelector from './AgentSelector';
import { SettingsFormEditor } from './SettingsFormEditor';
import type { PlaygroundSettings } from '../../types/playground';
import type { Agent } from '../../types/agent';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Code, FormInput, AlertCircle } from 'lucide-react';

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
  const [editorMode, setEditorMode] = useState<'json' | 'form'>('json');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState<string>('');

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

  const handleModeToggle = () => {
    // If switching from JSON to Form mode, validate JSON first
    if (editorMode === 'json') {
      try {
        const trimmed = settings.settings.trim();
        if (trimmed) {
          JSON.parse(trimmed);
        }
        setJsonError(null);
        setEditorMode('form');
      } catch (error) {
        setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
      }
    } else {
      // Switching from Form to JSON mode - always allowed
      setJsonError(null);
      setEditorMode('json');
    }
  };

  const handleOpenFormModal = () => {
    // Validate JSON before opening modal
    try {
      const trimmed = settings.settings.trim();
      if (trimmed) {
        JSON.parse(trimmed);
      }
      setJsonError(null);
      setDraftSettings(settings.settings);
      setIsFormModalOpen(true);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const handleSaveFormModal = () => {
    onUpdateSetting('settings', draftSettings);
    setIsFormModalOpen(false);
  };

  const handleCancelFormModal = () => {
    setDraftSettings('');
    setIsFormModalOpen(false);
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
          <div className="flex items-center justify-between">
            <Label htmlFor="settings">Agent Settings</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFormModal}
                className="h-8 px-3 text-xs"
                title="Open form editor in modal"
              >
                <FormInput className="h-3.5 w-3.5 mr-1.5" />
                Open Form Editor
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleModeToggle}
                className="h-8 w-8"
                title={editorMode === 'json' ? 'Switch to form editor' : 'Switch to JSON editor'}
              >
                {editorMode === 'json' ? (
                  <FormInput className="h-4 w-4" />
                ) : (
                  <Code className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {jsonError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Invalid JSON: {jsonError}</AlertDescription>
            </Alert>
          )}

          {editorMode === 'json' ? (
            <>
              <Textarea
                id="settings"
                value={settings.settings}
                onChange={(e) => {
                  onUpdateSetting('settings', e.target.value);
                  setJsonError(null); // Clear error on edit
                }}
                placeholder="{}"
                rows={8}
                className="font-mono text-sm max-h-96 overflow-y-auto"
              />
              <p className="text-xs text-muted-foreground">
                JSON object with agent-specific configuration
              </p>
            </>
          ) : (
            <>
              <SettingsFormEditor
                value={settings.settings}
                onChange={(value) => onUpdateSetting('settings', value)}
              />
              <p className="text-xs text-muted-foreground">Edit settings using form fields</p>
            </>
          )}
        </div>
      </div>

      {/* Form Editor Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Settings</DialogTitle>
            <DialogDescription>
              Modify agent settings using form fields. Changes will be applied when you click Save.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <SettingsFormEditor value={draftSettings} onChange={setDraftSettings} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelFormModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveFormModal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
