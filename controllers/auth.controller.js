// Contrôleurs pour la gestion des utilisateurs et de l'authentification

const authService = require('../services/auth.services');
const userModel = require('../models/user.model');

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
    try {
        const requiredFields = ['username', 'email', 'password'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Champs manquants', 
                missingFields 
            });
        }

        const userId = await authService.registerUser(req.body);
        res.status(201).json({
            message: '✅ Compte créé avec succès',
            userId
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: '❌ Cet email est déjà utilisé' });
        }
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Connexion d'un utilisateur
const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body.email, req.body.password);
        if (!result) {
            return res.status(401).json({ message: '❌ Email ou mot de passe incorrect' });
        }
        res.json({
            ...result,
            message: '✅ Connexion réussie'
        });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Déconnexion (gérée côté client)
const logout = (req, res) => {
    res.json({ message: '✅ Déconnecté - Supprimez votre jeton côté client' });
};

// Récupère tous les utilisateurs (admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Récupère un utilisateur par ID
const getUserById = async (req, res) => {
    try {
        const user = await authService.getUserById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Récupère un utilisateur par email
const getUserByEmail = async (req, res) => {
    try {
        const user = await userModel.findUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Récupère un utilisateur par username
const getUserByUsername = async (req, res) => {
    try {
        const user = await userModel.findUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Met à jour un utilisateur par ID
const updateUserById = async (req, res) => {
    try {
        const result = await userModel.updateUserById(req.params.userId, req.body);
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable ou aucune modification' });
        }
        res.json({ message: '✅ Utilisateur mis à jour' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Met à jour un utilisateur par email
const updateUserByEmail = async (req, res) => {
    try {
        const result = await userModel.updateUserByEmail(req.params.email, req.body);
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable ou aucune modification' });
        }
        res.json({ message: '✅ Utilisateur mis à jour' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Met à jour un utilisateur par username
const updateUserByUsername = async (req, res) => {
    try {
        const result = await userModel.updateUserByUsername(req.params.username, req.body);
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable ou aucune modification' });
        }
        res.json({ message: '✅ Utilisateur mis à jour' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Supprime un utilisateur par ID
const deleteUserById = async (req, res) => {
    try {
        const result = await userModel.deleteUserById(req.params.userId);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        res.json({ message: '✅ Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Supprime un utilisateur par email
const deleteUserByEmail = async (req, res) => {
    try {
        const result = await userModel.deleteUserByEmail(req.params.email);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        res.json({ message: '✅ Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Supprime un utilisateur par username
const deleteUserByUsername = async (req, res) => {
    try {
        const result = await userModel.deleteUserByUsername(req.params.username);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '❌ Utilisateur introuvable' });
        }
        res.json({ message: '✅ Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByUsername,
    updateUserById,
    updateUserByEmail,
    updateUserByUsername,
    deleteUserById,
    deleteUserByEmail,
    deleteUserByUsername
};