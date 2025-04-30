
import { useState, useEffect } from "react";
import { DataService, Task, Agent, TaskStatus } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart as BarChartIcon, PieChart, Users, CheckCircle2 } from "lucide-react";
import TaskStatusBadge from "@/components/tasks/TaskStatusBadge";
import { format } from "date-fns";

const ReportsPage = () => {
  const { isManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
  useEffect(() => {
    setTasks(DataService.getTasks());
    setAgents(DataService.getAgents());
  }, []);
  
  // Calculate statistics
  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );
  
  const tasksByPriority = tasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  
  const completionRate = tasks.length > 0 
    ? ((tasksByStatus.completed || 0) / tasks.length * 100).toFixed(1) 
    : "0";
  
  const avgTasksPerAgent = agents.length > 0
    ? (tasks.length / agents.length).toFixed(1)
    : "0";
  
  // Get top performing agents (by completed tasks)
  const agentCompletions: Record<string, number> = {};
  tasks.forEach(task => {
    if (task.status === "completed" && task.assignedTo) {
      agentCompletions[task.assignedTo] = (agentCompletions[task.assignedTo] || 0) + 1;
    }
  });
  
  const topAgents = agents
    .map(agent => ({
      ...agent,
      completedTasks: agentCompletions[agent.id] || 0
    }))
    .sort((a, b) => b.completedTasks - a.completedTasks)
    .slice(0, 5);
  
  // Get recently completed tasks
  const recentlyCompletedTasks = tasks
    .filter(task => task.status === "completed")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View performance metrics and task analytics
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks marked as completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgTasksPerAgent} tasks per agent avg
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksByStatus.completed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully finished tasks
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="task-status">
        <TabsList>
          <TabsTrigger value="task-status">Task Status</TabsTrigger>
          <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
          {isManager && <TabsTrigger value="agent-performance">Agent Performance</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="task-status" className="space-y-4">
          <h3 className="text-lg font-medium mt-4">Task Status Distribution</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {["pending", "in-progress", "completed", "on-hold"].map((status) => (
              <Card key={status}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <TaskStatusBadge status={status as TaskStatus} />
                    <span className="text-2xl font-bold">{tasksByStatus[status as TaskStatus] || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <h3 className="text-lg font-medium mt-6">Recently Completed Tasks</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Assigned To</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {recentlyCompletedTasks.map((task) => (
                  <tr key={task.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">{task.description.substring(0, 50)}...</div>
                    </td>
                    <td className="px-4 py-3">{task.assignedToName || "Unassigned"}</td>
                    <td className="px-4 py-3">{format(new Date(task.createdAt), "MMM dd, yyyy")}</td>
                  </tr>
                ))}
                {recentlyCompletedTasks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-muted-foreground">
                      No completed tasks yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="priority" className="space-y-4">
          <h3 className="text-lg font-medium mt-4">Priority Distribution</h3>
          <div className="grid gap-4 grid-cols-3">
            {["high", "medium", "low"].map((priority) => (
              <Card key={priority}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <Badge className={`
                      ${priority === "high" ? "bg-red-100 text-red-800 border-red-300" : 
                        priority === "medium" ? "bg-amber-100 text-amber-800 border-amber-300" : 
                        "bg-blue-100 text-blue-800 border-blue-300"}
                    `}>
                      {priority}
                    </Badge>
                    <span className="text-2xl font-bold">{tasksByPriority[priority] || 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {isManager && (
          <TabsContent value="agent-performance" className="space-y-4">
            <h3 className="text-lg font-medium mt-4">Top Performing Agents</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Agent</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total Tasks</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Completed Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgents.map((agent) => (
                    <tr key={agent.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.email}</div>
                      </td>
                      <td className="px-4 py-3">{agent.department}</td>
                      <td className="px-4 py-3">{agent.tasksAssigned}</td>
                      <td className="px-4 py-3">{agent.completedTasks}</td>
                    </tr>
                  ))}
                  {topAgents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground">
                        No agent data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
