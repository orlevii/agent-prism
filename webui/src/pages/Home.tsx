import ChatInterface from '../components/Playground/ChatInterface';
import ChatInput from '../components/Playground/ChatInput';
import SettingsSidebar from '../components/Playground/SettingsSidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useChat } from '../hooks/useChat';
import { useSettings } from '../hooks/useSettings';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { settings, updateSetting } = useSettings();
  const {
    messages,
    isLoading,
    error,
    awaitingApprovals,
    pendingTools,
    allHandled,
    sendMessage,
    clearMessages,
    cancelRequest,
    continueWithApprovals,
    handleApprove,
    handleReject,
    handleMock,
  } = useChat();

  const handleSend = (content: string) => {
    sendMessage(content, settings);
  };

  const handleContinue = () => {
    continueWithApprovals(settings);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-10 bg-card border-b border-border/50 px-8 py-5 shadow-sm">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-violet-500 bg-clip-text text-transparent">
              Agent Prism
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Interactive testing for pydantic-ai agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={clearMessages}
              variant="outline"
              size="sm"
              className="hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            >
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            messages={messages}
            error={error}
            isLoading={isLoading}
            awaitingApprovals={awaitingApprovals}
            pendingTools={pendingTools}
            allHandled={allHandled}
            onContinueWithApprovals={handleContinue}
            onApprove={handleApprove}
            onReject={handleReject}
            onMock={handleMock}
          />
          <ChatInput onSend={handleSend} isLoading={isLoading} onCancel={cancelRequest} />
        </div>

        {/* Settings Sidebar */}
        <SettingsSidebar settings={settings} onUpdateSetting={updateSetting} />
      </div>
    </div>
  );
}
