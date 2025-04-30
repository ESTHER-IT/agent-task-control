
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DataService, Task, TaskStatus } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus, Search } from "lucide-react";
import TaskList from "@/components/tasks/TaskList";
import TaskDialog from "@/components/tasks/TaskDialog";

const TasksPage = () => {
  const { user, isManager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadTasks = () => {
    let fetchedTasks: Task[];
    if (isManager) {
      fetchedTasks = DataService.getTasks();
    } else {
      fetchedTasks = DataService.getTasksByAgentId(user?.id || "");
    }
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [user, isManager]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {isManager ? "Manage and track all tasks" : "View and update your assigned tasks"}
          </p>
        </div>
        
        {isManager && (
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter !== "all" ? `Status: ${statusFilter}` : "Filter by Status"}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {priorityFilter !== "all" ? `Priority: ${priorityFilter}` : "Filter by Priority"}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <TaskList tasks={filteredTasks} onTaskUpdate={loadTasks} />
      
      {showAddDialog && (
        <TaskDialog 
          isOpen={showAddDialog} 
          onClose={() => {
            setShowAddDialog(false);
            loadTasks();
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
