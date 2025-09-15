/**
 * Service pour la gestion des articles
 * Contient la logique métier des opérations sur les articles
 */

const articleModel = require('../models/article.model'); // Modèle article
const { ObjectId } = require('mongodb'); // Pour valider les ObjectId

/**
 * Crée un nouvel article avec validation
 * @param {Object} articleData - Données de l'article
 * @returns {Promise<string>} ID de l'article créé
 * @throws {Error} Si les données sont invalides
 */
const createArticleService = async (articleData) => {
    // Validation des catégories
    // if (!Array.isArray(articleData.category)) {
    //     throw new Error('Les catégories doivent être un tableau');
    // }
    
    // Complétion des données de l'article
    const completeArticle = {
        ...articleData,
        imageUrl: articleData.imageUrl || "", // Valeur par défaut
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    return await articleModel.createArticle(completeArticle);
};

/**
 * Récupère les articles paginés
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'articles par page
 * @returns {Promise<Object>} Objet avec articles et info de pagination
 */
const getArticlesService = async (page, limit) => {
    return await articleModel.getAllArticles(page, limit);
};

/**
 * Récupère un article par ID
 * @param {string} articleId - ID de l'article
 * @returns {Promise<Object|null>} Article trouvé ou null
 * @throws {Error} Si l'ID est invalide
 */
const getArticleByIdService = async (articleId) => {
    if (!ObjectId.isValid(articleId)) {
        throw new Error('ID d\'article invalide');
    }
    return await articleModel.getArticleById(articleId);
};

/**
 * Met à jour un article
 * @param {string} articleId - ID de l'article
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 */
const updateArticleService = async (articleId, updateData) => {
    if (!ObjectId.isValid(articleId)) {
        throw new Error('ID d\'article invalide');
    }
    
    updateData.updatedAt = new Date();
    return await articleModel.updateArticle(articleId, updateData);
};

/**
 * Supprime un article par ID
 * @param {string} articleId - ID de l'article
 * @returns {Promise<number>} Nombre d'articles supprimés
 * @throws {Error} Si l'ID est invalide
 */
const deleteArticleService = async (articleId) => {
    if (!ObjectId.isValid(articleId)) {
        throw new Error('ID invalide');
    }
    return await articleModel.deleteArticle(articleId);
};

/**
 * Supprime des articles par titre
 * @param {string} title - Titre ou partie du titre
 * @returns {Promise<number>} Nombre d'articles supprimés
 * @throws {Error} Si le titre est invalide
 */
const deleteArticlesByTitleService = async (title) => {
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
        throw new Error('Le titre doit contenir au moins 2 caractères');
    }
    return await articleModel.deleteArticlesByTitle(title);
};

/**
 * Supprime des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @returns {Promise<number>} Nombre d'articles supprimés
 * @throws {Error} Si l'auteur est invalide
 */
const deleteArticlesByAuthorService = async (author) => {
    if (!author || typeof author !== 'string' || author.trim().length < 2) {
        throw new Error("Le nom d'auteur doit contenir au moins 2 caractères");
    }
    return await articleModel.deleteArticlesByAuthor(author);
};

/**
 * Récupère des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @returns {Promise<Array>} Liste des articles de l'auteur
 * @throws {Error} Si l'auteur est invalide
 */
const getArticlesByAuthorService = async (author) => {
    if (!author || typeof author !== 'string') {
        throw new Error('Nom d\'auteur invalide');
    }
    return await articleModel.getArticlesByAuthor(author);
};

/**
 * Met à jour des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 * @throws {Error} Si l'auteur est invalide
 */
const updateArticlesByAuthorService = async (author, updateData) => {
    if (!author || typeof author !== 'string') {
        throw new Error('Nom d\'auteur invalide');
    }
    return await articleModel.updateArticlesByAuthor(author, updateData);
};

/**
 * Récupère des articles par titre
 * @param {string} title - Titre ou partie du titre
 * @returns {Promise<Array>} Liste des articles correspondants
 * @throws {Error} Si le titre est invalide
 */
const getArticlesByTitleService = async (title) => {
    if (!title || typeof title !== 'string') {
        throw new Error('Titre invalide');
    }
    return await articleModel.getArticlesByTitle(title);
};

/**
 * Met à jour des articles par titre
 * @param {string} title - Titre ou partie du titre
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 * @throws {Error} Si le titre est invalide
 */
const updateArticlesByTitleService = async (title, updateData) => {
    if (!title || typeof title !== 'string') {
        throw new Error('Titre invalide');
    }
    return await articleModel.updateArticlesByTitle(title, updateData);
};

/**
 * Service de recherche d'articles par mots-clés
 * @param {string} query - Terme de recherche
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'articles par page
 * @returns {Promise<Object>} Résultats de la recherche avec pagination
 * @throws {Error} Si la requête est invalide
 */
const searchArticlesService = async (query, page = 1, limit = 10) => {
    // Validation de la requête de recherche
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        throw new Error('La requête de recherche doit contenir au moins 2 caractères');
    }
    
    // Validation de la pagination
    if (page < 1) throw new Error('Le numéro de page doit être supérieur à 0');
    if (limit < 1 || limit > 100) throw new Error('La limite doit être entre 1 et 100');
    
    const cleanedQuery = query.trim(); // Nettoie la requête des espaces superflus
    
    return await articleModel.searchArticles(cleanedQuery, page, limit);
};

module.exports = {
    createArticleService,
    getArticlesService,
    getArticleByIdService,
    updateArticleService,
    deleteArticleService,
    getArticlesByAuthorService,
    updateArticlesByAuthorService,
    getArticlesByTitleService,
    updateArticlesByTitleService,
    deleteArticlesByTitleService,
    deleteArticlesByAuthorService,
    searchArticlesService
};