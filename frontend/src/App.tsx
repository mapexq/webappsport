import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import BonusesPage from './pages/BonusesPage';
import ForecastsPage from './pages/ForecastsPage';
import NewsPage from './pages/NewsPage';
import ArticlesPage from './pages/ArticlesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BonusesPage />} />
        <Route path="/bonuses" element={<BonusesPage />} />
        <Route path="/forecasts" element={<ForecastsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;

