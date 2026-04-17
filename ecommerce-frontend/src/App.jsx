import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initializeDatabase } from './services/api';
import { ProductList } from './features/catalog/ProductList';
import { CheckoutProvider } from './features/checkout/CheckoutProvider';
import { Layout } from './components/Layout';
import { ProductDetail } from './pages/ProductDetail';

// IMPORT IT HERE
import { ScrollToTop } from './components/ScrollToTop'; 

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootUp = async () => {
      try { 
        await initializeDatabase(); 
      } 
      catch (error) { 
        console.error("Failed to init db", error); 
      } 
      finally { 
        setLoading(false); 
      }
    };
    bootUp();
  }, []);

  // Sleek, animated, mobile-friendly loading state
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 space-y-6 animate-in fade-in duration-700">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-gray-200 opacity-75"></div>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black relative z-10"></div>
        </div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 animate-pulse">
          Establishing Connection
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* PLACE IT HERE */}
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <CheckoutProvider>
      <AppContent />
    </CheckoutProvider>
  );
}

export default App;