import { Routes, Route } from "react-router-dom";
import { WalletBalanceProvider } from "./contexts/WalletBalanceContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <div className="App min-h-screen">
      <WalletBalanceProvider>
        <div className="w-full mx-auto h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </div>
      </WalletBalanceProvider>
    </div>
  );
}

export default App;
