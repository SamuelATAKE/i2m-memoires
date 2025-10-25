import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlatformeMemoiresIMM from "./pages/PlatformeMemoiresIMM";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlatformeMemoiresIMM />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
