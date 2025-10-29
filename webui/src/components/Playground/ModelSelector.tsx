import { useState, useEffect, useRef } from 'react';
import type { OllamaTagsResponse } from '../../types/playground';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  baseUrl: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  baseUrl,
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (!baseUrl) {
      setModels([]);
      hasAutoSelectedRef.current = false;
      return;
    }

    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseUrl}/api/tags`);
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const data: OllamaTagsResponse = await response.json();
        const modelNames = data.models.map((model) => model.name).sort();
        setModels(modelNames);

        // Auto-select first model if none selected and haven't auto-selected yet
        if (!selectedModel && modelNames.length > 0 && !hasAutoSelectedRef.current) {
          onModelChange(modelNames[0]);
          hasAutoSelectedRef.current = true;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
        setError(errorMessage);
        setModels([]);
        hasAutoSelectedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]); // Only re-fetch when baseUrl changes

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">Model</Label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="model-select"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading || models.length === 0}
          >
            {selectedModel || (isLoading ? 'Loading models...' : 'Select a model')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup>
                {models.map((model) => (
                  <CommandItem
                    key={model}
                    value={model}
                    onSelect={(currentValue) => {
                      onModelChange(currentValue === selectedModel ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedModel === model ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {model}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
