'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Strategy } from '@/types/agent-config';

interface StrategySelectorProps {
  strategies: Strategy[];
  selectedStrategies: string[];
  onSelectionChange: (strategies: string[]) => void;
  title?: string;
  description?: string;
  maxSelections?: number;
}

export function StrategySelector({
  strategies,
  selectedStrategies,
  onSelectionChange,
  title = "Select Strategies",
  description = "Choose the strategies to use for this configuration",
  maxSelections
}: StrategySelectorProps) {
  const handleStrategyToggle = (strategyName: string, checked: boolean) => {
    if (checked) {
      if (maxSelections && selectedStrategies.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onSelectionChange([...selectedStrategies, strategyName]);
    } else {
      onSelectionChange(selectedStrategies.filter(s => s !== strategyName));
    }
  };

  const isStrategySelected = (strategyName: string) => {
    return selectedStrategies.includes(strategyName);
  };

  const canSelectMore = !maxSelections || selectedStrategies.length < maxSelections;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {maxSelections && (
            <Badge variant="outline">
              {selectedStrategies.length}/{maxSelections} selected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strategies.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No strategies available
            </div>
          ) : (
            strategies.map((strategy) => {
              const isSelected = isStrategySelected(strategy.name);
              const canSelect = canSelectMore || isSelected;

              return (
                <div
                  key={strategy.name}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/20' 
                      : canSelect 
                        ? 'hover:bg-muted/50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Checkbox
                    id={strategy.name}
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      canSelect && handleStrategyToggle(strategy.name, checked as boolean)
                    }
                    disabled={!canSelect}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label 
                      htmlFor={strategy.name} 
                      className={`flex items-center gap-2 cursor-pointer ${
                        !canSelect ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="font-medium">{strategy.name}</span>
                      <Badge variant="outline" className="text-xs">
                        v{strategy.version}
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {strategy.description}
                    </p>
                    {isSelected && (
                      <Badge variant="default" className="mt-2 text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {maxSelections && selectedStrategies.length >= maxSelections && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Maximum number of strategies selected. Deselect one to choose another.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StrategyCardProps {
  strategy: Strategy;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export function StrategyCard({ strategy, isSelected, onToggle, disabled }: StrategyCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
        isSelected 
          ? 'bg-primary/5 border-primary/20' 
          : 'hover:bg-muted/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onToggle(!isSelected)}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{strategy.name}</h4>
            <Badge variant="outline" className="text-xs">
              v{strategy.version}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {strategy.description}
          </p>
        </div>
      </div>
    </div>
  );
}
