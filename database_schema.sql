-- Script de construction de la base de données MariaDB pour Meetyyou
-- Date: 2026-04-02

CREATE DATABASE IF NOT EXISTS meetyyou_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meetyyou_db;

-- Table des utilisateurs (Authentification)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    name VARCHAR(100),
    first_name VARCHAR(100),
    display_name VARCHAR(100),
    age INT,
    gender ENUM('homme', 'femme', 'autre'),
    bio TEXT,
    photo VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    email VARCHAR(255),
    is_online BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY,
    last_message TEXT,
    unread_count JSON, -- Stocke les compteurs par utilisateur au format JSON
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table de liaison Conversations <-> Utilisateurs (Participants)
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id VARCHAR(50),
    user_email VARCHAR(255),
    PRIMARY KEY (conversation_id, user_email),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50),
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),
    content TEXT,
    translated_text TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    user_email VARCHAR(255),
    plan VARCHAR(50), -- 'premium', 'vip', 'elite'
    status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'EUR',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL
);

-- Table des transactions (Historique des paiements)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(50),
    user_email VARCHAR(255),
    plan VARCHAR(50),
    amount VARCHAR(20),
    status VARCHAR(50),
    type ENUM('Stripe', 'Manuel') DEFAULT 'Stripe',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL
);

-- Table des signalements
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    reporter_email VARCHAR(255),
    reported_email VARCHAR(255),
    reason TEXT,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs bloqués
CREATE TABLE IF NOT EXISTS block_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blocker_id VARCHAR(50),
    blocked_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_block (blocker_id, blocked_id)
);

-- Table des photos en attente de modération
CREATE TABLE IF NOT EXISTS pending_photos (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    photo_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'super_admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50),
    action TEXT,
    target_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_users_email ON users(email);
