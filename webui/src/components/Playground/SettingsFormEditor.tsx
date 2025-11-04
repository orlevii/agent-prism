import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { detectTextDirection } from '@/utils/text';

interface SettingsFormEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SettingsFormEditor({ value, onChange }: SettingsFormEditorProps) {
  let parsedSettings: Record<string, unknown> = {};
  let parseError: string | null = null;

  // Parse JSON
  try {
    const trimmed = value.trim();
    parsedSettings = trimmed ? JSON.parse(trimmed) : {};
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'Invalid JSON';
  }

  // Handle field updates
  const handleFieldChange = (key: string, newValue: unknown) => {
    try {
      const updated = { ...parsedSettings, [key]: newValue };
      onChange(JSON.stringify(updated, null, 2));
    } catch (error) {
      console.error('Failed to update field:', error);
    }
  };

  // Render error state
  if (parseError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Cannot parse JSON: {parseError}</AlertDescription>
      </Alert>
    );
  }

  // Render empty state
  const entries = Object.entries(parsedSettings);
  if (entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-md">
        No settings defined. Switch to JSON mode to add settings.
      </div>
    );
  }

  // Render form fields
  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        const valueType = typeof value;

        // Boolean field
        if (valueType === 'boolean') {
          return (
            <div key={key} className="flex items-center justify-between space-x-2">
              <Label htmlFor={`field-${key}`} className="text-sm font-medium">
                {key}
              </Label>
              <Switch
                id={`field-${key}`}
                checked={value as boolean}
                onCheckedChange={(checked) => handleFieldChange(key, checked)}
              />
            </div>
          );
        }

        // Number field
        if (valueType === 'number') {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={`field-${key}`} className="text-sm font-medium">
                {key}
              </Label>
              <Input
                id={`field-${key}`}
                type="number"
                value={value as number}
                onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
              />
            </div>
          );
        }

        // String field (default)
        if (valueType === 'string') {
          const textValue = value as string;
          const direction = detectTextDirection(textValue);

          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={`field-${key}`} className="text-sm font-medium">
                {key}
              </Label>
              <Textarea
                id={`field-${key}`}
                value={textValue}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                rows={3}
                className="resize-y font-mono text-sm"
                dir={direction}
              />
            </div>
          );
        }

        // Unsupported types (null, object, array, etc.)
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">{key}</Label>
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              Unsupported type: {valueType} (use JSON mode to edit)
            </div>
          </div>
        );
      })}
    </div>
  );
}
