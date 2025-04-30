
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/lib/models";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const TaskStatusBadge = ({ status, className }: TaskStatusBadgeProps) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const statusClasses = {
    "pending": "bg-yellow-100 text-yellow-800 border border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border border-blue-300",
    "completed": "bg-green-100 text-green-800 border border-green-300",
    "on-hold": "bg-gray-100 text-gray-800 border border-gray-300"
  };
  
  const statusLabels = {
    "pending": "Pending",
    "in-progress": "In Progress",
    "completed": "Completed",
    "on-hold": "On Hold"
  };
  
  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {statusLabels[status]}
    </span>
  );
};

export default TaskStatusBadge;
