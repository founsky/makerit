export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  QUOTED: 'Devis envoyé',
  ACCEPTED: 'Accepté',
  PRINTING: 'En impression',
  SHIPPED: 'Expédié',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  REJECTED: 'Refusé',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  QUOTED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PRINTING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-gray-100 text-gray-800',
}

export const CATEGORIES = [
  'Art & Décoration',
  'Jouets & Jeux',
  'Outillage',
  'Electronique',
  'Bijoux',
  'Architecture & Maquettes',
  'Médical',
  'Mode & Accessoires',
  'Education',
  'Pièces détachées',
  'Autre',
]

export const MATERIALS = [
  'PLA',
  'ABS',
  'PETG',
  'TPU',
  'ASA',
  'Nylon',
  'Résine',
  'HIPS',
  'PVA',
  'Autre',
]
