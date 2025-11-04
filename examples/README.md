# Agent Playbook Examples

This directory contains example agents demonstrating how to use Agent Playbook with `pydantic-ai`.

## Running Examples

### Run All Examples

From the root of the repository, you can run all examples at once:

```bash
agent-playbook examples
```

This will discover and load all agents in the examples directory. Then open your browser to `http://localhost:8765` to interact with them in the web playground.

### Run Individual Examples

To run a specific example:

```bash
agent-playbook examples.basic_support
```

### Development Mode

For auto-reload during development:

```bash
agent-playbook examples --reload
```

## Available Examples

### 1. Basic Support Agent (`examples/basic_support`)

A minimal customer support agent demonstrating:
- Basic tool definition and usage
- Dependency injection with typed context
- System prompt customization
- Simple conversational flow

**Complexity:** Minimal
**Run with:** `agent-playbook examples.basic_support`

See [basic_support/README.md](basic_support/README.md) for details.

## Creating Your Own Examples

Each example follows this structure:

```
examples/
└── your_example/
    ├── your_agent__prisim.py    # Agent file with __prisim suffix
    └── README.md                 # Documentation
```

**Key Requirements:**
1. Agent files must end with `__prisim` suffix for auto-discovery
2. Use `export_agent()` from `agent_playbook.export` to register the agent
3. Define dependencies using Pydantic models for type safety
4. Provide at least one dependency configuration

See the [main README](../README.md) for more information on building agents.
