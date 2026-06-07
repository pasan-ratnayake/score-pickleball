import { Route, Routes } from 'react-router';

import { DinkApp } from './Components/Dink/DinkApp';
import { useApplyTheme } from './Hooks/useApplyTheme';
import { NotFound } from './Pages/NotFound';
import { Rules } from './Pages/Rules';

export function App() {
    // Keeps the Rules reference page themed (light/dark); the Dink app sets its
    // own accent CSS vars and is unaffected by this.
    useApplyTheme();

    return (
        <Routes>
            <Route index element={<DinkApp />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
