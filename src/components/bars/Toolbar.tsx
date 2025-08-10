"use client";
import React from "react";
import { useEditor } from "@/context/EditorContext";

const IconButton: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  title?: string;
}> = ({ active, onClick, children, title }) => (
  <button
    title={title}
    onClick={onClick}
    className={`p-2 rounded transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-lg transform scale-105 ring-2 ring-blue-400 ring-opacity-50"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-md"
    } w-12 h-12 flex items-center justify-center font-bold`}
  >
    {children}
  </button>
);

export default function Toolbar() {
  const { tool, setTool } = useEditor();
  return (
    <div className="flex flex-col items-center">
      <IconButton
        active={tool === "select"}
        onClick={() => setTool("select")}
        title="Select"
      >
        S
      </IconButton>
      <IconButton
        active={tool === "add-building"}
        onClick={() => setTool("add-building")}
        title="Add building"
      >
        B
      </IconButton>
      <IconButton
        active={tool === "add-tree"}
        onClick={() => setTool("add-tree")}
        title="Add tree"
      >
        T
      </IconButton>
      <IconButton
        active={tool === "add-road"}
        onClick={() => setTool("add-road")}
        title="Add road"
      >
        R
      </IconButton>
      <IconButton
        active={tool === "add-wall"}
        onClick={() => setTool("add-wall")}
        title="Add wall"
      >
        W
      </IconButton>
      <div className="mt-4 text-xs text-gray-400">Tool</div>
    </div>
  );
}
