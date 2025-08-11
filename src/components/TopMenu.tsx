"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { downloadJSON, readJSONFile } from "@/utils/io";
import { SceneObj, StoreState } from "@/store/storeTypes";

export default function TopMenu() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-900">
          Residential Design Tool
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Project
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Ready</span>
      </div>

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project</h2>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ProjectContent onClose={() => setIsProjectModalOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}

// Import the project content from the existing ProjectSection
function ProjectContent({ onClose }: { onClose: () => void }) {
  const objects = useStore((s: StoreState) => s.objects);
  const overwriteAll = useStore((s: StoreState) => s.overwriteAll);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [projectName, setProjectName] = React.useState("");
  const [projects, setProjects] = React.useState<
    { id: string; name: string }[]
  >([]);

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
    onClose();
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
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
        onClose();
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
          {Array.isArray(projects) && projects.length > 0 ? (
            projects.map((project) => (
              <li
                key={project.id}
                onClick={() => loadFromDB(project.id)}
                className="cursor-pointer p-2 rounded-md hover:bg-blue-100"
              >
                {project.name}
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm p-2">No projects found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
