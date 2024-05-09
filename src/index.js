import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navbar, Footer } from './pages/layout';
import { Home } from './pages/home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Librarians } from './pages/librarians';
import { Readers } from './pages/readers';
import { Books } from './pages/books';
import { Loans } from './pages/loans';
import { Rets } from './pages/returns';
import { Fines } from './pages/fines';

function App() {
  return(
    <div>
      <>
      <BrowserRouter>
       <Navbar />
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/librarians" element={<Librarians />} />
        <Route path="/readers" element={<Readers />} />
        <Route path="/books" element={<Books />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/returns" element={<Rets />} />
        <Route path="/fines" element={<Fines />} />
       </Routes>
       <Footer />
      </BrowserRouter>

      </>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
