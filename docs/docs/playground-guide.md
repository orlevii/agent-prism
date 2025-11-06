# Using the Playground

The Agent Playbook playground is a web interface for testing and debugging your agents.

## Opening the Playground

After running `agent-playbook my_package`, open **http://localhost:8000** in your browser.

## Main Interface

The playground has three main sections:

### 1. Agent Selector (Top Left)

**Select your agent:**
- Dropdown showing all available agents
- Change agents to test different ones without restarting

**Select a scenario:**
- Dropdown showing available scenarios for the selected agent
- Each scenario has its own dependencies/configuration
- Switching scenarios doesn't lose your conversation

### 2. Chat Area (Center)

**Send messages:**
- Type in the input box at the bottom
- Press Enter or click Send to submit

**View responses:**
- See agent thinking (expandable)
- View tool calls with their parameters
- See tool results
- Read the final response

### 3. Settings Sidebar (Right)

**Customize agent behavior:**
- Edit settings as JSON
- Settings are sent with each message

## Working with Messages

### Message Components

Each message shows:
- **Thinking** — Agent's internal reasoning (click to expand)
- **Tool Calls** — Tools the agent executed with arguments
- **Tool Results** — Output from tools
- **Text Response** — Final response to your message

### Edit & Regenerate

You can modify the conversation at any point:

1. **Edit a message** — Click the edit icon on any message
2. **Modify text** — Change what was said
3. **Regenerate** — The agent will continue from that point with a new response

This is useful for:
- Testing different variations of messages
- Recovering from mistakes
- Exploring alternative paths through the conversation

### Clear History

Start a fresh conversation:
- Click the "Clear" or "New Chat" button
- Conversation history is cleared
- Settings are preserved

## Understanding Tool Calls

When your agent calls a tool, you'll see:

```
🔧 check_order_status
├── order_id: "12345"
└── Result: "Order is being processed"
```

The playground shows:
- ✅ Tool name
- ✅ All parameters sent to the tool
- ✅ The result returned by the tool

## Adjusting Settings

Each agent can have settings (configured via dependencies):

```json
{
  "api_key": "sk-123...",
  "model": "gpt-4",
  "temperature": 0.7
}
```

Edit the settings:
1. Click the Settings panel on the right
2. Modify the JSON
3. Changes apply to the next message

## Pro Tips

1. **Expand thinking** — Click "Thinking" sections to see agent reasoning
2. **Copy tool parameters** — Hover over tool calls to copy parameters
3. **Change scenarios mid-conversation** — Test the same query with different configs
4. **Use message editing** — Iterate on prompts without losing context
5. **Settings JSON** — Update any dependency value without restarting

## Troubleshooting

**Settings not applying**
- Make sure JSON is valid
- Settings are applied to the next message, not retroactively

**Tool calls not showing results**
- Check that your tool implementation returns a value
- Tool results appear in the "Tool Result" section

**Agent not responding**
- Check browser console for errors
- Ensure your agent's model is properly configured
- Check API keys in settings
