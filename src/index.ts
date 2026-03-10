#!/usr/bin/env node

interface Task {
  id: string;
  name: string;
  priority: number;
  status: "pending" | "inprogress" | "done" | "failed";
  dependencies: string[];
  retries: number;
  maxRetries: number;
  createdAt: number;
}

class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private taskCounter = 0;

  add(name: string, priority: number = 3, dependencies: string[] = [], maxRetries: number = 3): Task {
    const id = `task-${++this.taskCounter}`;
    const task: Task = {
      id,
      name,
      priority,
      status: "pending",
      dependencies,
      retries: 0,
      maxRetries,
      createdAt: Date.now(),
    };
    this.tasks.set(id, task);
    return task;
  }

  run(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) {
      console.error(`Task ${id} not found`);
      return undefined;
    }

    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== "done") {
        console.error(`Dependency ${depId} not satisfied for task ${id}`);
        return undefined;
      }
    }

    task.status = "inprogress";
    console.log(`Running task ${id}: ${task.name}`);
    return task;
  }

  complete(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.status = "done";
    return task;
  }

  fail(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.retries++;
    if (task.retries < task.maxRetries) {
      task.status = "pending";
      console.log(`Task ${id} failed, retry ${task.retries}/${task.maxRetries}`);
    } else {
      task.status = "failed";
      console.log(`Task ${id} failed permanently after ${task.maxRetries} retries`);
    }
    return task;
  }

  status(id?: string): void {
    if (id) {
      const task = this.tasks.get(id);
      if (task) {
        console.log(JSON.stringify(task, null, 2));
      } else {
        console.log(`Task ${id} not found`);
      }
      return;
    }

    console.log("\n=== All Tasks ===");
    for (const task of this.tasks.values()) {
      console.log(`[${task.status.toUpperCase()}] ${task.id}: ${task.name} (priority: ${task.priority})`);
      if (task.dependencies.length > 0) {
        console.log(`  Dependencies: ${task.dependencies.join(", ")}`);
      }
    }
    console.log("");
  }

  graph(): void {
    console.log("\n=== Task Dependency Graph ===");
    for (const task of this.tasks.values()) {
      const deps = task.dependencies.length > 0 
        ? ` -> [${task.dependencies.join(", ")}` 
        : "";
      console.log(`${task.id} [${task.priority}]${deps}`);
    }
    console.log("");
  }

  retry(id: string, maxRetries: number = 3): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.retries = 0;
    task.maxRetries = maxRetries;
    task.status = "pending";
    return task;
  }
}

const queue = new TaskQueue();

import { Command } from "commander";

const program = new Command();

program
  .name("task")
  .description("AI Agent Task Queue CLI")
  .version("1.0.0");

program
  .command("build")
  .description("Create a new task")
  .requiredOption("-n, --name <name>", "Task name")
  .option("-p, --priority <priority>", "Priority (1-5)", "3")
  .option("-d, --dependencies <deps>", "Comma-separated dependencies")
  .action((options) => {
    const deps = options.dependencies 
      ? options.dependencies.split(",").map((d: string) => d.trim())
      : [];
    const task = queue.add(options.name, parseInt(options.priority), deps);
    console.log(`Created task ${task.id}: ${task.name}`);
  });

program
  .command("run")
  .description("Run a task")
  .option("-a, --all", "Run all pending tasks")
  .argument("[id]", "Task ID")
  .action((id: string | undefined, options) => {
    if (options.all) {
      for (const task of queue["tasks"].values()) {
        if (task.status === "pending") {
          queue.run(task.id);
        }
      }
    } else if (id) {
      queue.run(id);
    }
  });

program
  .command("complete")
  .description("Mark a task as complete")
  .argument("<id>", "Task ID")
  .action((id: string) => {
    queue.complete(id);
  });

program
  .command("status")
  .description("Check task status")
  .argument("[id]", "Task ID (optional)")
  .action((id: string | undefined) => {
    queue.status(id);
  });

program
  .command("graph")
  .description("Show task dependency graph")
  .action(() => {
    queue.graph();
  });

program
  .command("retry")
  .description("Retry a failed task")
  .argument("<id>", "Task ID")
  .option("-m, --max-retries <count>", "Max retries", "3")
  .action((id: string, options) => {
    queue.retry(id, parseInt(options.maxRetries));
  });

program.parse();
