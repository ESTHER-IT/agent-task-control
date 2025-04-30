
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataService, Task, TaskStatus } from "@/lib/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CheckCircle, Clock, AlertTriangle, UserRound } from "lucide-react";

import TaskList from "@/components/tasks/TaskList";

interface StatusCount {
  status: TaskStatus;
  count: number;
}

interface PriorityCount {
  priority: "high" | "medium" | "low";
  count: number;
}

const DashboardPage = () => {
  const { user, isManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [priorityCounts, setPriorityCounts] = useState<PriorityCount[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Fetch tasks based on user role
    let fetchedTasks: Task[];
    
    // Debug log to see what user ID is being used
    console.log("Current user:", user);
    
    if (isManager) {
      fetchedTasks = DataService.getTasks();
    } else {
      // For agents, we need to ensure we're using the correct ID format
      // The AuthContext user.id for agents should be "a1", "a2", etc.
      fetchedTasks = DataService.getTasksByAgentId(user?.id || "");
      console.log("Tasks fetched for agent:", fetchedTasks);
    }
    
    setTasks(fetchedTasks);
    
    // Calculate metrics
    const statusMap = new Map<TaskStatus, number>();
    const priorityMap = new Map<string, number>();
    
    fetchedTasks.forEach(task => {
      // Count by status
      statusMap.set(task.status, (statusMap.get(task.status) || 0) + 1);
      
      // Count by priority
      priorityMap.set(task.priority, (priorityMap.get(task.priority) || 0) + 1);
    });
    
    // Convert to arrays for display
    const statusArray: StatusCount[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count })
    );
    
    const priorityArray: PriorityCount[] = Array.from(priorityMap.entries()).map(
      ([priority, count]) => ({ priority: priority as "high" | "medium" | "low", count })
    );
    
    setStatusCounts(statusArray);
    setPriorityCounts(priorityArray);
    
    // Get 5 most recent tasks
    const recent = [...fetchedTasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentTasks(recent);
  }, [user, isManager]);

  // Count overdue tasks
  const overdueTasks = tasks.filter(
    task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          {isManager 
            ? "Here's an overview of your team's tasks and performance" 
            : "Here's an overview of your tasks and status"}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isManager ? "Across all agents" : "Assigned to you"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.find(s => s.status === "completed")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(((statusCounts.find(s => s.status === "completed")?.count || 0) / tasks.length) * 100) || 0}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.find(s => s.status === "in-progress")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueTasks.length > 0 ? "Require immediate attention" : "Everything's on track!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!isManager && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned By</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="text-sm">
                {/* Display manager assignment info for agents */}
                <p>Your tasks were assigned by a project manager.</p>
                {/* This could be enhanced with actual manager name if available in your data model */}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Tasks</TabsTrigger>
          <TabsTrigger value="priority">High Priority</TabsTrigger>
          {overdueTasks.length > 0 && (
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="recent">
          <TaskList tasks={recentTasks} />
        </TabsContent>
        <TabsContent value="priority">
          <TaskList 
            tasks={tasks.filter(task => task.priority === "high")} 
          />
        </TabsContent>
        {overdueTasks.length > 0 && (
          <TabsContent value="overdue">
            <TaskList tasks={overdueTasks} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardPage;
