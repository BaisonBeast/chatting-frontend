import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom"; // Complete import statement
import './index.css';
import { Toaster } from "@/components/ui/toaster";


const rootElement = document.getElementById("root");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <BrowserRouter>
            <App />
            <Toaster />
        </BrowserRouter>
    );
} else {
    console.error("Root element not found");
}
