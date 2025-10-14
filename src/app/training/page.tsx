'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingDashboard } from '@/components/training/TrainingDashboard';
import { FeedbackForm } from '@/components/training/FeedbackForm';
import { FeedbackHistory } from '@/components/training/FeedbackHistory';
import { TrainingFeedback } from '@/types/agent-config';

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [, setSelectedFeedback] = useState<TrainingFeedback | null>(null);

  const handleFeedbackClick = () => {
    setShowFeedbackForm(true);
    setActiveTab('feedback');
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
    setActiveTab('dashboard');
  };

  const handleFeedbackCancel = () => {
    setShowFeedbackForm(false);
    setActiveTab('dashboard');
  };

  const handleViewFeedback = (feedback: TrainingFeedback) => {
    setSelectedFeedback(feedback);
    setActiveTab('feedback');
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TrainingDashboard onFeedbackClick={handleFeedbackClick} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {showFeedbackForm ? (
            <FeedbackForm
              onSuccess={handleFeedbackSuccess}
              onCancel={handleFeedbackCancel}
            />
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
              <p className="text-muted-foreground mb-6">
                Help improve the AI agents by providing feedback on their performance
              </p>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Feedback Form
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <FeedbackHistory onFeedbackClick={handleViewFeedback} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
