import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ToolsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToolsEditor({ value, onChange }: ToolsEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    // Validate JSON
    if (newValue.trim() === '' || newValue.trim() === '[]') {
      setIsValid(true);
      setError(null);
      onChange(newValue);
      return;
    }

    try {
      const parsed = JSON.parse(newValue);
      if (!Array.isArray(parsed)) {
        setIsValid(false);
        setError('Tools must be an array');
      } else {
        setIsValid(true);
        setError(null);
        onChange(newValue);
      }
    } catch (e) {
      setIsValid(false);
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tools-editor">Tools (Function Calling)</Label>
      <Textarea
        id="tools-editor"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='[{"type": "function", "function": {"name": "get_weather", "description": "Get weather info"}}]'
        className={cn('font-mono text-sm', !isValid && 'border-destructive')}
        rows={6}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Enter tools as JSON array. Leave empty to disable function calling.
      </p>
    </div>
  );
}
