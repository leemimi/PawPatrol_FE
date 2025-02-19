import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import './index.css';

const App = () => {

  return (
      <Routes>
        <Route element={<Layout />}>
        </Route>
      </Routes>
  );
};

export default App;