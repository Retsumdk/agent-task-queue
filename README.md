# Agent-Task-Queue

An AI agent task queue for managing and prioritizing tasks for AI agents with retry logic and dependency tracking.

## Features

- Task prioritization with priority levels (1-5)
- Retry logic with exponential backoff
- Dependency tracking (tasks are not completed until dependencies are done)
- Task status tracking (pending, inprogress, done, failed)
- Configurable task expirations
- Task retry and rescheduling

## Installation

```bash
npm install agent-task-queue
```

or

```bash
yarn add agent-task-queue
```

or

```bash
bun add agent-task-queue
```

## Usage

### Build a Task

```bash
task build --name "Create report" --priority 5 --dependencies "report-generator"
task build --name "Generate report" --priority 5
```

### Add Dependency

```bash
task add --name "Report generator" --dependencies "Create report"
task add --name "Delete report" --dependencies "Create report"
```

### Run All Tasks

```bash
task run --all
```

### Check Status

```bash
task status --id <task-id>
task status --all
```

### Dependency Graph

```bash
task graph
```

### Retry Task

```bash
task retry --id <task-id> --max-retries 3
```

## Configuration

The tool can be configured via a config file or environment variables.

### Config File

```json
{
  "queue": ["priority", "first-served"],
  "retry": {
    "max-retries": 3,
    "milliseconds": 5000
  },
  "dependent": {
    "max-parallel": 10
  }
}
```

### Environment Variables

- CONF_QUEUE=path/to/task-queue.json
- KEEP_ANOTHERKEY=your-key-here

## License

MIT License - Author: The BookMaster

The MIT License (MIT) is open full license that allows free use, modification, and distribution of agent-task-queue.

Copyright (c) 2026 The BookMaster. All rights reserved.
