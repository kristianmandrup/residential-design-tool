import React, { useState, useRef } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Upload, Save, Folder, Trash2, FileText } from "lucide-react";

export function ProjectManager() {
  const objects = useSceneStore((s) => s.objects);
  const overwriteAll = useSceneStore((s) => s.overwriteAll);

  const [projectName, setProjectName] = useState("");
  const [savedProjects, setSavedProjects] = useState<
    Array<{
      id: string;
      name: string;
      objectCount: number;
      lastModified: Date;
      data: any[];
    }>
  >([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download project as JSON
  const downloadProject = () => {
    const projectData = {
      name: projectName || "Untitled Project",
      created: new Date().toISOString(),
      objectCount: objects.length,
      objects: objects,
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName || "project"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load project from file
  const loadFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const projectData = JSON.parse(text);

      if (projectData.objects && Array.isArray(projectData.objects)) {
        overwriteAll(projectData.objects);
        setProjectName(projectData.name || file.name.replace(".json", ""));
      } else {
        // Legacy format - assume it's just an array of objects
        overwriteAll(projectData);
        setProjectName(file.name.replace(".json", ""));
      }
    } catch (error) {
      console.error("Failed to load project file:", error);
      alert("Failed to load project file. Please check the file format.");
    }

    // Clear the input
    event.target.value = "";
  };

  // Save to localStorage
  const saveToLocal = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    const project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      objectCount: objects.length,
      lastModified: new Date(),
      data: objects,
    };

    const existingProjects = JSON.parse(
      localStorage.getItem("citybuilder_projects") || "[]"
    );
    const updatedProjects = [...existingProjects, project];

    localStorage.setItem(
      "citybuilder_projects",
      JSON.stringify(updatedProjects)
    );
    setSavedProjects(updatedProjects);

    alert("Project saved locally!");
    setProjectName("");
  };

  // Load from localStorage
  const loadFromLocal = (project: any) => {
    overwriteAll(project.data);
    setProjectName(project.name);
    alert(`Loaded project: ${project.name}`);
  };

  // Delete from localStorage
  const deleteFromLocal = (projectId: string) => {
    const existingProjects = JSON.parse(
      localStorage.getItem("citybuilder_projects") || "[]"
    );
    const updatedProjects = existingProjects.filter(
      (p: any) => p.id !== projectId
    );

    localStorage.setItem(
      "citybuilder_projects",
      JSON.stringify(updatedProjects)
    );
    setSavedProjects(updatedProjects);
    setShowDeleteDialog(null);
  };

  // Load saved projects on mount
  React.useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("citybuilder_projects") || "[]"
    );
    setSavedProjects(
      saved.map((p: any) => ({
        ...p,
        lastModified: new Date(p.lastModified),
      }))
    );
  }, []);

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            💾 Project Manager
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Current Project Stats */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Project</span>
              <Badge variant="outline" className="text-xs">
                {objects.length} objects
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Last modified: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* File Operations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">File Operations</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadProject}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFromFile}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import JSON
              </Button>
            </div>
          </div>

          {/* Local Storage Operations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Local Storage</Label>
            <Button
              variant="default"
              size="sm"
              onClick={saveToLocal}
              disabled={!projectName.trim() || objects.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Locally
            </Button>
          </div>

          {/* Saved Projects */}
          {savedProjects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Saved Projects</Label>
                <Badge variant="secondary" className="text-xs">
                  {savedProjects.length}
                </Badge>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">
                            {project.name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {project.objectCount} objects •{" "}
                          {formatDate(project.lastModified)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadFromLocal(project)}
                          className="h-7 px-2"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(project.id)}
                          className="h-7 px-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Tips */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="font-medium">💡 Tips:</div>
            <ul className="space-y-1 ml-3">
              <li>• Projects are saved in your browser's local storage</li>
              <li>• Export to JSON for backup or sharing</li>
              <li>• Import JSON files to load saved projects</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileLoad}
        className="hidden"
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                showDeleteDialog && deleteFromLocal(showDeleteDialog)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
