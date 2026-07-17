import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';


function App() {
  const dispatch = useDispatch();

  return (
    <Router>

      <Toaster
        position="top-right"
        reverseOrder={false}
      />

      <AppRoutes />
    </Router>

    
  );
}

export default App;
