import { Navigate, Route, Routes } from 'react-router';

import { Layout } from './Components/Layout';
import { useApplyTheme } from './Hooks/useApplyTheme';
import { NotFound } from './Pages/NotFound';
import { Rules } from './Pages/Rules';
import { Score } from './Pages/Score';

export function App() {
    useApplyTheme();

    return (
        <Layout>
            <Routes>
                <Route index element={<Navigate to="/score" replace />} />
                <Route path="/score" element={<Score />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}
