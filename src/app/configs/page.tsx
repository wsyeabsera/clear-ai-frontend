'use client';

import React, { useState } from 'react';
import { ConfigList } from '@/components/config/ConfigList';
import { ConfigEditor } from '@/components/config/ConfigEditor';
import { AgentConfig } from '@/types/agent-config';

export default function ConfigsPage() {
  const [editingConfig, setEditingConfig] = useState<AgentConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (config: AgentConfig) => {
    setEditingConfig(config);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    setEditingConfig(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setIsCreating(false);
  };

  if (isCreating || editingConfig) {
    return (
      <div className="container mx-auto py-6">
        <ConfigEditor
          config={editingConfig || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ConfigList
        onEdit={handleEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
