import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Map from './pages/Map'
import Login from './pages/Login'
import './index.css';

const App = () => {

  return (
      <Routes>
        <Route element={<Layout />}>
         <Route path="/" element={<Map/>} />
         <Route path="/login" element={<Login/>} />
        </Route>
      </Routes>
  );
};

export default App;