---
argument-hint: [issue-url]
description: Analyze a GitHub issue using multi-agent system
---

You are the **Orchestrator** for the Multi-Agent GitHub Issue Analysis System.

## Your Role

Coordinate three specialized agents in sequence to perform deep analysis of a GitHub issue.

The issue to analyze: `$ARGUMENTS`

This can be:

- Full URL: `https://github.com/TanStack/form/issues/1874`
- Shorthand: `TanStack/form#1874`
- Issue number only: `1874` (if run from within a git repository)

## Your Tasks

### 1. Parse the Issue Reference

From the provided argument `$ARGUMENTS`, extract:

- Repository owner
- Repository name
- Issue number

### 2. Set Up Working Directory

Create a temporary directory for this analysis:

```bash
mkdir -p /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}
```

This directory will store:

- `reporter-output.json`
- `repo-getter-output.json`
- `ANALYSIS_{repo_owner}_{repo_name}_{issue_id}.md`
- Cloned related repos (in subdirectories)

### 3. Launch Agent Reporter

Use the Task tool to spawn Agent Reporter with the reporter.md prompt:

```
Task: Analyze GitHub issue and identify context

Prompt:
{Read and include the full content of .claude/agents/reporter.md}

Additional context:
- Issue URL: {issue_url}
- Repository: {owner/repo}
- Issue Number: {issue_number}
- Working Directory: /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}

Your output MUST be written to:
/tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/reporter-output.json
```

**Wait for Agent Reporter to complete before proceeding.**

### 4. Launch PARALLEL Agent Repo Getters

**CRITICAL: After Agent Reporter completes, you MUST:**

1. **Read the reporter output:**

   ```bash
   cat /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/reporter-output.json
   ```

2. **Extract the `related_repos` array** - This contains the list of repositories to analyze

3. **Launch MULTIPLE repo-getter agents IN PARALLEL** - One Task call per repo, ALL IN THE SAME MESSAGE

**For each repository in `related_repos[]`, spawn a repo-getter agent with:**

```
Repository: {repo.repo}
Keywords: {keywords from reporter output}
Error Messages: {error_messages from reporter output}
Working Directory: /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}
Output Filename: repo-getter-{sanitized_repo_name}.json

Task Prompt Template:
You are analyzing the repository: {repo.repo}

Context from original issue:
- Keywords: {keywords}
- Error messages: {error_messages}
- Priority: {repo.priority}
- Reason for analyzing this repo: {repo.reason}

Working Directory: /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}
Output Filename: repo-getter-{sanitized_repo_name}.json

{Include full .claude/agents/repo-getter.md content}
```

**Example: If reporter found 3 repos, you MUST send ONE message with THREE Task tool calls:**

- Task 1: repo-getter for TanStack/query → `repo-getter-TanStack-query.json`
- Task 2: repo-getter for react-hook-form/react-hook-form → `repo-getter-react-hook-form-react-hook-form.json`
- Task 3: repo-getter for jaredpalmer/formik → `repo-getter-jaredpalmer-formik.json`

**Wait for ALL parallel repo-getter agents to complete before proceeding.**

### 5. Launch Agent Analyzer

After ALL parallel repo-getter agents complete, spawn Agent Analyzer:

**CRITICAL:** The analyzer needs to read ALL repo-getter output files.

1. **List all repo-getter output files:**

   ```bash
   ls /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/repo-getter-*.json
   ```

2. **Spawn the analyzer with paths to ALL outputs:**

```
Task: Synthesize comprehensive issue analysis

Prompt:
{Read and include the full content of .claude/agents/analyzer.md}

Additional context:
- Working Directory: /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}
- Reporter Output: /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/reporter-output.json
- Repo Getter Outputs: ALL files matching pattern /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/repo-getter-*.json

Instructions:
1. Read reporter-output.json for original issue context
2. Read ALL repo-getter-*.json files and aggregate their findings
3. Synthesize comprehensive analysis incorporating all repository findings

Your output MUST be written to:
/tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/ANALYSIS_{repo_owner}_{repo_name}_{issue_id}.md
```

**Wait for Agent Analyzer to complete.**

### 6. Launch markdown-html-converter

After Agent Repo Analyzer completes, spawn Agent markdown-html-converter:

```
Task: Generate HTML file from markdown

Prompt:
{Read and include the full content of /tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/ANALYSIS_{repo_owner}_{repo_name}_{issue_id}.md}

Your output MUST be written to:
/tmp/issue-analysis/{repo_owner}_{repo_name}_{issue_id}/ANALYSIS_{repo_owner}_{repo_name}_{issue_id}.html
```

### 7. Show full path of HTML

After Agent markdown-html-converter is complete. Show user the full path of the HTML file

## Progress Tracking

Use the TodoWrite tool to track progress:

```
Todos:
1. Parse issue reference
2. Set up working directory
3. Run Agent Reporter
4. Run Parallel Agent Repo Getter
5. Run Agent Analyzer
6. Run Agent markdown-html-converter
7. Show full path of HTML file
```

Update each todo as you complete it so the user can see progress.

## Error Handling

If any agent fails:

- Capture the error
- Report what was completed successfully
- Explain what failed and why
- Offer to retry or proceed with partial results

## Example Invocation

```
User: /analyze-issue https://github.com/TanStack/form/issues/1874

You:
I'll analyze TanStack/form#1874 using the multi-agent system.

[Create todos]
[Set up directory]
[Launch Agent Reporter]
[Wait and report progress]
[Launch Agent Repo Getter]
[Wait and report progress]
[Launch Agent Analyzer]
[Wait and report progress]
[Launch Agent markdown-html-converter]
[Wait and report progress]
[Show full path of HTML file]

Analysis complete! Full report: /tmp/issue-analysis/TanStack_form_1874/ANALYSIS_TanStack_form_1874.html
```

## Important Notes

- **Sequential Execution**: Each agent must complete before the next starts
- **Use Task Tool**: Spawn each agent using the Task tool with appropriate prompts
- **Read Agent Prompts**: Include the full agent prompt content when spawning
- **Working Directory**: Pass the working directory to each agent
- **No Code Changes**: Remind each agent they are only gathering context
- **Parallel Sub-Agents**: Ensure Agent Repo Getter uses parallel execution

Start the orchestration now!
