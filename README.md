# MakerIt

MakerIt est une marketplace française mettant en relation des **makers** (propriétaires d'imprimantes 3D) et des **clients** souhaitant faire imprimer un modèle. Les clients peuvent parcourir un catalogue de modèles 3D, envoyer une demande d'impression (avec upload de fichier STL), échanger en messagerie avec le maker, régler la commande et laisser un avis.

## Stack technique

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** comme ORM, base de données **PostgreSQL** (hébergée sur **Supabase**)
- **Supabase Storage** pour le stockage des fichiers (modèles STL, images)
- **iron-session** pour la gestion de session (authentification par cookie chiffré)
- **bcryptjs** pour le hachage des mots de passe
- **three.js** (`@types/three`) pour la prévisualisation des modèles 3D
- **sonner** pour les notifications (toasts)

## Fonctionnalités principales

D'après l'exploration du code (`prisma/schema.prisma` et `src/app`) :

- **Authentification** : inscription, connexion, déconnexion, vérification de l'email déjà utilisé, session courante (`src/app/api/auth/*`, `src/app/(auth)/login`, `src/app/(auth)/register`)
- **Deux rôles utilisateurs** : `MAKER` (avec profil imprimante : marque, modèle, matériaux, volume d'impression max, prix au gramme, disponibilité) et `CLIENT`
- **Marketplace de modèles 3D** : publication, consultation et détail d'un modèle (titre, description, catégorie, tags, prix estimé, fichier, miniature) — `src/app/(app)/marketplace`, `src/app/(app)/models`
- **Annuaire des makers** : liste et fiche détaillée d'un maker (`src/app/(app)/makers`)
- **Demandes d'impression** : création d'une demande (avec upload de fichier STL, couleur, matériau, quantité, notes), suivi de statut, devis et prix final (`src/app/(app)/requests`)
- **Messagerie / chat** : conversations entre un client et un maker liées à une demande, liste de messages (`src/app/(app)/chat`, `src/app/api/messages`)
- **Paiements** : enregistrement des paiements liés à une demande d'impression (montant, devise, statut) (`src/app/api/payments`)
- **Avis** : notation et commentaire laissés après une demande terminée (`src/app/api/reviews`)
- **Tableau de bord** : vue d'ensemble pour l'utilisateur connecté (`src/app/(app)/dashboard`)
- **Revenus (earnings)** : suivi des gains cumulés pour un maker (`src/app/(app)/earnings`)
- **Profil utilisateur** : consultation et édition du profil (`src/app/(app)/profile`, `src/app/(app)/profile/edit`)
- **Upload de fichiers** : envoi de fichiers (modèles, avatars, STL) vers le stockage local (`public/uploads`) ou Supabase Storage (`src/app/api/upload`, `src/lib/supabase.ts`)

## Prérequis

- Node.js 18+
- Un projet Supabase (base PostgreSQL + éventuellement Supabase Storage)

## Installation

```bash
npm install
```

Copier le fichier d'exemple des variables d'environnement puis le compléter :

```bash
cp .env.example .env
```

Variables d'environnement utilisées (voir `.env.example`) :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (pooler Supabase, port 6543) utilisée par Prisma en runtime |
| `DIRECT_URL` | URL de connexion directe PostgreSQL (port 5432) utilisée pour les migrations Prisma |
| `SESSION_SECRET` | Secret (chaîne aléatoire d'au moins 32 caractères) utilisé par `iron-session` pour chiffrer le cookie de session |
| `SESSION_NAME` | Nom du cookie de session |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (optionnel, pour Supabase Storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase (optionnel, pour Supabase Storage) |

Initialiser la base de données :

```bash
npm run db:push
```

Lancer le serveur de développement :

```bash
npm run dev
```

L'application est alors accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts npm

| Script | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement Next.js |
| `npm run build` | Build de production |
| `npm start` | Démarre le serveur en mode production (après `build`) |
| `npm run db:push` | Applique le schéma Prisma à la base de données (sans migration versionnée) |
| `npm run db:migrate` | Crée et applique une migration Prisma (développement) |
| `npm run db:studio` | Ouvre Prisma Studio pour explorer/éditer les données |

## Structure du projet

```
prisma/
  schema.prisma          Schéma de la base de données (User, Model, PrintRequest,
                          Conversation, Message, Payment, Review)
src/
  app/
    (auth)/               Pages de connexion et d'inscription
      login/
      register/
    (app)/                Pages de l'application (protégées)
      dashboard/           Tableau de bord
      marketplace/         Catalogue de modèles 3D
      models/              Gestion des modèles (création, détail)
      makers/               Annuaire des makers
      requests/            Demandes d'impression
      chat/                Messagerie
      earnings/            Revenus (makers)
      profile/             Profil utilisateur
    api/                  Routes API (auth, makers, messages, models,
                           payments, requests, reviews, upload, users)
  components/             Composants React réutilisables
  lib/                    Utilitaires partagés (Prisma client, session,
                           client Supabase, helpers)
public/
  uploads/                Fichiers uploadés (stockage local, mode dev)
```
