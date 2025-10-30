import { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types/playground';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-react';
import { detectTextDirection } from '../../utils/text';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  isLoading?: boolean;
}

export default function MessageBubble({ message, onEdit, isLoading }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const canEdit = isUser && !message.isStreaming && !isLoading && onEdit;

  // Label for the message sender
  const senderLabel = isUser ? 'You' : isTool ? `Tool: ${message.tool_name}` : 'Assistant';

  // Auto-focus and auto-resize textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedContent.trim() && onEdit) {
      onEdit(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeInUp group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-primary/20'
            : isTool
              ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-foreground border border-emerald-500/30 shadow-emerald-500/10'
              : 'bg-card text-card-foreground border border-border/50 shadow-card/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold tracking-wide uppercase ${
                isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              {senderLabel}
            </span>
            {message.isStreaming && (
              <span
                className={`text-xs animate-pulse flex items-center gap-1 ${
                  isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                <span
                  className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </span>
            )}
          </div>

          {/* Edit button - only show for user messages when not streaming and not loading */}
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className={`h-6 w-6 p-0 hover:bg-primary-foreground/20 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Message Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              dir={detectTextDirection(editedContent)}
              className="min-h-[48px] max-h-[300px] resize-none bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/40 focus:ring-2 focus:ring-primary-foreground/20"
              placeholder="Edit your message..."
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-7 px-3 text-xs hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                disabled={!editedContent.trim()}
                className="h-7 px-3 text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          message.content && (
            <div
              className="whitespace-pre-wrap break-words leading-relaxed"
              dir={detectTextDirection(message.content)}
            >
              {message.content}
            </div>
          )
        )}
      </div>
    </div>
  );
}
