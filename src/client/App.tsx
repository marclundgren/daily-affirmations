import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import TodayView from './components/TodayView';
import AffirmationReader from './components/AffirmationReader';
import AffirmationList from './components/AffirmationList';
import AffirmationForm from './components/AffirmationForm';
import Settings from './components/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayView />} />
          <Route path="/today/:id" element={<AffirmationReader />} />
          <Route path="/manage" element={<AffirmationList />} />
          <Route path="/manage/new" element={<AffirmationForm />} />
          <Route path="/manage/:id/edit" element={<AffirmationForm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
