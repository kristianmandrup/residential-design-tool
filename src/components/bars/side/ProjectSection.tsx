import React, { useRef, useState } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { downloadJSON, readJSONFile } from "@/utils/io";
import { SceneObj } from "@/store/storeTypes";
import InputField from "../../generic/InputField";
import Button from "../../generic/Button";
import Section from "../../generic/Section";

export default function ProjectSection() {
  const objects = useSceneStore((s) => s.objects);
  const overwriteAll = useSceneStore((s) => s.overwriteAll);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const saveToFile = () => {
    downloadJSON("layout.json", objects);
  };

  const loadFromFile = () => {
    fileInputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const parsed = await readJSONFile(f);
    overwriteAll(parsed as SceneObj[]);
    e.currentTarget.value = "";
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      // Ensure data is always an array
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
      console.error("Error fetching projects");
    }
  };

  const saveToDB = async () => {
    if (!projectName) {
      alert("Please enter a project name");
      return;
    }
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, data: objects }),
      });
      if (response.ok) {
        alert("Project saved to database");
        setProjectName("");
        fetchProjects();
      } else {
        alert("Failed to save project");
      }
    } catch {
      alert("Error saving project");
    }
  };

  const loadFromDB = async (id: string) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`);
      const project = await response.json();
      if (project.data) {
        overwriteAll(project.data as SceneObj[]);
        alert(`Loaded project: ${project.name}`);
      } else {
        alert("Failed to load project");
      }
    } catch {
      alert("Error loading project");
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Section>
      <InputField
        label="Project Name"
        value={projectName}
        onChange={setProjectName}
        placeholder="Enter project name"
      />
      <div className="space-y-3">
        <Button
          onClick={saveToFile}
          variant="primary"
          size="md"
          className="w-full"
        >
          Save to File
        </Button>
        <Button
          onClick={loadFromFile}
          variant="secondary"
          size="md"
          className="w-full"
        >
          Load from File
        </Button>
        <Button
          onClick={saveToDB}
          variant="primary"
          size="md"
          className="w-full"
        >
          Save to DB
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={onFile}
      />
      {Array.isArray(projects) && projects.length > 0 && (
        <div>
          <ul className="mt-2 overflow-auto max-h-40">
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => loadFromDB(project.id)}
                className="p-2 rounded-md cursor-pointer hover:bg-blue-100"
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
