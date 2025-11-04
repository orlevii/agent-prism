import { useState, useEffect, useRef } from 'react';
import type { AgentsResponse, Agent } from '../../types/agent';
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

interface AgentSelectorProps {
  baseUrl: string;
  selectedAgent: string;
  onAgentChange: (agent: string) => void;
  onAgentDataChange?: (agent: Agent | null) => void;
}

export default function AgentSelector({
  baseUrl,
  selectedAgent,
  onAgentChange,
  onAgentDataChange,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (!baseUrl) {
      setAgents([]);
      hasAutoSelectedRef.current = false;
      return;
    }

    const fetchAgents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseUrl}/api/agents`);
        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.statusText}`);
        }

        const data: AgentsResponse = await response.json();
        // Convert API response to Agent[] objects
        const agentObjects: Agent[] = data.agents.map((agent) => ({
          id: agent.name,
          name: agent.name,
          settings: agent.settings,
        }));
        const sortedAgents = agentObjects.sort((a, b) => a.name.localeCompare(b.name));
        setAgents(sortedAgents);

        // Auto-select first agent if none selected and haven't auto-selected yet
        if (!selectedAgent && sortedAgents.length > 0 && !hasAutoSelectedRef.current) {
          onAgentChange(sortedAgents[0].id);
          hasAutoSelectedRef.current = true;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load agents';
        setError(errorMessage);
        setAgents([]);
        hasAutoSelectedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]); // Only re-fetch when baseUrl changes

  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

  // Notify parent of agent data changes
  useEffect(() => {
    if (onAgentDataChange) {
      onAgentDataChange(selectedAgentData || null);
    }
  }, [selectedAgentData, onAgentDataChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="agent-select">Agent</Label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="agent-select"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading || agents.length === 0}
          >
            {selectedAgentData?.name ||
              selectedAgent ||
              (isLoading ? 'Loading agents...' : 'Select an agent')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search agents..." />
            <CommandList>
              <CommandEmpty>No agents found.</CommandEmpty>
              <CommandGroup>
                {agents.map((agent) => (
                  <CommandItem
                    key={agent.id}
                    value={agent.name}
                    onSelect={() => {
                      onAgentChange(agent.id === selectedAgent ? '' : agent.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedAgent === agent.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{agent.name}</span>
                      {agent.description && (
                        <span className="text-xs text-muted-foreground">{agent.description}</span>
                      )}
                    </div>
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
