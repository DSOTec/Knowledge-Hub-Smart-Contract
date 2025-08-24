import React from 'react';
import DarkVeil from './components/DarkVeil';
import KnowledgeHub from './components/KnowledgeHub';
import './App.css';

function App() {
  return (
    <div className="App">
      <DarkVeil />
      <div className="content">
        <header className="App-header">
          <h1>Knowledge Hub</h1>
          <p>Decentralized Knowledge Sharing Platform</p>
        </header>
        <main>
          <KnowledgeHub />
        </main>
      </div>
    </div>
  );
}

export default App;
