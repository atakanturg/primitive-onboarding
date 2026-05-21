import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Overview } from './pages/Overview';
import { Slack } from './pages/Slack';
import { GoogleWorkspace } from './pages/GoogleWorkspace';
import { M365 } from './pages/M365';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index          element={<Overview />} />
            <Route path="slack"   element={<Slack />} />
            <Route path="workspace" element={<GoogleWorkspace />} />
            <Route path="m365"    element={<M365 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
