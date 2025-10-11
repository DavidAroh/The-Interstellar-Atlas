import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CountryDetail } from './pages/CountryDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/country/:code" element={<CountryDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
