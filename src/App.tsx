import React from 'react';
import { ToolProvider } from '@/contexts/ToolContext';
import { EditorProvider } from '@/contexts/EditorContext';
import { RoadDrawingProvider } from '@/contexts/RoadDrawingContext';
// ... other imports

function App() {
  return (
    <div className="App">
      <ToolProvider>
        <EditorProvider>
          <RoadDrawingProvider>
            {/* Your existing app content */}
            <YourExistingAppContent />
          </RoadDrawingProvider>
        </EditorProvider>
      </ToolProvider>
    </div>
  );
}

export default App;

