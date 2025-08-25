import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Landing from "./pages/Landing";
function App() {
  return (
    <div className="App min-h-screen">
      <div className="w-full max-w-sm mx-auto h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/landing" element={<Landing />} />
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
