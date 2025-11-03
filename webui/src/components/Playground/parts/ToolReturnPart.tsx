import { useState, useRef, useEffect } from 'react';
import { ToolReturnPart as ToolReturnPartType } from '@/types/message';
import { Check, ChevronDown, ChevronRight, Pencil, X, Check as CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ToolReturnPartProps {
  part: ToolReturnPartType;
  partIndex: number;
  onEdit?: (partIndex: number, newContent: string | Record<string, unknown>) => void;
  isLoading?: boolean;
}

export default function ToolReturnPart({
  part,
  partIndex,
  onEdit,
  isLoading,
}: ToolReturnPartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editedContent, setEditedContent] = useState(() => {
    return typeof part.content === 'string' ? part.content : JSON.stringify(part.content, null, 2);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canEdit = !isLoading && onEdit;
  const isJsonContent = typeof part.content !== 'string';

  // Auto-focus and auto-resize textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedContent(
      typeof part.content === 'string' ? part.content : JSON.stringify(part.content, null, 2)
    );
    setJsonError(null);
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleSave = () => {
    if (!editedContent.trim() || !onEdit) return;

    // If original content was JSON, try to parse the edited content
    if (isJsonContent) {
      try {
        const parsed = JSON.parse(editedContent);
        onEdit(partIndex, parsed);
        setIsEditing(false);
        setJsonError(null);
      } catch {
        setJsonError('Invalid JSON format');
        return;
      }
    } else {
      onEdit(partIndex, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(
      typeof part.content === 'string' ? part.content : JSON.stringify(part.content, null, 2)
    );
    setJsonError(null);
    setIsEditing(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setJsonError(null);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    // Don't allow Enter to save for JSON content (need proper formatting)
    if (e.key === 'Enter' && !e.shiftKey && !isJsonContent) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="flex justify-start mb-6 animate-fadeInUp group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[75%] rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 p-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/40">
        {/* Tool Result Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Tool Result
          </span>
          <span className="font-mono font-semibold text-foreground">{part.tool_name}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
            <Check size={14} />
            Completed
          </span>

          {/* Edit button */}
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className={`h-6 w-6 p-0 hover:bg-emerald-500/20 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Collapsible Result */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            disabled={isEditing}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isEditing ? 'Editing Result' : 'View Result'}
          </button>
          {isExpanded && (
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className="min-h-[100px] max-h-[400px] resize-none font-mono text-xs bg-card/80 border-emerald-500/30"
                    placeholder="Edit tool result..."
                  />
                  {jsonError && (
                    <div className="text-xs text-destructive font-semibold">{jsonError}</div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-7 px-3 text-xs hover:bg-card/50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSave}
                      disabled={!editedContent.trim() || !!jsonError}
                      className="h-7 px-3 text-xs bg-emerald-500/20 hover:bg-emerald-500/30"
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-card/80 backdrop-blur-sm p-3 font-mono text-xs text-foreground/80 border border-border/30 shadow-inner max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words">
                    {typeof part.content === 'string'
                      ? part.content
                      : JSON.stringify(part.content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
