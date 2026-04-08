import React from 'react'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
const stripePromise = loadStripe("pk_test_51TGwyr34fZhgo8hNFdWPpk1TITMACOnlfxjbvtz3kfahf695zOW4tzdVQr2uzsuL1v220SwHSt8KT7pOBKNqXYim00D4j6Ig1K");
createRoot(document.getElementById('root')).render(
<Elements stripe={stripePromise}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Elements>

);