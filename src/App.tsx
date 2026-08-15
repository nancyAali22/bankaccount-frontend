import './App.css'
import "./index.css";
import { RouterProvider } from 'react-router-dom'
import { router } from './Routes/RouteProvider';

function App() {
  return <RouterProvider router={router} />
}

export default App