# Rapport de Stage Complet : Projet WorkReserve

## Page de Couverture

**Titre du Projet :** WorkReserve - Plateforme Moderne de Réservation et Gestion d'Espaces de Travail  
**Nom du Stagiaire :** [Votre Nom - À compléter]  
**Rôle du Stage :** Stagiaire en Développement Logiciel Full-Stack  
**Entreprise/Organisation :** [Nom de l'Organisation - À compléter]  
**Durée du Stage :** [Date de Début - Date de Fin - À compléter]  
**Date du Rapport :** Janvier 2025  
**Dépôt du Projet :** https://github.com/mahdi-y/WorkReserve  

---

## Remerciements

Je souhaite exprimer ma sincère gratitude à [Nom du Superviseur - À compléter] pour ses conseils et son mentorat tout au long de ce stage. Mes remerciements particuliers vont à l'équipe de développement de [Nom de l'Organisation] pour avoir fourni des perspectives précieuses sur les pratiques modernes de développement logiciel et les modèles architecturaux. Ce projet a été instrumental pour améliorer ma compréhension du développement full-stack, du déploiement cloud et des principes d'ingénierie logicielle de niveau entreprise.

---

## Résumé Exécutif / Résumé

Le projet WorkReserve représente une plateforme complète de réservation et gestion d'espaces de travail conçue pour répondre au besoin croissant d'allocation efficace des ressources dans les environnements de bureau modernes. Cette application full-stack combine un backend Spring Boot robuste avec un frontend React réactif pour offrir des capacités de réservation d'espaces de travail en temps réel, un traitement de paiement sécurisé et une surveillance administrative.

La plateforme adresse les défis métier critiques incluant l'optimisation des espaces de travail, la facturation automatisée et la gestion des utilisateurs à travers une architecture inspirée des microservices qui met l'accent sur la scalabilité, la sécurité et la maintenabilité. Les innovations clés incluent la vérification de disponibilité en temps réel, les réservations sans conflit, le traitement de paiement Stripe intégré et l'authentification multi-facteurs avec systèmes de récupération de sauvegarde.

Pendant la période de stage, des contributions significatives ont été apportées au développement des fonctionnalités principales incluant le système d'authentification, l'intégration de paiement, l'implémentation de la couche de cache et le framework de tests complets. Le projet démontre l'application pratique de technologies standard de l'industrie et de meilleures pratiques en ingénierie logicielle, résultant en une application prête pour la production adaptée au déploiement en entreprise.

---

## 1. Introduction

### 1.1 Aperçu de l'Entreprise/Organisation

[Nom de l'Organisation - À compléter] est une entreprise technologique avant-gardiste spécialisée dans les solutions logicielles d'entreprise et les initiatives de transformation numérique. L'organisation se concentre sur le développement d'applications scalables, sécurisées et centrées sur l'utilisateur qui adressent les défis métier du monde réel dans divers domaines incluant la gestion des espaces de travail, l'allocation des ressources et l'efficacité opérationnelle.

L'engagement de l'entreprise envers les pratiques modernes de développement logiciel et les technologies émergentes fournit un environnement idéal pour apprendre et contribuer à des projets significatifs qui impactent à la fois les opérations internes et les solutions clients.

### 1.2 Objectifs du Stage

Les objectifs principaux de ce stage étaient de :

1. **Développement de Compétences Techniques** : Acquérir une expérience pratique avec les technologies modernes de développement full-stack incluant Spring Boot, React, TypeScript et les plateformes de déploiement cloud
2. **Compréhension de l'Architecture Logicielle** : Apprendre à concevoir et implémenter des architectures logicielles scalables et maintenables suivant les meilleures pratiques de l'industrie
3. **Pratiques de Développement d'Entreprise** : Expérimenter les processus de développement logiciel du monde réel incluant les tests, CI/CD, la révision de code et la documentation
4. **Capacités de Résolution de Problèmes** : Développer les compétences analytiques pour identifier, diagnostiquer et résoudre les défis techniques complexes
5. **Collaboration et Communication** : Améliorer les capacités de travail d'équipe à travers le développement collaboratif et la communication technique

### 1.3 Portée du Travail Pendant le Stage

Le stage s'est concentré sur le développement et l'amélioration de la plateforme WorkReserve, englobant à la fois les composants backend et frontend. Les domaines clés de contribution incluaient :

- **Authentification et Sécurité** : Implémentation de l'authentification basée JWT avec capacités d'authentification multi-facteurs (2FA)
- **Intégration de Paiement** : Développement du traitement de paiement Stripe sécurisé avec gestion d'erreurs et mécanismes de retry
- **Système de Cache** : Implémentation de la couche de cache basée Caffeine pour l'optimisation des performances
- **Framework de Tests** : Création de tests unitaires et d'intégration complets assurant la qualité et la fiabilité du code
- **Développement d'API** : Conception et implémentation d'APIs RESTful avec validation appropriée et gestion d'erreurs
- **Développement Frontend** : Création d'interfaces utilisateur réactives avec les patterns React modernes et TypeScript
- **DevOps et Déploiement** : Configuration des pipelines CI/CD pour les tests automatisés et le déploiement cloud Azure

---

## 2. Aperçu du Projet

### 2.1 Objectif du Projet

WorkReserve est conçu pour révolutionner la gestion des espaces de travail en fournissant une plateforme complète qui permet aux organisations de gérer efficacement leurs ressources physiques tout en offrant aux utilisateurs une expérience de réservation fluide. La plateforme adresse plusieurs besoins métier critiques :

**Optimisation des Ressources** : Maximise l'utilisation des espaces de travail disponibles à travers la planification intelligente et le suivi de disponibilité en temps réel.

**Expérience Utilisateur** : Fournit une interface intuitive, pilotée par calendrier, qui simplifie le processus de réservation tout en maintenant la sécurité et la fiabilité.

**Gestion Financière** : Intègre la facturation automatisée et le traitement de paiement pour rationaliser la collecte de revenus et les rapports financiers.

**Contrôle Administratif** : Offre des outils administratifs complets pour surveiller les modèles d'usage, gérer les utilisateurs et générer des rapports de business intelligence.

### 2.2 Fonctionnalités Principales et Caractéristiques

#### 2.2.1 Système de Gestion des Utilisateurs
- **Inscription et Authentification** : Inscription utilisateur sécurisée avec vérification email et gestion de session basée JWT
- **Authentification Multi-Facteurs** : Implémentation 2FA optionnelle utilisant TOTP (Time-based One-Time Passwords) avec génération de QR code
- **Contrôle d'Accès Basé sur les Rôles** : Système de permissions hiérarchique supportant les rôles USER et ADMIN avec contrôles d'accès granulaires
- **Gestion de Profil** : Système de profil utilisateur complet avec support d'avatar et gestion des préférences

#### 2.2.2 Système de Réservation d'Espaces de Travail
- **Disponibilité en Temps Réel** : Vérification dynamique de disponibilité avec résolution de conflits pour prévenir les double-réservations
- **Intégration Calendrier** : Interface calendrier intuitive alimentée par React Big Calendar pour la gestion visuelle des réservations
- **Validation de Taille d'Équipe** : Vérification automatique de capacité pour s'assurer que les réservations ne dépassent pas les limitations de salle
- **Gestion du Cycle de Vie des Réservations** : Workflow complet de la réservation initiale à travers la confirmation et l'achèvement

#### 2.2.3 Traitement des Paiements
- **Intégration Stripe** : Traitement de paiement sécurisé utilisant l'API Stripe PaymentIntents avec conformité PCI
- **Logique de Retry** : Gestion d'erreurs robuste avec backoff exponentiel pour les échecs de paiement transitoires
- **Opérations Idempotentes** : Système de confirmation de paiement conçu pour prévenir les charges en double
- **Audit des Transactions** : Logging complet de toutes les activités de paiement pour la conformité et le debugging

#### 2.2.4 Tableau de Bord Administratif
- **Analytics d'Usage** : Statistiques en temps réel sur l'utilisation des salles, l'activité utilisateur et les métriques de revenus
- **Gestion des Utilisateurs** : Outils administratifs pour la gestion des comptes utilisateur, l'assignation de rôles et la récupération de comptes
- **Configuration des Salles** : Création, modification et gestion des prix des salles dynamiques
- **Surveillance Système** : Métriques opérationnelles incluant les performances du cache, la santé système et le suivi d'erreurs

#### 2.2.5 Gestion des Créneaux Horaires
- **Génération Dynamique** : Création automatisée de créneaux avec intervalles configurables et fenêtres de disponibilité
- **Processus de Nettoyage** : Nettoyage programmé des créneaux expirés pour maintenir l'efficacité de la base de données
- **Calcul de Disponibilité** : Calcul de disponibilité en temps réel considérant les réservations existantes et la capacité des salles

### 2.3 Conception Système de Haut Niveau

La plateforme WorkReserve emploie une architecture moderne en couches qui met l'accent sur la séparation des préoccupations, la scalabilité et la maintenabilité. Le système est structuré comme suit :

#### 2.3.1 Couche de Présentation (Frontend)
- **React 19** : Framework UI moderne basé sur les composants avec hooks et composants fonctionnels
- **TypeScript** : Développement type-safe avec support IDE amélioré et prévention d'erreurs runtime
- **Tailwind CSS** : Framework CSS utility-first pour le développement d'UI rapide et cohérent
- **Framer Motion** : Bibliothèque d'animation avancée pour une expérience utilisateur améliorée

#### 2.3.2 Couche API (Contrôleurs Backend)
- **APIs RESTful** : Endpoints bien définis suivant les principes REST avec codes de statut HTTP appropriés
- **Validation des Requêtes** : Validation d'entrée complète utilisant Spring Boot Validation
- **Gestion d'Erreurs** : Gestion d'exceptions centralisée avec réponses d'erreur significatives
- **Limitation de Débit** : Limitation de débit basée Bucket4j pour prévenir l'abus et assurer la disponibilité du service

#### 2.3.3 Couche de Logique Métier (Services)
- **Pattern Service** : Encapsulation de la logique métier dans des classes de service dédiées
- **Gestion des Transactions** : Gestion appropriée des transactions de base de données pour la cohérence des données
- **Traitement Événementiel** : Traitement asynchrone pour les opérations non-critiques
- **Intégration de Cache** : Implémentation de cache stratégique pour l'optimisation des performances

#### 2.3.4 Couche d'Accès aux Données (Repositories)
- **Spring Data JPA** : Mapping objet-relationnel avec implémentation Hibernate
- **Requêtes Personnalisées** : Requêtes de base de données optimisées pour les opérations métier complexes
- **Migrations de Base de Données** : Changements de schéma contrôlés par version utilisant Hibernate DDL
- **Pooling de Connexions** : Gestion efficace des connexions de base de données

#### 2.3.5 Couche Infrastructure
- **Configuration de Sécurité** : Spring Security avec gestion de token JWT et configuration CORS
- **Infrastructure de Cache** : Cache en mémoire Caffeine avec politiques d'éviction configurables
- **Services Mail** : Livraison email basée SMTP avec support de templates HTML
- **Stockage de Fichiers** : Stockage sur système de fichiers local avec répertoires d'upload configurables

### 2.4 Technologies Utilisées

#### 2.4.1 Technologies Backend
**Framework Principal :**
- Spring Boot 3.2.5 - Framework Java niveau entreprise pour le développement d'application rapide
- Java 21 - Version LTS la plus récente fournissant des performances améliorées et des fonctionnalités de langage modernes

**Gestion des Données :**
- Spring Data JPA - Implémentation du mapping objet-relationnel et du pattern repository
- Hibernate - Framework ORM pour l'abstraction de base de données et l'optimisation des requêtes
- PostgreSQL - Base de données de production avec conformité ACID et fonctionnalités avancées
- H2 Database - Base de données en mémoire pour les environnements de test et développement

**Sécurité et Authentification :**
- Spring Security - Framework de sécurité complet avec authentification et autorisation
- JWT (JSON Web Tokens) - Authentification sans état utilisant la bibliothèque JJWT (v0.11.5)
- TOTP (Time-based OTP) - Authentification à deux facteurs utilisant dev.samstevens.totp
- BCrypt - Hachage de mot de passe avec force configurable

**Performance et Cache :**
- Caffeine Cache - Bibliothèque de cache en mémoire haute performance
- Spring Cache Abstraction - Cache déclaratif avec configuration basée annotations
- Bucket4j - Implémentation de limitation de débit pour la protection d'API

**Intégrations Externes :**
- Stripe Java SDK (v24.16.0) - Traitement de paiement avec support API complet
- Spring Mail - Intégration de service email avec support SMTP
- Google OAuth2 - Intégration d'authentification sociale

**Tests et Documentation :**
- JUnit 5 - Framework de tests unitaires avec patterns de test modernes
- Mockito - Framework de mocking pour les tests unitaires isolés
- Spring Boot Test - Tests d'intégration avec contexte d'application
- SpringDoc OpenAPI - Génération automatisée de documentation d'API

**Build et Déploiement :**
- Maven - Gestion de dépendances et automatisation de build
- Spring Boot Actuator - Endpoints de surveillance et gestion de production

#### 2.4.2 Technologies Frontend
**Framework Principal :**
- React 19.1.0 - Bibliothèque UI basée composants avec dernières fonctionnalités et optimisations
- TypeScript 5.8.3 - Superset JavaScript type-safe pour une expérience de développement améliorée
- Vite 7.0.0 - Outil de build nouvelle génération avec HMR rapide et bundling optimisé

**UI et Styling :**
- Tailwind CSS 3.4.17 - Framework CSS utility-first pour le styling rapide
- Radix UI - Composants UI non-stylés et accessibles pour les interactions complexes
- Lucide React - Bibliothèque d'icônes complète avec design cohérent
- Framer Motion 12.23.0 - Bibliothèque d'animation avancée pour les expériences interactives

**Gestion d'État et Formulaires :**
- React Hook Form 7.59.0 - Formulaires performants avec re-renders minimaux
- Zod 3.25.73 - Validation de schéma avec intégration TypeScript
- React Context - Gestion d'état intégrée pour l'état global d'application

**Données et API :**
- Axios 1.10.0 - Client HTTP avec intercepteurs et transformation requête/réponse
- React Query (TanStack Query) patterns - Gestion d'état serveur et cache

**Calendrier et Gestion de Dates :**
- React Big Calendar 1.19.4 - Composant calendrier complet pour l'interface de réservation
- React Day Picker 9.7.0 - Sélecteur de date flexible avec options de personnalisation
- Date-fns 4.1.0 - Bibliothèque utilitaire de date moderne avec approche programmation fonctionnelle

**Intégration de Paiement :**
- Stripe React (3.9.0) & Stripe JS (7.8.0) - Composants de formulaire de paiement sécurisés et intégration API

**Graphiques et Analytics :**
- Recharts 3.1.0 - Bibliothèque de graphiques composable pour la visualisation de données

**Tests :**
- Jest 30.0.5 - Framework de test JavaScript avec bibliothèque d'assertions complète
- Testing Library React 16.3.0 - Utilitaires de test simples et complets pour les composants React
- Jest Environment JSDOM - Environnement de test DOM pour le rendu de composants

**Outils de Développement :**
- ESLint - Linting de code avec règles spécifiques TypeScript et React
- TypeScript ESLint - Linting amélioré pour les codebases TypeScript
- Autoprefixer - Préfixage automatique CSS vendor pour la compatibilité navigateur

#### 2.4.3 DevOps et Infrastructure
**Plateforme Cloud :**
- Microsoft Azure - Plateforme d'hébergement cloud avec services intégrés
- Azure Static Web Apps - Hébergement frontend avec CDN global
- Azure App Service - Hébergement backend avec capacités d'auto-scaling

**Pipeline CI/CD :**
- GitHub Actions - Workflows automatisés de test, build et déploiement
- Déploiement multi-environnement avec configurations staging et production
- Vérifications de santé automatisées et capacités de rollback

**Outils de Développement :**
- Git - Contrôle de version avec workflow de branches de fonctionnalités
- GitHub - Dépôt de code avec révisions de pull request et suivi d'issues
- Visual Studio Code - Configuration IDE avec extensions recommandées

---

## 3. Architecture Système et Conception

### 3.1 Pattern d'Architecture Globale

WorkReserve suit un pattern d'**Architecture en Couches** avec des éléments d'**Architecture Orientée Services (SOA)**. Le système est conçu comme une application distribuée avec une séparation claire entre le client frontend et l'API backend, communiquant à travers des interfaces REST bien définies.

```
┌─────────────────────────────────────────────────────────────┐
│                   COUCHE DE PRÉSENTATION                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   React     │  │  TypeScript │  │  Tailwind   │          │
│  │ Components  │  │   Services  │  │     CSS     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PASSERELLE API                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    CORS     │  │     JWT     │  │ Limitation  │          │
│  │  Security   │  │   Filter    │  │   Débit     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  COUCHE LOGIQUE MÉTIER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Service   │  │   Service   │  │   Service   │          │
│  │    Auth     │  │  Réservation│  │  Paiement   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Service   │  │   Service   │  │   Service   │          │
│  │   Salle     │  │ Utilisateur │  │   Admin     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  COUCHE D'ACCÈS AUX DONNÉES                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Repositories│  │  Hibernate  │  │   Requêtes  │          │
│  │     JPA     │  │    ORM      │  │ Personnalisé│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   COUCHE INFRASTRUCTURE                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ PostgreSQL  │  │   Caffeine  │  │    SMTP     │          │
│  │ Base Données│  │    Cache    │  │    Mail     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Stripe    │  │  Stockage   │  │   Système   │          │
│  │     API     │  │  Fichiers   │  │    Logs     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Détails de l'Architecture Backend

#### 3.2.1 Architecture de Services Modulaires

Le backend est organisé en modules de domaine distincts, chacun responsable de capacités métier spécifiques :

**Module Authentification (`auth`)**
- `AuthController` : Gère la connexion, l'inscription et la gestion des tokens
- `TwoFactorController` : Gère la configuration 2FA, la vérification et les codes de sauvegarde
- `GoogleOAuthService` : Intègre Google OAuth pour l'authentification sociale
- `TwoFactorService` : Implémente la logique d'authentification basée TOTP

**Module Gestion des Utilisateurs (`user`)**
- `UserController` : Opérations de gestion de profil utilisateur et de compte
- `UserService` : Logique métier pour le cycle de vie et la validation des utilisateurs
- `UserRepository` : Couche d'accès aux données pour les entités utilisateur

**Module Gestion des Salles (`room`)**
- `RoomController` : Opérations CRUD pour les définitions d'espaces de travail
- `RoomService` : Logique métier pour la disponibilité et les prix des salles
- `RoomRepository` : Opérations de base de données pour les entités salle

**Module Réservation (`reservation`)**
- `ReservationController` : Création, modification et annulation de réservations
- `ReservationService` : Logique de réservation principale avec résolution de conflits
- `ReservationRepository` : Persistance des données pour les entités de réservation

**Module Paiement (`payment`)**
- `PaymentController` : Création et confirmation d'intentions de paiement
- `PaymentService` : Intégration Stripe avec logique de retry et gestion d'erreurs

**Module Créneaux Horaires (`timeslot`)**
- Gestion des intervalles de temps pour les périodes réservables
- Nettoyage automatisé des créneaux expirés
- Algorithmes de calcul de disponibilité

**Module Admin (`admin`)**
- `AdminService` : Opérations administratives et analytics
- Capacités de statistiques système et de rapports
- Gestion des utilisateurs et surveillance système

#### 3.2.2 Modèle de Données et Relations d'Entités

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Utilisateur │         │    Salle    │         │ CréneauHour │
│─────────────│         │─────────────│         │─────────────│
│ id (PK)     │    ┌────│ id (PK)     │    ┌────│ id (PK)     │
│ email       │    │    │ nom         │    │    │ salleId(FK) │
│ motDePasse  │    │    │ capacité    │    │    │ heureDebut  │
│ prénom      │    │    │ prixParHeure│    │    │ heureFin    │
│ nom         │    │    │ typeSalle   │    │    │ disponible  │
│ rôle        │    │    │ description │    │    │ crééLe      │
│ secret2FA   │    │    │ caractérist.│    │    └─────────────┘
│ activé      │    │    │ crééLe      │    │            │
│ crééLe      │    │    └─────────────┘    │            │
└─────────────┘    │                       │            │
       │           │                       │            │
       │           │    ┌─────────────┐    │            │
       │           └────│ Réservation │────┘            │
       │                │─────────────│                 │
       └────────────────│ id (PK)     │─────────────────┘
                        │ utilisId(FK)│
                        │ creneauId   │
                        │ tailleEquip │
                        │ statut      │
                        │ refPaiement │
                        │ montantTotal│
                        │ crééLe      │
                        │ confirméLe  │
                        └─────────────┘
```

**Relations d'Entités :**
- **Utilisateur** (1) → (N) **Réservation** : Les utilisateurs peuvent avoir plusieurs réservations
- **Salle** (1) → (N) **CréneauHoraire** : Chaque salle a plusieurs créneaux horaires
- **CréneauHoraire** (1) → (1) **Réservation** : Chaque créneau peut avoir une réservation
- **Utilisateur** (1) → (N) **Activité** : Logging d'activité pour les pistes d'audit

### 3.3 Détails de l'Architecture Frontend

#### 3.3.1 Architecture des Composants

Le frontend suit une **Architecture de Composants Hiérarchiques** avec des patterns de flux de données clairs :

```
App
├── Composants de Layout
│   ├── Header (Navigation, Menu Utilisateur)
│   ├── Sidebar (Menu de Navigation)
│   └── Footer (Informations Système)
├── Composants de Page
│   ├── LandingPage (Marketing, Fonctionnalités)
│   ├── AuthPages (Connexion, Inscription, 2FA)
│   ├── Dashboard (Vue d'ensemble Utilisateur)
│   ├── BookingPages (Calendrier, Sélection Salle)
│   ├── PaymentPages (Intégration Stripe)
│   └── AdminPages (Analytics, Gestion)
├── Composants de Fonctionnalité
│   ├── Calendar (React Big Calendar)
│   ├── RoomCard (Affichage Informations Salle)
│   ├── ReservationCard (Détails Réservation)
│   └── PaymentForm (Stripe Elements)
└── Composants UI (Réutilisables)
    ├── Button, Input, Modal
    ├── DatePicker, TimePicker
    └── Charts, Tables, Forms
```

#### 3.3.2 Stratégie de Gestion d'État

**État Global Basé Context :**
```typescript
// Context d'Authentification
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
}

// Context de Réservation
interface BookingContextType {
  selectedRoom: Room | null;
  selectedTimeSlot: TimeSlot | null;
  bookingDetails: BookingDetails | null;
  setSelectedRoom: (room: Room) => void;
  setSelectedTimeSlot: (slot: TimeSlot) => void;
}
```

**État Local des Composants :**
- Données de formulaire et états de validation
- États d'interaction UI (chargement, erreur, succès)
- Données temporaires spécifiques aux composants

### 3.4 Architecture de Sécurité

#### 3.4.1 Flux d'Authentification

```
┌─────────────┐  1. Requête Connexion  ┌─────────────┐
│   Frontend  │ ─────────────────────→ │   Backend   │
│             │                        │             │
│             │    2. Token JWT        │             │
│             │ ←───────────────────── │             │
│             │                        │             │
│             │ 3. Stocker Token (Mém.)│             │
│             │                        │             │
│             │ 4. Requêtes API + JWT  │             │
│             │ ─────────────────────→ │             │
│             │                        │             │
│             │ 5. Vérifier JWT & Trait│             │
│             │ ←───────────────────── │             │
└─────────────┘                        └─────────────┘
```

#### 3.4.2 Implémentation Authentification à Deux Facteurs

```
Phase de Configuration :
1. L'utilisateur active 2FA dans le profil
2. Le backend génère un secret TOTP
3. QR code affiché pour l'app d'authentification
4. Codes de sauvegarde générés et affichés
5. L'utilisateur confirme la configuration avec code TOTP

Phase de Connexion :
1. Authentification primaire (email/mot de passe)
2. Si 2FA activé → demander code TOTP
3. Vérifier code TOTP ou code de sauvegarde
4. Émettre token JWT complet
5. Accorder accès système complet
```

### 3.5 Stratégie de Cache

L'application implémente une **Stratégie de Cache Multi-Niveaux** utilisant Caffeine :

#### 3.5.1 Couches de Cache

**L1 - Cache Application (Caffeine)**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(10, TimeUnit.MINUTES)
            .recordStats());
        return cacheManager;
    }
}
```

**Catégories de Cache :**
- **Données Salle** : Informations salle, caractéristiques, prix (TTL 30 minutes)
- **Disponibilité Créneaux** : Données de disponibilité temps réel (TTL 5 minutes)
- **Contexte Utilisateur** : Profil utilisateur et permissions (TTL 15 minutes)
- **Statistiques Système** : Métriques tableau de bord admin (TTL 10 minutes)

#### 3.5.2 Stratégie d'Invalidation de Cache

**Invalidation Pilotée par Événements :**
- Modifications salle → Vider cache salle
- Nouvelles réservations → Vider cache disponibilité
- Mises à jour utilisateur → Vider cache contexte utilisateur

**Expiration Basée Temps :**
- TTL configurable par catégorie de cache
- Éviction automatique en arrière-plan
- Éviction basée pression mémoire

---

## 4. Détails d'Implémentation

### 4.1 Composants Clés du Code et Patterns Architecturaux

#### 4.1.1 Implémentation du Pattern Repository

L'application utilise les repositories Spring Data JPA avec méthodes de requête personnalisées pour les opérations complexes :

```java
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId " +
           "AND r.status = com.workreserve.backend.reservation.ReservationStatus.CONFIRMED " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findConfirmedReservationsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.timeSlot.room.id = :roomId " +
           "AND r.status = com.workreserve.backend.reservation.ReservationStatus.CONFIRMED " +
           "AND r.timeSlot.startTime >= :startDate AND r.timeSlot.endTime <= :endDate")
    Long countReservationsForRoomInPeriod(@Param("roomId") Long roomId, 
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
}
```

#### 4.1.2 Pattern Couche Service

La logique métier est encapsulée dans des classes de service avec séparation claire des préoccupations :

```java
@Service
@Transactional
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private TimeSlotService timeSlotService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Cacheable(value = "userReservations", key = "#userId")
    public List<ReservationResponse> getUserReservations(Long userId) {
        List<Reservation> reservations = reservationRepository
            .findConfirmedReservationsByUserId(userId);
        return reservations.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    @CacheEvict(value = {"roomAvailability", "userReservations"}, allEntries = true)
    public ReservationResponse createReservation(CreateReservationRequest request) {
        // Implémentation logique métier
        validateReservationRequest(request);
        TimeSlot timeSlot = timeSlotService.findById(request.getTimeSlotId());
        checkAvailability(timeSlot, request.getTeamSize());
        
        Reservation reservation = buildReservation(request, timeSlot);
        reservation = reservationRepository.save(reservation);
        
        return convertToResponse(reservation);
    }
}
```

#### 4.1.3 Pattern DTO pour Transfert de Données

Les Objets de Transfert de Données assurent des contrats d'API propres et la sécurité :

```java
public class CreateReservationRequest {
    @NotNull(message = "L'ID du créneau horaire est requis")
    private Long timeSlotId;
    
    @Min(value = 1, message = "La taille d'équipe doit être au moins 1")
    @Max(value = 50, message = "La taille d'équipe ne peut dépasser 50")
    private Integer teamSize;
    
    @NotBlank(message = "L'objectif est requis")
    @Size(max = 500, message = "L'objectif ne peut dépasser 500 caractères")
    private String purpose;
    
    // Getters et setters
}

public class ReservationResponse {
    private Long id;
    private TimeSlotResponse timeSlot;
    private Integer teamSize;
    private String purpose;
    private ReservationStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    
    // Constructeurs, getters et setters
}
```

### 4.2 Patterns de Conception et Décisions Architecturales

#### 4.2.1 Pattern Strategy pour Traitement des Paiements

Le système de paiement est conçu pour supporter plusieurs fournisseurs de paiement via le pattern Strategy :

```java
public interface PaymentProcessor {
    PaymentIntentResponse createPaymentIntent(PaymentRequest request);
    PaymentConfirmationResponse confirmPayment(String paymentIntentId);
    RefundResponse processRefund(RefundRequest request);
}

@Component
public class StripePaymentProcessor implements PaymentProcessor {
    
    @Autowired
    private StripeService stripeService;
    
    @Override
    public PaymentIntentResponse createPaymentIntent(PaymentRequest request) {
        return stripeService.createPaymentIntent(request);
    }
    
    // Détails d'implémentation
}

@Service
public class PaymentService {
    
    private final Map<String, PaymentProcessor> processors = new HashMap<>();
    
    @PostConstruct
    public void initializeProcessors() {
        processors.put("stripe", stripePaymentProcessor);
        // Les futurs processeurs peuvent être ajoutés ici
    }
    
    public PaymentIntentResponse processPayment(PaymentRequest request) {
        PaymentProcessor processor = processors.get(request.getProvider());
        return processor.createPaymentIntent(request);
    }
}
```

#### 4.2.2 Pattern Factory pour Création d'Entités

La création d'entités est centralisée utilisant le pattern Factory :

```java
@Component
public class ReservationFactory {
    
    public Reservation createReservation(User user, TimeSlot timeSlot, 
                                       CreateReservationRequest request) {
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setTimeSlot(timeSlot);
        reservation.setTeamSize(request.getTeamSize());
        reservation.setPurpose(request.getPurpose());
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setTotalAmount(calculateAmount(timeSlot, request.getTeamSize()));
        
        return reservation;
    }
    
    private BigDecimal calculateAmount(TimeSlot timeSlot, Integer teamSize) {
        // Logique de calcul des prix
        Duration duration = Duration.between(
            timeSlot.getStartTime(), 
            timeSlot.getEndTime()
        );
        double hours = duration.toMinutes() / 60.0;
        BigDecimal basePrice = timeSlot.getRoom().getPricePerHour();
        return basePrice.multiply(BigDecimal.valueOf(hours));
    }
}
```

#### 4.2.3 Pattern Observer pour Gestion d'Événements

Les événements système sont gérés utilisant le pattern Observer :

```java
@Component
public class ReservationEventHandler {
    
    @Autowired
    private MailService mailService;
    
    @Autowired
    private ActivityService activityService;
    
    @EventListener
    public void handleReservationConfirmed(ReservationConfirmedEvent event) {
        Reservation reservation = event.getReservation();
        
        // Envoyer email de confirmation
        mailService.sendReservationConfirmation(reservation);
        
        // Logger l'activité
        activityService.logActivity(
            reservation.getUser(),
            "RESERVATION_CONFIRMED",
            "Réservation " + reservation.getId() + " confirmée"
        );
        
        // Mettre à jour le cache
        cacheManager.getCache("userReservations").evict(reservation.getUser().getId());
    }
}
```

### 4.3 Mécanismes de Sécurité et d'Authentification

#### 4.3.1 Implémentation JWT

```java
@Component
public class JwtService {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;
    
    public String generateJwtToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationMs);
        
        return Jwts.builder()
            .setSubject(userPrincipal.getEmail())
            .claim("userId", userPrincipal.getId())
            .claim("role", userPrincipal.getRole())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUserEmailFromJwtToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException | MalformedJwtException | 
                 ExpiredJwtException | UnsupportedJwtException | 
                 IllegalArgumentException e) {
            logger.error("Signature JWT invalide : {}", e.getMessage());
        }
        return false;
    }
}
```

#### 4.3.2 Implémentation Authentification à Deux Facteurs

```java
@Service
public class TwoFactorService {
    
    private static final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private static final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private static final CodeVerifier codeVerifier = new DefaultCodeVerifier();
    
    public String generateSecret() {
        Secret secret = secretGenerator.generate();
        return secret.getValue();
    }
    
    public String generateQrCode(String email, String secret) {
        QrData data = new QrData.Builder()
            .label(email)
            .secret(secret)
            .issuer("WorkReserve")
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();
        
        return Utils.getDataUriForImage(
            qrGenerator.generate(data),
            qrGenerator.getImageMimeType()
        );
    }
    
    public boolean verifyCode(String secret, String code) {
        return codeVerifier.isValidCode(secret, code);
    }
    
    public List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        SecureRandom random = new SecureRandom();
        
        for (int i = 0; i < 10; i++) {
            codes.add(String.format("%08d", random.nextInt(100000000)));
        }
        
        return codes;
    }
}
```

### 4.4 Détails d'Intégration des Paiements

#### 4.4.1 Intégration Stripe avec Logique de Retry

```java
@Service
public class PaymentService {
    
    @Autowired
    private StripeService stripeService;
    
    @Retryable(value = {StripeException.class}, 
               maxAttempts = 3,
               backoff = @Backoff(delay = 1000, multiplier = 2))
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount().longValue())
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("timeSlotId", request.getTimeSlotId().toString())
                .putMetadata("teamSize", request.getTeamSize().toString())
                .putMetadata("userId", request.getUserId().toString())
                .build();
            
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            return PaymentIntentResponse.builder()
                .id(paymentIntent.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .amount(BigDecimal.valueOf(paymentIntent.getAmount()))
                .status(paymentIntent.getStatus())
                .build();
            
        } catch (StripeException e) {
            logger.error("Erreur création intention paiement : {}", e.getMessage());
            throw new PaymentProcessingException("Échec création intention paiement", e);
        }
    }
    
    @Recover
    public PaymentIntentResponse recover(StripeException ex, CreatePaymentIntentRequest request) {
        logger.error("Échec création intention paiement après tentatives : {}", ex.getMessage());
        throw new PaymentProcessingException("Service de paiement temporairement indisponible", ex);
    }
}
```

#### 4.4.2 Confirmation de Paiement Idempotente

```java
@Service
@Transactional
public class PaymentConfirmationService {
    
    @Autowired
    private ReservationService reservationService;
    
    @Autowired
    private PaymentService paymentService;
    
    public ConfirmPaymentResponse confirmPayment(ConfirmPaymentRequest request) {
        String paymentIntentId = request.getPaymentIntentId();
        
        // Vérifier si déjà traité (idempotence)
        Optional<Reservation> existingReservation = reservationService
            .findByPaymentIntentId(paymentIntentId);
        
        if (existingReservation.isPresent()) {
            return ConfirmPaymentResponse.builder()
                .reservationId(existingReservation.get().getId())
                .status("ALREADY_CONFIRMED")
                .message("Paiement déjà traité")
                .build();
        }
        
        // Vérifier paiement avec Stripe
        PaymentIntent paymentIntent = paymentService.retrievePaymentIntent(paymentIntentId);
        
        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new PaymentException("Paiement non réussi : " + paymentIntent.getStatus());
        }
        
        // Extraire métadonnées et créer réservation
        Long timeSlotId = Long.parseLong(paymentIntent.getMetadata().get("timeSlotId"));
        Long userId = Long.parseLong(paymentIntent.getMetadata().get("userId"));
        Integer teamSize = Integer.parseInt(paymentIntent.getMetadata().get("teamSize"));
        
        CreateReservationRequest reservationRequest = CreateReservationRequest.builder()
            .timeSlotId(timeSlotId)
            .teamSize(teamSize)
            .paymentIntentId(paymentIntentId)
            .build();
        
        Reservation reservation = reservationService.createConfirmedReservation(
            userId, reservationRequest
        );
        
        return ConfirmPaymentResponse.builder()
            .reservationId(reservation.getId())
            .status("CONFIRMED")
            .message("Réservation créée avec succès")
            .build();
    }
}
```

### 4.5 Patterns d'Implémentation Frontend

#### 4.5.1 Hooks Personnalisés pour Intégration API

```typescript
// Hook useAuth
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      // Stocker token en mémoire
      localStorage.setItem('token', token);
      setUser(user);
      
      // Configurer intercepteur axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
    } catch (err) {
      setError(err.response?.data?.message || 'Échec connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return { user, isLoading, error, login, logout };
};

// Hook useBooking
export const useBooking = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const checkAvailability = async (roomId: number, date: Date): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await roomService.getAvailableSlots(roomId, date);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Erreur vérification disponibilité :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (bookingData: CreateBookingRequest): Promise<void> => {
    const response = await reservationService.createReservation(bookingData);
    return response.data;
  };

  return {
    selectedRoom,
    selectedTimeSlot,
    availableSlots,
    isLoading,
    setSelectedRoom,
    setSelectedTimeSlot,
    checkAvailability,
    createBooking
  };
};
```

#### 4.5.2 Validation de Formulaires avec React Hook Form et Zod

```typescript
// Schéma de Validation
const reservationSchema = z.object({
  timeSlotId: z.number().min(1, "Veuillez sélectionner un créneau horaire"),
  teamSize: z.number()
    .min(1, "La taille d'équipe doit être au moins 1")
    .max(50, "La taille d'équipe ne peut dépasser 50"),
  purpose: z.string()
    .min(1, "L'objectif est requis")
    .max(500, "L'objectif ne peut dépasser 500 caractères")
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// Composant Formulaire
const BookingForm: React.FC<BookingFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema)
  });

  const watchedTimeSlot = watch("timeSlotId");

  const onSubmitHandler = async (data: ReservationFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Gestion d'erreurs
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div>
        <label htmlFor="teamSize">Taille d'Équipe</label>
        <input
          {...register("teamSize", { valueAsNumber: true })}
          type="number"
          min="1"
          max="50"
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.teamSize && (
          <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="purpose">Objectif</label>
        <textarea
          {...register("purpose")}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300"
          placeholder="Décrivez l'objectif de votre réservation..."
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Création Réservation..." : "Créer Réservation"}
      </button>
    </form>
  );
};
```

---