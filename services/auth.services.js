/**
 * Service d'authentification et gestion des utilisateurs
 * Contient la logique métier pour l'inscription, connexion et gestion des utilisateurs
 */

const bcrypt = require('bcryptjs'); // Pour hacher les mots de passe
const jwt = require('jsonwebtoken'); // Pour générer les tokens JWT
const dotenv = require('dotenv'); // Variables d'environnement
const userModel = require('../models/user.model'); // Modèle utilisateur

dotenv.config(); // Charge les variables

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<string>} ID de l'utilisateur créé
 */
const registerUser = async (userData) => {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Création de l'objet utilisateur complet
    const newUser = {
        ...userData,
        password: hashedPassword,
        role: userData.role || 'member', // Par défaut 'member'
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    return await userModel.createUser(newUser);
};

/**
 * Connexion d'un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe non haché
 * @returns {Promise<Object|null>} Token et info utilisateur ou null si échec
 */
const loginUser = async (email, password) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) return null;
    
    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    
    // Génération du token JWT
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token valide 1 heure
    );
    
    return {
        token,
        userId: user._id,
        username: user.username,
        role: user.role
    };
};

/**
 * Vérifie un token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Payload décodé du token
 * @throws {Error} Si le token est invalide
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Récupère tous les utilisateurs (sans mots de passe)
 * @returns {Promise<Array>} Liste des utilisateurs
 */
const getAllUsers = async () => {
    return await userModel.findAllUsers();
};

/**
 * Récupère un utilisateur par ID (sans mot de passe)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
const getUserById = async (userId) => {
    const user = await userModel.findUserById(userId);
    if (!user) return null;
    
    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Met à jour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'utilisateurs modifiés
 */
const updateUser = async (userId, updateData) => {
    // Hachage du mot de passe s'il est fourni
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    updateData.updatedAt = new Date();
    return await userModel.updateUserById(userId, updateData);
};

/**
 * Supprime un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<number>} Nombre d'utilisateurs supprimés
 */
const deleteUser = async (userId) => {
    return await userModel.deleteUserById(userId);
};

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};