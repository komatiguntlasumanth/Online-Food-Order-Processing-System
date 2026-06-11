import React from 'react';
import { ArrowLeft, Server, Database, Code, Layers, MessageSquare } from 'lucide-react';

const steps = [
  {
    title: 'React Frontend UI',
    description: 'A modern React app built with Vite, offering a premium, responsive UI for placing orders and tracking them.',
    icon: <Layers size={24} className="text-[#fc8019]" />,
  },
  {
    title: 'Spring Boot Order Service',
    description: 'Handles order creation, persists to MySQL, and publishes order events to ActiveMQ.',
    icon: <Server size={24} className="text-[#fc8019]" />,
  },
  {
    title: 'ActiveMQ Broker',
    description: 'Decouples services via asynchronous messaging, feeding events into Camunda.',
    icon: <MessageSquare size={24} className="text-[#fc8019]" />,
  },
  {
    title: 'Camunda BPM Engine',
    description: 'Orchestrates the workflow: payment → kitchen → delivery, updating status in the DB.',
    icon: <Code size={24} className="text-[#fc8019]" />,
  },
  {
    title: 'MySQL Database',
    description: 'Stores users, orders, and status updates shared across services.',
    icon: <Database size={24} className="text-[#fc8019]" />,
  },
];

export default function Architecture({ onBack }) {
  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      {/* Header with back button */}
      <header className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#fc8019] hover:text-[#e67300] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </header>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">System Architecture Overview</h1>
      <p className="text-lg text-slate-600 mb-10 max-w-3xl">
        This diagram walks you through the key components of the Online Food Order Processing System and how they interact using
        asynchronous messaging and workflow orchestration.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-4">
              {step.icon}
              <h2 className="text-xl font-semibold text-slate-800">{step.title}</h2>
            </div>
            <p className="text-sm text-slate-500 flex-grow">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
