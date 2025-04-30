
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart, 
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({ 
  to, 
  icon: Icon, 
  label 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        isActive && "bg-sidebar-accent font-medium"
      )
    }
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  const { isManager } = useAuth();
  
  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center">
          <CheckSquare className="mr-2 h-6 w-6 text-primary" />
          BPO Task System
        </h1>
      </div>
      
      <div className="px-3 py-2">
        <p className="px-3 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2">
          Menu
        </p>
        <nav className="space-y-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/tasks" icon={CheckSquare} label="Tasks" />
          {isManager && (
            <NavItem to="/agents" icon={Users} label="Agents" />
          )}
          <NavItem to="/reports" icon={BarChart} label="Reports" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent p-3 rounded-md">
          <p className="text-sm font-medium text-sidebar-foreground">Need Help?</p>
          <p className="text-xs text-sidebar-foreground/70 mt-1">
            Contact support or check the documentation.
          </p>
          <button className="mt-2 text-xs bg-sidebar-primary text-sidebar-primary-foreground px-3 py-1 rounded-md hover:bg-sidebar-primary/90">
            View Docs
          </button>
        </div>
      </div>
    </aside>
  );
};
