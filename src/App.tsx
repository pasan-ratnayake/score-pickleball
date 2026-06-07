import { Route, Routes } from 'react-router';

import { DinkApp } from './Components/Dink/DinkApp';
import { NotFound } from './Pages/NotFound';

export function App() {
    return (
        <Routes>
            <Route index element={<DinkApp />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
