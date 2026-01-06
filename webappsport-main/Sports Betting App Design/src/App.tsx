import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BonusesPage } from './pages/BonusesPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { NewsPage } from './pages/NewsPage';
import { ArticlesPage } from './pages/ArticlesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BonusesPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;