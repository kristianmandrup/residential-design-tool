import React, { useState } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { SceneObj } from "@/store/storeTypes";
import InputField from "../../generic/InputField";
import Button from "../../generic/Button";
import Label from "../../generic/Label";
import Section from "../../generic/Section";
import SelectField from "../../generic/SelectField";

export default function SearchSection() {
  const [isOpen, setIsOpen] = useState(false);
  const objects = useSceneStore((s) => s.objects);
  const setSelectedId = useSceneStore((s) => s.setSelectedId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("any");

  const filteredObjects = objects.filter((obj: SceneObj) => {
    const matchesSearch =
      !searchQuery ||
      obj.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "any" || obj.type === selectedType;

    return matchesSearch && matchesType;
  });

  const objectTypes = [
    { value: "any", label: "Any" },
    { value: "building", label: "Building" },
    { value: "tree", label: "Tree" },
    { value: "road", label: "Road" },
    { value: "wall", label: "Wall" },
    { value: "water", label: "Water" },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <Button
        onClick={toggleDropdown}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Search Objects
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full w-80">
          <Section>
            <InputField
              label="Search by name"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Enter object name..."
            />

            <SelectField
              label="Filter by type"
              value={selectedType}
              onChange={setSelectedType}
              options={objectTypes}
            />

            <div className="overflow-y-auto border border-gray-200 rounded-md max-h-60">
              {filteredObjects.length === 0 ? (
                <p className="p-2 text-sm text-center text-gray-600">
                  No objects found
                </p>
              ) : (
                filteredObjects.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedId(obj.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                      obj.id === useSceneStore.getState().selectedId
                        ? "bg-blue-100 border-blue-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {obj.name || "Unnamed"}
                      </span>
                      <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                        {obj.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Position: ({obj.position[0]}, {obj.position[2]})
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
