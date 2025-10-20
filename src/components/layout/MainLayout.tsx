'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { BottomPanel } from './BottomPanel';
import { Navigation } from './Navigation';
import { useState } from 'react';

export function MainLayout() {
  const [bottomPanelSize, setBottomPanelSize] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  return (
    <div className="h-screen w-full bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <Navigation />
        </div>
      </div>

      <ResizablePanelGroup direction="vertical">
        {/* Main Content Area */}
        <ResizablePanel defaultSize={bottomPanelSize === 0 ? 100 : 80} minSize={50}>
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel - Sessions & History */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="overflow-hidden">
              <LeftPanel />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center Panel - Active Query & Results */}
            <ResizablePanel defaultSize={50} minSize={40} className="overflow-hidden">
              <CenterPanel
                onSelectRequest={setSelectedRequestId}
                selectedRequestId={selectedRequestId}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Request Details */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="overflow-hidden">
              <RightPanel selectedRequestId={selectedRequestId} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        {/* Bottom Panel - Plan Editor (Collapsible) */}
        {bottomPanelSize > 0 && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={bottomPanelSize}
              minSize={20}
              maxSize={60}
              onResize={setBottomPanelSize}
            >
              <BottomPanel onClose={() => setBottomPanelSize(0)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
