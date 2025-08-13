import { PointerEventContext, StoreActions, SelectionState } from "./types";

export class DeletionHandler {
  constructor(
    private context: PointerEventContext,
    private actions: StoreActions,
    private selectionState: SelectionState
  ) {}

  handleDeletion(): boolean {
    const { selectedId, selectedIds } = this.selectionState;
    const { removeObject, setSelectedId, setSelectedIds } = this.actions;

    if (selectedIds.length > 0) {
      // Delete all selected objects
      selectedIds.forEach((id) => removeObject(id));
      setSelectedIds([]);
      setSelectedId(null);
      return true;
    } else if (selectedId) {
      // Delete single selected object
      removeObject(selectedId);
      setSelectedId(null);
      return true;
    }

    return false;
  }
}
