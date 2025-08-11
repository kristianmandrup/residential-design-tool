import React, { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { downloadJSON, readJSONFile } from "@/utils/io";
import { SceneObj } from "@/store";

export default function ProjectSection() {
  const objects = useStore((s) => s.objects);
  const overwriteAll = useStore((s) => s.overwriteAll);
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
    const response = await fetch("/api/projects");
    const data = await response.json();
    setProjects(data);
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
    } catch (error) {
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
    } catch (error) {
      alert("Error loading project");
    }
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Project
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveToFile}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Save to File
          </button>
          <button
            onClick={loadFromFile}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Load from File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onFile}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveToDB}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Save to DB
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Load from DB
          </label>
          <ul className="mt-2 max-h-40 overflow-auto">
            {projects.map((project) => (
              <li
                key={project.id}
                onClick={() => loadFromDB(project.id)}
                className="cursor-pointer p-2 rounded-md hover:bg-blue-100"
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
