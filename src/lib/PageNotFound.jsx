import React from 'react';
import { useParams } from 'react-router-dom';

export default function PageNotFound() {
  const { '*': pageName } = useParams();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-4">The page "{pageName}" could not be found in this application.</p>
      <div className="bg-muted p-4 rounded-md max-w-md">
        <p className="font-medium">Admin Note</p>
        <p className="text-sm">This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.</p>
      </div>
    </div>
  );
}
