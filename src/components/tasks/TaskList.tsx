
import { useState } from "react";
import { Task, TaskStatus, DataService } from "@/lib/models";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskDialog from "./TaskDialog";
import { toast } from "sonner";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: () => void;
}

const TaskList = ({ tasks, onTaskUpdate }: TaskListProps) => {
  const { isManager } = useAuth();
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    DataService.updateTask(taskId, { status: newStatus });
    toast.success(`Task status updated to ${newStatus}`);
    if (onTaskUpdate) onTaskUpdate();
  };
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowTaskDialog(true);
  };
  
  const handleDeleteTask = (taskId: string) => {
    if (DataService.deleteTask(taskId)) {
      toast.success("Task deleted successfully");
      if (onTaskUpdate) onTaskUpdate();
    } else {
      toast.error("Failed to delete task");
    }
  };

  const closeTaskDialog = () => {
    setShowTaskDialog(false);
    setTaskToEdit(null);
    if (onTaskUpdate) onTaskUpdate();
  };
  
  // If there are no tasks
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No tasks available</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4 mt-4">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 
                      className="font-medium text-lg cursor-pointer hover:text-primary"
                      onClick={() => handleEditTask(task)}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            Edit
                          </DropdownMenuItem>
                          {isManager && (
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                              Delete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "pending")}>
                            Set as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "in-progress")}>
                            Set as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "completed")}>
                            Set as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "on-hold")}>
                            Set as On Hold
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center mt-3 gap-4">
                    {task.dueDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                    
                    <Badge variant="outline" className="ml-auto">
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.assignedToName && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Assigned to: <span className="font-medium">{task.assignedToName}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {showTaskDialog && (
        <TaskDialog 
          isOpen={showTaskDialog}
          onClose={closeTaskDialog}
          task={taskToEdit}
        />
      )}
    </>
  );
};

export default TaskList;
