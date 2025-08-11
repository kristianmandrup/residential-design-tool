import React from "react";
import { TreeObj, SceneObj } from "@/store/useStore";
import GridSizeFields from "./GridSizeFields";

interface TreePropertiesProps {
  selected: TreeObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function TreeProperties({
  selected,
  updateObject,
}: TreePropertiesProps) {
  return (
    <GridSizeFields
      gridWidth={selected.gridWidth || 1}
      gridDepth={selected.gridDepth || 1}
      gridHeight={selected.gridHeight || 1}
      onGridWidthChange={(value) =>
        updateObject(selected.id, { gridWidth: Math.max(1, value) })
      }
      onGridDepthChange={(value) =>
        updateObject(selected.id, { gridDepth: Math.max(1, value) })
      }
      onGridHeightChange={(value) =>
        updateObject(selected.id, {
          gridHeight: Math.max(1, Math.min(5, value)),
        })
      }
      widthMax={3}
      depthMax={3}
    />
  );
}
