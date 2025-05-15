import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DocumentView from './pages/DocumentView';
import Header from './components/Header';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/document/:id" element={<DocumentView />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>Document Retrieval System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;