import { SceneObj } from "../store";

export function downloadJSON(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readJSONFile(file: File): Promise<SceneObj[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  // Basic validation could be added
  return parsed as SceneObj[];
}
