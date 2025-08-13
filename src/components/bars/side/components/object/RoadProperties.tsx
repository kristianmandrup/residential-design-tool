// src/components/bars/side/components/object/RoadProperties.tsx - Refactored
import React, { useState } from "react";
import { RoadObj, SceneObj } from "@/store/storeTypes";
import { CollapsibleSection } from "../../";
import {
  RoadStatisticsDisplay,
  RoadAdvancedFeatures,
  RoadPointManager,
  RoadBasicProperties,
} from "./road";

interface RoadPropertiesProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function RoadProperties({
  selected,
  updateObject,
}: RoadPropertiesProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);

  const points = selected.points || [];

  const handlePointSelectionChange = (index: number) => {
    setSelectedPointIndex(index);
  };

  const handleAdvancedToggle = (collapsed: boolean) => {
    setShowAdvanced(!collapsed);
  };

  return (
    <div className="space-y-4">
      {/* Basic Road Properties */}
      <CollapsibleSection
        title="Road Properties"
        icon={<span className="w-2 h-2 bg-gray-600 rounded-full"></span>}
      >
        <RoadBasicProperties selected={selected} updateObject={updateObject} />
      </CollapsibleSection>

      {/* Road Points Management */}
      <CollapsibleSection
        title={`Road Points (${points.length})`}
        icon={<span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
      >
        <RoadPointManager selected={selected} updateObject={updateObject} />
      </CollapsibleSection>

      {/* Advanced Features */}
      <CollapsibleSection
        title="Advanced Tools"
        defaultCollapsed={!showAdvanced}
        onToggle={handleAdvancedToggle}
        icon={<span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
      >
        <RoadAdvancedFeatures
          selected={selected}
          updateObject={updateObject}
          onPointSelectionChange={handlePointSelectionChange}
        />
      </CollapsibleSection>

      {/* Road Statistics - Always visible */}
      <RoadStatisticsDisplay selected={selected} />
    </div>
  );
}

export default RoadProperties;
