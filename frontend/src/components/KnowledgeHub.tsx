import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './KnowledgeHub.css';

// Import contract ABIs (you'll need to copy these from your artifacts)
// For now, using placeholder interfaces
interface Entry {
  id: number;
  author: string;
  title: string;
  contentHash: string;
  upvotes: number;
  downvotes: number;
  timestamp: number;
}

const KnowledgeHub: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockEntries: Entry[] = [
      {
        id: 1,
        author: '0x1234...5678',
        title: 'Introduction to Blockchain',
        contentHash: 'QmHash1...',
        upvotes: 15,
        downvotes: 2,
        timestamp: Date.now() - 86400000
      },
      {
        id: 2,
        author: '0x9876...5432',
        title: 'Smart Contract Best Practices',
        contentHash: 'QmHash2...',
        upvotes: 23,
        downvotes: 1,
        timestamp: Date.now() - 172800000
      }
    ];
    setEntries(mockEntries);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const submitEntry = async () => {
    if (!newTitle || !newContent) {
      alert('Please fill in both title and content');
      return;
    }

    setLoading(true);
    
    // In a real implementation, you would:
    // 1. Upload content to IPFS
    // 2. Call the smart contract to submit the entry
    
    // Mock submission for demonstration
    setTimeout(() => {
      const newEntry: Entry = {
        id: entries.length + 1,
        author: account || '0x0000...0000',
        title: newTitle,
        contentHash: `QmMock${Date.now()}`,
        upvotes: 0,
        downvotes: 0,
        timestamp: Date.now()
      };
      
      setEntries([newEntry, ...entries]);
      setNewTitle('');
      setNewContent('');
      setLoading(false);
    }, 2000);
  };

  const vote = (entryId: number, isUpvote: boolean) => {
    setEntries(entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          upvotes: isUpvote ? entry.upvotes + 1 : entry.upvotes,
          downvotes: !isUpvote ? entry.downvotes + 1 : entry.downvotes
        };
      }
      return entry;
    }));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="knowledge-hub">
      <div className="wallet-section">
        {!account ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <span>Connected: {formatAddress(account)}</span>
          </div>
        )}
      </div>

      <div className="submit-section">
        <h2>Share Knowledge</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Entry title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="title-input"
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Share your knowledge here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="content-input"
            rows={4}
          />
        </div>
        <button 
          onClick={submitEntry} 
          disabled={loading || !account}
          className="submit-btn"
        >
          {loading ? 'Submitting...' : 'Submit Entry'}
        </button>
      </div>

      <div className="entries-section">
        <h2>Knowledge Entries</h2>
        <div className="entries-list">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <h3>{entry.title}</h3>
                <div className="entry-meta">
                  <span>By {formatAddress(entry.author)}</span>
                  <span>{formatTime(entry.timestamp)}</span>
                </div>
              </div>
              <div className="entry-content">
                <p>IPFS Hash: {entry.contentHash}</p>
              </div>
              <div className="entry-actions">
                <button 
                  onClick={() => vote(entry.id, true)}
                  className="vote-btn upvote"
                  disabled={!account}
                >
                  ↑ {entry.upvotes}
                </button>
                <button 
                  onClick={() => vote(entry.id, false)}
                  className="vote-btn downvote"
                  disabled={!account}
                >
                  ↓ {entry.downvotes}
                </button>
                <div className="score">
                  Score: {entry.upvotes - entry.downvotes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default KnowledgeHub;
