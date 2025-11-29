---
marp: true
theme: default
paginate: true
---

# Creating a Multi-Agent Flow

Building specialized AI agents that work together

<br />
<br />

> Jhonatan Salazar
> <small><em> SacTech '25 </em></small>

---

## What We'll Cover

1. What "Agents" actually are
2. How we use agents today & their limitations
3. Building your own custom agents
4. Specialized agents working independently
5. The power of multi-agent flows

---

# What do Software Engineers actually do?

---

<style>
img[alt~="center"] {
  display: block;
  margin: 0 auto;
}
</style>

![w:600 center](./software-engineer.png)

---

![w:950](./software-engineer-2.png)

---

# Agents can help my team align rapidly

---

# What is an Agent?

---

<style>
img[alt~="center"] {
  display: block;
  margin: 0 auto;
}
</style>

![w:640 center](./pass-butter.gif)

---

# An agent is an AI system that can:

- Understand a goal or task
- Make decisions about how to accomplish it
- Use tools to interact with the world
- Iterate until the task is complete

Think: **AI + Tools (Fetch, WebSearch, MCP) + Autonomy**

---

# Agents in the Wild

### Tools You're Already Using

All of these are **single-agent systems**

- **ChatGPT (Web)**: Conversational interface + plugins/actions
- **Claude (Web)**: Conversational interface + plugins/actions
- **Cursor**: Code completion + context-aware edits

All of these are **multi-agent systems**

- **Claude Code**: Long-context reasoning + tool use
- **Cursor (Agent Mode)**: Context-aware edits + tool use

---

# Single-Agent Systems

![Unidirectional](./unidirectional.png)

---

# The Single-Agent Problem

One agent trying to do everything:

- Same reasoning approach for different tasks
- No task-specific optimization

<br />

### Jack of all trades, master of none

---

![w:1200 bg](./agent-problem.png)

---

# Build your own Custom Agents

---

## Building Custom Agents

### Using Claude's `/agent` Command

Create specialized agents with:

- Custom system prompts
- Specific tool sets
- Defined output formats
- Task-focused behavior

---

## Building Custom Agents

### Example: Creating a Specialized Agent

```bash
/agent create context-gatherer
```

Define its purpose:

- Searches codebase for relevant context
- Understands project structure
- Outputs structured summaries
- Focused only on information gathering

---

## Specialized Agents Working Independently

Each agent has a **single responsibility**:

1. **Context Gatherer**: Finds relevant code and docs
2. **Repo Finder**: Locates specific files and patterns
3. **Analyzer**: Deep analysis of code quality

Each can be used standalone or together

---

## The Context Gatherer

**Purpose**: Find relevant context for a task

**Input**: User query or task description
**Process**:

- Search codebase
- Identify relevant files
- Extract key information
  **Output**: Structured context summary

---

## The Repo Finder

**Purpose**: Locate specific files and patterns

**Input**: Search criteria (functions, classes, patterns)
**Process**:

- Navigate repository structure
- Pattern matching
- Dependency analysis
  **Output**: File paths and code snippets

---

## The Analyzer

**Purpose**: Deep code analysis

**Input**: Code from Context Gatherer and Repo Finder
**Process**:

- Quality assessment
- Identify issues
- Suggest improvements
  **Output**: Detailed analysis report

---

## Multi-Agent Flow in Action

### The Power of Orchestration

```
User Query
    ↓
Context Gatherer (finds relevant code)
    ↓
Repo Finder (locates specific implementations)
    ↓
Analyzer (provides deep analysis)
    ↓
Comprehensive Result
```

---

## Multi-Agent Flow in Action

### Why This Works

Each agent:

- Specializes in one thing
- Produces optimized output for its task
- Passes structured data to the next agent

**Result**: Better than any single agent could achieve

---

## Demo Time

Let's see the multi-agent flow in action:

1. Create three specialized agents
2. Run them independently
3. Orchestrate them together
4. Compare vs single-agent approach

---

## Key Takeaways

1. Single agents have inherent limitations
2. Specialization beats generalization
3. Custom agents are easier to build than you think
4. Multi-agent flows unlock new capabilities
5. You can start building today

---

## Getting Started

1. Try Claude's `/agent` command
2. Start with one specialized agent
3. Build more as you find use cases
4. Experiment with orchestration
5. Share what you learn

---

## Questions?

**Resources**:

- Claude documentation: anthropic.com/docs
- Examples: [your repo link]

Thank you!
