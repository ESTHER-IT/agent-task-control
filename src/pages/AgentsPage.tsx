
import { useState, useEffect } from "react";
import { DataService, Agent } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AgentsPage = () => {
  const { isManager } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  
  // If not a manager, redirect to dashboard
  if (!isManager) {
    return <Navigate to="/dashboard" />;
  }
  
  const loadAgents = () => {
    const fetchedAgents = DataService.getAgents();
    setAgents(fetchedAgents);
  };
  
  useEffect(() => {
    loadAgents();
  }, []);
  
  const handleOpenAddDialog = () => {
    // Reset form
    setName("");
    setEmail("");
    setDepartment("");
    setSkills([]);
    setSkillInput("");
    setEditingAgent(null);
    setShowAddDialog(true);
  };
  
  const handleOpenEditDialog = (agent: Agent) => {
    setName(agent.name);
    setEmail(agent.email);
    setDepartment(agent.department);
    setSkills([...agent.skills]);
    setSkillInput("");
    setEditingAgent(agent);
    setShowAddDialog(true);
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !department.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      if (editingAgent) {
        DataService.updateAgent(editingAgent.id, {
          name,
          email,
          department,
          skills
        });
        toast.success("Agent updated successfully");
      } else {
        DataService.addAgent({
          name,
          email,
          department,
          skills
        });
        toast.success("Agent created successfully");
      }
      setShowAddDialog(false);
      loadAgents();
    } catch (error) {
      toast.error("An error occurred while saving the agent");
      console.error(error);
    }
  };
  
  const handleDeleteAgent = (agentId: string) => {
    try {
      if (DataService.deleteAgent(agentId)) {
        toast.success("Agent deleted successfully");
        loadAgents();
      } else {
        toast.error("Cannot delete agent with assigned tasks");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the agent");
      console.error(error);
    }
  };
  
  const filteredAgents = agents.filter((agent) => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>
        
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>
      
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search agents..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
                <Badge variant="outline">{agent.department}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium">Skills:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm">
                  <span className="font-medium">{agent.tasksAssigned}</span> tasks assigned
                </span>
                
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenEditDialog(agent)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                    disabled={agent.tasksAssigned > 0}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredAgents.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No agents found</p>
        </div>
      )}
      
      {/* Add/Edit Agent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? "Edit Agent" : "Add New Agent"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter agent name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter department"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button 
                  type="button" 
                  className="ml-2" 
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingAgent ? "Save Changes" : "Add Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsPage;
