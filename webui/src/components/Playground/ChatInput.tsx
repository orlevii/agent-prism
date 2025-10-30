import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { detectTextDirection } from '../../utils/text';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export default function ChatInput({ onSend, isLoading, onCancel }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Reset height when input is cleared
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  return (
    <div className="border-t border-border/50 bg-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            dir={detectTextDirection(input)}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 resize-none bg-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm rounded-xl min-h-[48px] max-h-[200px] overflow-y-auto"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={onCancel}
              variant="destructive"
              size="lg"
              className="h-12 px-6 shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-200 shrink-0"
            >
              Cancel
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="lg"
              className="h-12 w-12 p-0 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
