// Configuration WhatsApp
export const WHATSAPP_NUMBER = '221781234567'; // À remplacer par votre numéro

// Catégories de produits
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  FASHION = 'fashion',
  ACCESSORIES = 'accessories',
}

// Zones de livraison
export enum DeliveryZone {
  DAKAR = 'Dakar',
  PIKINE = 'Pikine',
  GUEDIAWAYE = 'Guédiawaye',
  RUFISQUE = 'Rufisque',
  THIES = 'Thiès',
  MBOUR = 'Mbour',
  SAINT_LOUIS = 'Saint-Louis',
  KAOLACK = 'Kaolack',
  ZIGUINCHOR = 'Ziguinchor',
  OTHER = 'Autre région',
}

// Fonction de formatage de devise
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
};
