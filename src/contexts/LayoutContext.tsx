import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LayoutContextType {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(400); // 25rem = 400px (increased for better palette display)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);

  useEffect(() => {
    const updateCanvasWidth = () => {
      const windowWidth = window.innerWidth;
      const sidebarWidthValue = isSidebarCollapsed ? 0 : sidebarWidth;
      // Reduce canvas width by 5% as requested
      const reducedCanvasWidth = (windowWidth - sidebarWidthValue) * 0.95;
      setCanvasWidth(reducedCanvasWidth);
    };

    // Initial calculation
    updateCanvasWidth();

    // Add event listener for window resize
    window.addEventListener("resize", updateCanvasWidth);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasWidth);
    };
  }, [sidebarWidth, isSidebarCollapsed]);

  const value = {
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    canvasWidth,
    setCanvasWidth,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
