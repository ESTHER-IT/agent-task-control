
export type TaskStatus = "pending" | "in-progress" | "completed" | "on-hold";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null;
  assignedToName?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  dueDate: Date | null;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: string[];
  tasksAssigned: number;
}

// Mock data service
export class DataService {
  static tasks: Task[] = [
    {
      id: "t1",
      title: "Process customer refund request",
      description: "Review the refund request #1234 and process it according to policy.",
      assignedTo: "a1",
      assignedToName: "John Smith",
      status: "pending",
      priority: "medium",
      createdAt: new Date("2025-04-26"),
      dueDate: new Date("2025-05-02"),
    },
    {
      id: "t2",
      title: "Update customer contact information",
      description: "Update phone and address for customer ID 5678.",
      assignedTo: "a2",
      assignedToName: "Jane Doe",
      status: "in-progress",
      priority: "low",
      createdAt: new Date("2025-04-25"),
      dueDate: new Date("2025-04-30"),
    },
    {
      id: "t3",
      title: "Respond to escalated support ticket",
      description: "Customer complaint needs urgent manager review.",
      assignedTo: "a1",
      assignedToName: "John Smith",
      status: "on-hold",
      priority: "high",
      createdAt: new Date("2025-04-23"),
      dueDate: new Date("2025-04-28"),
    },
    {
      id: "t4",
      title: "Process new account application",
      description: "Verify documentation and approve or reject application #ACCT-9876.",
      assignedTo: "a3",
      assignedToName: "Alice Johnson",
      status: "completed",
      priority: "medium",
      createdAt: new Date("2025-04-20"),
      dueDate: new Date("2025-04-25"),
    },
    {
      id: "t5",
      title: "Update product documentation",
      description: "Revise user guide for product version 2.0",
      assignedTo: null,
      status: "pending",
      priority: "medium",
      createdAt: new Date("2025-04-27"),
      dueDate: new Date("2025-05-05"),
    }
  ];

  static agents: Agent[] = [
    {
      id: "a1",
      name: "John Smith",
      email: "john.smith@example.com",
      department: "Customer Support",
      skills: ["Refunds", "Complaints", "Account Management"],
      tasksAssigned: 2
    },
    {
      id: "a2",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      department: "Data Entry",
      skills: ["Data Processing", "Verification"],
      tasksAssigned: 1
    },
    {
      id: "a3",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      department: "Account Processing",
      skills: ["Verification", "Approvals", "Documentation"],
      tasksAssigned: 1
    }
  ];

  // Task methods
  static getTasks(): Task[] {
    return this.tasks;
  }

  static getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  static getTasksByAgentId(agentId: string): Task[] {
    return this.tasks.filter(task => task.assignedTo === agentId);
  }

  static addTask(task: Omit<Task, "id" | "createdAt">): Task {
    const newTask: Task = {
      ...task,
      id: `t${this.tasks.length + 1}`,
      createdAt: new Date()
    };
    
    this.tasks.push(newTask);
    if (newTask.assignedTo) {
      const agent = this.getAgentById(newTask.assignedTo);
      if (agent) {
        agent.tasksAssigned += 1;
      }
    }
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    // Handle agent reassignment
    if (updates.assignedTo !== undefined && updates.assignedTo !== this.tasks[index].assignedTo) {
      // Decrement previous agent's count if there was one
      if (this.tasks[index].assignedTo) {
        const prevAgent = this.getAgentById(this.tasks[index].assignedTo!);
        if (prevAgent) {
          prevAgent.tasksAssigned = Math.max(0, prevAgent.tasksAssigned - 1);
        }
      }
      
      // Increment new agent's count if there is one
      if (updates.assignedTo) {
        const newAgent = this.getAgentById(updates.assignedTo);
        if (newAgent) {
          newAgent.tasksAssigned += 1;
          updates.assignedToName = newAgent.name;
        }
      } else {
        updates.assignedToName = undefined;
      }
    }

    const updatedTask = {
      ...this.tasks[index],
      ...updates
    };
    
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  static deleteTask(id: string): boolean {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) return false;

    // Decrement agent's task count
    const task = this.tasks[index];
    if (task.assignedTo) {
      const agent = this.getAgentById(task.assignedTo);
      if (agent) {
        agent.tasksAssigned = Math.max(0, agent.tasksAssigned - 1);
      }
    }

    this.tasks.splice(index, 1);
    return true;
  }

  // Agent methods
  static getAgents(): Agent[] {
    return this.agents;
  }

  static getAgentById(id: string): Agent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  static addAgent(agent: Omit<Agent, "id" | "tasksAssigned">): Agent {
    const newAgent: Agent = {
      ...agent,
      id: `a${this.agents.length + 1}`,
      tasksAssigned: 0
    };
    
    this.agents.push(newAgent);
    return newAgent;
  }

  static updateAgent(id: string, updates: Partial<Omit<Agent, "tasksAssigned">>): Agent | null {
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index === -1) return null;
    
    this.agents[index] = {
      ...this.agents[index],
      ...updates
    };
    return this.agents[index];
  }

  static deleteAgent(id: string): boolean {
    // Check if agent has tasks assigned
    const hasAssignedTasks = this.tasks.some(task => task.assignedTo === id);
    if (hasAssignedTasks) return false;
    
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index === -1) return false;
    
    this.agents.splice(index, 1);
    return true;
  }
}
