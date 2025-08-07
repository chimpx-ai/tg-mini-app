import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
