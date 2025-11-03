import { useState, useRef, useEffect } from 'react';
import { UserPromptPart as UserPromptPartType } from '@/types/message';
import { detectTextDirection } from '@/utils/text';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X } from 'lucide-react';

interface UserPromptPartProps {
  part: UserPromptPartType;
  partIndex: number;
  onEdit?: (partIndex: number, newContent: string) => void;
  isLoading?: boolean;
}

export default function UserPromptPart({
  part,
  partIndex,
  onEdit,
  isLoading,
}: UserPromptPartProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(part.content);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canEdit = !isLoading && onEdit;

  // Auto-focus and auto-resize textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedContent(part.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedContent.trim() && onEdit) {
      onEdit(partIndex, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(part.content);
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
      className="flex justify-end mb-6 animate-fadeInUp group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-primary/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-primary-foreground/80">
            You
          </span>

          {/* Edit button */}
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
          <div
            className="whitespace-pre-wrap break-words leading-relaxed"
            dir={detectTextDirection(part.content)}
          >
            {part.content}
          </div>
        )}
      </div>
    </div>
  );
}
