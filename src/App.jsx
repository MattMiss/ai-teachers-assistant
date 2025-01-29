
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import OllamaTestPage from "./components/OllamaTestPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/test" element={<OllamaTestPage />} />
            </Routes>
        </Router>
    );
}

export default App;

