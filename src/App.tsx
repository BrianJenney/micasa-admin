import React, { FC } from 'react';
import './App.css';
import ListingDocuments from './components/ListingDocumentsForm';

const App: FC = () => {
  return (
    <div style={{ margin: '1em' }}>
      <h1 style={{ textAlign: 'center' }}>Micasa Admin</h1>
      <ListingDocuments />
    </div>
  );
};

export default App;
