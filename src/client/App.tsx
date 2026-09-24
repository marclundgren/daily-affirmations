import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router';
import { StoreProvider, useStore } from './lib/store';
import { usePrefs, useThemeEffect } from './lib/prefs';
import { TabBar } from './components/TabBar';
import { Welcome } from './screens/Welcome';
import { Today } from './screens/Today';
import { Reader } from './screens/Reader';
import { Library } from './screens/Library';
import { Editor } from './screens/Editor';
import { Settings } from './screens/Settings';

const TAB_ROUTES = ['/', '/library', '/settings'];

function Shell() {
  const { ready, error, clearError, profile } = useStore();
  const { pathname } = useLocation();

  if (!ready) {
    return error ? (
      <main className="grid min-h-dvh place-items-center px-8 text-center text-muted">
        <p>Couldn’t reach the server.<br /><span className="text-sm text-faint">{error}</span></p>
      </main>
    ) : null;
  }
  if (!profile) return <Welcome />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/read/:id" element={<Reader />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/new" element={<Editor />} />
        <Route path="/library/:id" element={<Editor />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {TAB_ROUTES.includes(pathname) && <TabBar />}
      {error && (
        <button onClick={clearError} className="fixed inset-x-4 top-[max(env(safe-area-inset-top),1rem)] z-50 mx-auto max-w-md rounded-2xl bg-red-500/90 px-4 py-3 text-left text-sm text-white shadow-xl animate-rise">
          {error} <span className="opacity-70">· Dismiss</span>
        </button>
      )}
    </>
  );
}

export function App() {
  const [{ theme }] = usePrefs();
  useThemeEffect(theme);
  return (
    <BrowserRouter>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  );
}
