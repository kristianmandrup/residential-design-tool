import React, { useRef } from "react";
import { useStore } from "@/store/useStore";
import { downloadJSON, readJSONFile } from "@/utils/io";

export default function ProjectSection() {
  const objects = useStore((s) => s.objects);
  const overwriteAll = useStore((s) => s.overwriteAll);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const save = () => {
    downloadJSON("layout.json", objects);
  };

  const loadClicked = () => {
    fileInputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const parsed = await readJSONFile(f);
    overwriteAll(parsed as import("@/store/useStore").SceneObj[]);
    e.currentTarget.value = "";
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Project
      </h3>
      <div className="flex gap-3">
        <button
          onClick={save}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Save
        </button>
        <button
          onClick={loadClicked}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={onFile}
        />
      </div>
    </section>
  );
}
