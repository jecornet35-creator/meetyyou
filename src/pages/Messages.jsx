import React from 'react';
import Header from '@/components/layout/Header';
import { MessageCircle } from 'lucide-react';

export default function Messages() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <MessageCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-500">Vos conversations apparaîtront ici.</p>
        </div>
      </main>
    </div>
  );
}