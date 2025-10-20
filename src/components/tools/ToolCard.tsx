'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tool } from '@/types';
import { Wrench } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ToolCard({ tool, isSelected = false, onClick }: ToolCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-accent border-primary' : 'hover:bg-accent'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium truncate">{tool.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.description}
            </p>
            <div className="mt-2 flex gap-1">
              <Badge variant="outline" className="text-xs">
                Input Schema
              </Badge>
              <Badge variant="outline" className="text-xs">
                Output Schema
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
