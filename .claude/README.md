# Multi-Agent GitHub Issue Analysis System

A sophisticated multi-agent system for deep analysis of GitHub issues, providing comprehensive context without making code changes.

## Overview

This system uses specialized agents working in a coordinated pipeline to analyze GitHub issues:

1. **Agent Reporter** (1 instance) - Analyzes the issue and identifies related repositories
2. **Agent Repo Getter** (N instances in PARALLEL) - Each fetches context from ONE related repo
3. **Agent Analyzer** (1 instance) - Synthesizes everything into a comprehensive markdown report

**Key Feature:** The orchestrator launches MULTIPLE repo-getter agents in PARALLEL (one per repository), maximizing analysis speed.

## Quick Start

### Using the Slash Command

```bash
/analyze-issue https://github.com/TanStack/form/issues/1874
```

Or shorthand:

```bash
/analyze-issue TanStack/form#1874
```

### What Happens

1. Creates a working directory: `/tmp/issue-analysis/{repo}_{issue}/`
2. Agent Reporter analyzes the issue → `reporter-output.json`
3. **PARALLEL**: Multiple Agent Repo Getters (one per repo) → `repo-getter-*.json` files
4. Agent Analyzer aggregates and creates final report → `ANALYSIS_{repo}_{issue}.md`

**Example:** If Reporter finds 3 related repos, the orchestrator launches 3 repo-getter agents in parallel, each outputting to a separate JSON file.

## Directory Structure

```
.claude/
├── README.md                          # This file
├── agents/
│   ├── reporter.md                    # Agent Reporter prompt
│   ├── repo-getter.md                 # Agent Repo Getter prompt
│   └── analyzer.md                    # Agent Analyzer prompt
├── commands/
│   └── analyze-issue.md               # Slash command orchestrator
├── schemas/
│   ├── reporter-output.schema.json    # Reporter output schema
│   ├── repo-getter-output.schema.json # Repo Getter output schema
│   └── analysis-config.schema.json    # Configuration schema
└── scripts/
    └── (Future: CLI scripts)
```

## Agent Architecture

### Agent Reporter

**Purpose:** Deep-dive the source issue and build initial context

**Inputs:** GitHub issue URL

**Outputs:** `reporter-output.json`

**Key Tasks:**

- Fetch issue details via `gh` CLI
- Search current repo for relevant code
- Identify related repositories
- Extract keywords for cross-repo searching
- Find similar issues (open and closed)

**Output Format:**

```json
{
  "issue_id": "1874",
  "repo": "TanStack/form",
  "summary": "...",
  "error_messages": ["..."],
  "related_repos": [
    {
      "repo": "owner/repo",
      "reason": "Why relevant",
      "priority": "high|medium|low"
    }
  ],
  "current_repo_context": {
    "relevant_files": ["..."],
    "similar_issues": ["..."],
    "recent_changes": ["..."]
  },
  "keywords": ["..."]
}
```

### Agent Repo Getter

**Purpose:** Analyze a SINGLE external repository for context

**Inputs:**

- Specific repository to analyze (e.g., "TanStack/query")
- Keywords from reporter output
- Error messages to search for

**Outputs:** `repo-getter-{sanitized-repo-name}.json`

**Key Tasks:**

- Clone the specified repository (shallow clone)
- Search for keywords and error patterns
- Identify relevant files and documentation
- Find similar issues in this repo
- Document integration points and patterns

**Parallel Execution:**

- The orchestrator launches MULTIPLE instances of this agent
- Each instance analyzes ONE repository
- All instances run in PARALLEL for maximum speed

**Output Format (per repo-getter instance):**

```json
{
  "repo": "TanStack/query",
  "status": "success",
  "relevant_files": [
    {
      "path": "src/types.ts",
      "reason": "Contains type definitions for async validators",
      "lines_of_interest": [45, 67, 89]
    }
  ],
  "similar_issues": [
    {
      "number": 234,
      "title": "Async validation not working",
      "state": "closed",
      "resolution_summary": "Fixed by adding Promise wrapper"
    }
  ],
  "integration_points": ["Exports useQuery hook used in form validation"],
  "key_patterns": ["All async operations wrapped in Promise.resolve()"]
}
```

### Agent Analyzer

**Purpose:** Synthesize all context into comprehensive analysis

**Inputs:**

- `reporter-output.json`
- ALL `repo-getter-*.json` files (one per analyzed repository)

**Outputs:** `ANALYSIS_{repo_owner}_{repo_name}_{issue_id}.md`

**Critical:** The analyzer reads and aggregates findings from MULTIPLE repo-getter output files.

**Key Tasks:**

- Load all context from previous agents
- Perform root cause investigation
- Cross-repository analysis
- Historical git analysis
- Pattern recognition across ecosystem
- Hypothesis formation
- Solution vector identification

**Output:** Comprehensive markdown report with:

- Executive summary
- Technical context
- Root cause analysis
- Historical timeline
- Similar patterns
- Potential solution vectors
- Recommendations

## Example Workflow

```bash
# User runs the slash command
/analyze-issue https://github.com/TanStack/form/issues/1874

# Orchestrator starts
Creating working directory: /tmp/issue-analysis/TanStack_form_1874/

# Agent Reporter runs
Analyzing TanStack/form#1874...
✓ Fetched issue details
✓ Found 3 error messages
✓ Identified 5 relevant files
✓ Found 4 related repos
✓ Extracted 12 keywords
Output: reporter-output.json

# Orchestrator launches PARALLEL repo-getters
Launching 3 repo-getter agents in PARALLEL...
✓ repo-getter[TanStack/query] → repo-getter-TanStack-query.json (3 files found)
✓ repo-getter[react-hook-form/react-hook-form] → repo-getter-react-hook-form-react-hook-form.json (5 files found)
✓ repo-getter[jaredpalmer/formik] → repo-getter-jaredpalmer-formik.json (2 files found)
All parallel agents completed!

# Agent Analyzer runs
Synthesizing analysis...
✓ Read 23 total files
✓ Analyzed 5 commits
✓ Formed 2 hypotheses
✓ Identified 3 solution vectors
Output: ANALYSIS_TanStack_form_1874.md

# Final report
Analysis complete!
Path: /tmp/issue-analysis/TanStack_form_1874/ANALYSIS_TanStack_form_1874.md

Key Findings:
- Root cause: Missing type guard for sync vs async validators
- Similar issue resolved in react-hook-form#234
- Recommended: Add Promise.resolve() wrapper with TypeScript overloads

Would you like to view the full analysis?
```

## Configuration

Configuration can be customized by editing the agent prompts or creating a config file.

**Default Settings:**

- Max related repos: 5
- Git clone depth: 1 (shallow)
- Include closed issues: true
- Output format: markdown

## Requirements

**GitHub CLI:**

```bash
gh --version  # Must be authenticated
```

**Tools Used:**

- `gh` - GitHub CLI for API access
- `git` - Git operations
- `grep`/`rg` - Code searching (via Grep tool)
- Claude Code tools: Task, Read, Glob, Grep, Bash

## Output Structure

```
/tmp/issue-analysis/TanStack_form_1874/
├── reporter-output.json                              # Agent Reporter results
├── repo-getter-TanStack-query.json                   # Repo Getter 1 results
├── repo-getter-react-hook-form-react-hook-form.json  # Repo Getter 2 results
├── repo-getter-jaredpalmer-formik.json              # Repo Getter 3 results
├── ANALYSIS_TanStack_form_1874.md                   # Final analysis
└── /tmp/analysis-repos/                             # Cloned repositories
    ├── TanStack-query/
    ├── react-hook-form-react-hook-form/
    └── jaredpalmer-formik/
```

## Best Practices

1. **Use Full GitHub URLs:** Easier to parse than shorthand
2. **Check GitHub Rate Limits:** Each analysis makes multiple API calls
3. **Review Agent Outputs:** Check JSON files if analysis seems incomplete
4. **Clean Up Temp Files:** `/tmp/issue-analysis/` can grow large
5. **Customize Agent Prompts:** Edit `.claude/agents/*.md` to tune behavior

## Extending the System

### Add a New Agent

1. Create prompt: `.claude/agents/your-agent.md`
2. Define output schema: `.claude/schemas/your-agent-output.schema.json`
3. Update orchestrator: `.claude/commands/analyze-issue.md`

### Customize Agent Behavior

Edit the agent prompts in `.claude/agents/`:

- Add new tools or capabilities
- Change search strategies
- Modify output formats
- Add quality checks

### Add Configuration Options

Create `.claude/config/analysis-config.json`:

```json
{
  "max_related_repos": 10,
  "shallow_clone_depth": 1,
  "parallel_execution": true,
  "enable_web_search": true
}
```

## Troubleshooting

### Agent Not Finding Related Repos

- Check `reporter-output.json` - are `related_repos[]` populated?
- Review the issue description - does it mention dependencies?
- Manually edit `reporter-output.json` to add repos

### Repo Getter Timing Out

- Check GitHub rate limits: `gh api rate_limit`
- Reduce `max_related_repos` in config
- Some repos may be large - consider increasing timeout

### Analysis Missing Context

- Review both JSON outputs
- Check if relevant files were identified
- Manually add file paths to JSON before running Analyzer
- Re-run specific agents with updated inputs

### Parallel Agents Not Running

- Ensure Task tool is being called multiple times in one message
- Check if error occurred in first agent blocking others
- Review `fetch_errors[]` in repo-getter-output.json

## Performance

**Typical Analysis Time:**

- Agent Reporter: 30-60 seconds
- Agent Repo Getter: 1-3 minutes (parallel)
- Agent Analyzer: 2-5 minutes

**Total:** ~5-10 minutes for most issues

**Factors Affecting Speed:**

- Number of related repos
- Size of repositories
- Number of similar issues found
- GitHub API rate limits

## Privacy & Security

- All analysis is local (cloned to `/tmp/`)
- No data sent to external services (except GitHub API)
- Temp files can be deleted after analysis
- No code modifications are made

## Limitations

- **Read-Only:** No code changes or PR creation
- **Public Repos Only:** Can't access private repos without auth
- **GitHub-Specific:** Only works with GitHub issues
- **Rate Limits:** Subject to GitHub API rate limits
- **Context Window:** Very large repos may hit token limits

## Future Enhancements

- [ ] Support for GitLab and Bitbucket
- [ ] Integration with issue tracking systems
- [ ] Automated solution proposal (opt-in)
- [ ] Web UI for viewing analyses
- [ ] Cache system for frequently accessed repos
- [ ] Comparative analysis across multiple issues
- [ ] Integration with CI/CD for automatic analysis

## Contributing

To improve the system:

1. Edit agent prompts for better results
2. Add new agents for specialized analysis
3. Create configuration presets for common scenarios
4. Add validation for agent outputs
5. Improve error handling and recovery

## License

MIT

## Support

For issues with the multi-agent system:

1. Check agent output JSON files for errors
2. Review agent prompts for accuracy
3. Validate GitHub CLI authentication
4. Check system requirements (disk space, rate limits)

---

**Built with Claude Code**
Multi-Agent Architecture for Deep GitHub Issue Analysis
