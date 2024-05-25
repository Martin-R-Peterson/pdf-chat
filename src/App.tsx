import React, { useEffect, useState } from 'react';
import FileUpload from './components/Fileupload';
import Chat from './components/Chat';

interface Message {
  id:number;
  text:string;
}

const App: React.FC = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);

  return (
    <div className="bg-black flex items-center justify-center   min-h-screen text-white">
      <div className="text-center min-w-full">
        <h1 className="text-5xl font-bold mb-8">PDF Chat</h1>
        <div>
          {!documentId && <FileUpload onUpload={setDocumentId} />}
          {documentId && (
            <div>
              <p className="text-lg mb-4">Dokument inläst</p>
              <Chat documentId={documentId} />
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};



export default App;
