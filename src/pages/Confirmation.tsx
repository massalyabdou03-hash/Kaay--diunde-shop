import React from 'react';
import { Link } from 'react-router-dom';

// ========================================
// CONFIRMATION PAGE
// ========================================

const Confirmation: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-xl">
      <div className="mb-8 flex justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl animate-bounce">
          ✅
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Merci pour votre commande !</h1>
      <p className="text-lg text-gray-600 mb-8">
        Votre commande a été reçue avec succès. Notre équipe va vous appeler dans quelques minutes pour confirmer les détails de la livraison.
      </p>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12 text-left">
        <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">Prochaines étapes :</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">1</span>
            <span className="text-sm text-gray-700">Appel de confirmation par nos agents.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">2</span>
            <span className="text-sm text-gray-700">Préparation de votre colis.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">3</span>
            <span className="text-sm text-gray-700">Livraison à votre domicile ou bureau.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
          Retour à l'accueil
        </Link>
        <Link to="/shop" className="text-orange-600 border border-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
