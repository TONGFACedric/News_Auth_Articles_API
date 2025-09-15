/**
 * Modèle pour les opérations CRUD sur les utilisateurs
 * Interagit directement avec la collection 'users' dans MongoDB
 */

const { getDB } = require('../configs/db'); // Accès à la base de données
const { ObjectId } = require('mongodb'); // Pour travailler avec les ObjectId

/**
 * Crée un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<string>} ID de l'utilisateur créé
 */
const createUser = async (userData) => {
    const db = getDB();
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId;
};

/**
 * Trouve un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
const findUserByEmail = async (email) => {
    const db = getDB();
    return await db.collection('users').findOne({ email });
};

/**
 * Trouve un utilisateur par ID
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
const findUserById = async (userId) => {
    const db = getDB();
    return await db.collection('users').findOne({ _id: new ObjectId(userId) });
};

/**
 * Trouve un utilisateur par username
 * @param {string} username - Nom d'utilisateur
 * @returns {Promise<Object|null>} Utilisateur trouvé ou null
 */
const findUserByUsername = async (username) => {
    const db = getDB();
    return await db.collection('users').findOne({ username });
};

/**
 * Liste tous les utilisateurs (sans mots de passe)
 * @returns {Promise<Array>} Liste des utilisateurs
 */
const findAllUsers = async () => {
    const db = getDB();
    return await db.collection('users')
        .find({}, { projection: { password: 0 } }) // Exclut le password
        .toArray();
};

/**
 * Supprime un utilisateur par ID
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<number>} Nombre d'utilisateurs supprimés (0 ou 1)
 */
const deleteUserById = async (userId) => {
    const db = getDB();
    const result = await db.collection('users').deleteOne({ 
        _id: new ObjectId(userId) 
    });
    return result.deletedCount;
};

/**
 * Supprime un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<number>} Nombre d'utilisateurs supprimés
 */
const deleteUserByEmail = async (email) => {
    const db = getDB();
    const result = await db.collection('users').deleteOne({ email });
    return result.deletedCount;
};

/**
 * Supprime un utilisateur par username
 * @param {string} username - Nom d'utilisateur
 * @returns {Promise<number>} Nombre d'utilisateurs supprimés
 */
const deleteUserByUsername = async (username) => {
    const db = getDB();
    const result = await db.collection('users').deleteOne({ username });
    return result.deletedCount;
};

/**
 * Met à jour un utilisateur par ID
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'utilisateurs modifiés
 */
const updateUserById = async (userId, updateData) => {
    const db = getDB();
    // Hache le mot de passe s'il est fourni
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    updateData.updatedAt = new Date();
    
    const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
    );
    return result.modifiedCount;
};

/**
 * Met à jour un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'utilisateurs modifiés
 */
const updateUserByEmail = async (email, updateData) => {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db.collection('users').updateOne(
        { email },
        { $set: updateData }
    );
    return result.modifiedCount;
};

/**
 * Met à jour un utilisateur par username
 * @param {string} username - Nom d'utilisateur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'utilisateurs modifiés
 */
const updateUserByUsername = async (username, updateData) => {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db.collection('users').updateOne(
        { username },
        { $set: updateData }
    );
    return result.modifiedCount;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByUsername,
    findAllUsers,
    deleteUserById,
    deleteUserByEmail,
    deleteUserByUsername,
    updateUserById,
    updateUserByEmail,
    updateUserByUsername
};