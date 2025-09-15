/**
 * Modèle pour les opérations CRUD sur les articles
 * Interagit directement avec la collection 'articles' dans MongoDB
 */

const { getDB } = require('../configs/db'); // Accès à la base de données
const { ObjectId } = require('mongodb'); // Pour les ObjectId MongoDB


/**
 * Recherche des articles par mots-clés dans le titre, description ou catégories
 * @param {string} query - Terme de recherche
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'articles par page
 * @returns {Promise<Object>} Objet avec les articles et info de pagination
 */
const searchArticles = async (query, page = 1, limit = 10) => {
    const db = getDB();
    const skip = (page - 1) * limit;
    
    // Création de la requête de recherche avec opérateur $regex pour une recherche insensible à la casse
    const searchQuery = {
        $or: [
            { title: { $regex: new RegExp(query, 'i') } }, // Recherche dans le titre
            { description: { $regex: new RegExp(query, 'i') } }, // Recherche dans la description
            { category: { $in: [new RegExp(query, 'i')] } }, // Recherche dans les catégories
            { journalName: { $regex: new RegExp(query, 'i') } }, // Recherche dans le nom du journal
            { author: { $regex: new RegExp(query, 'i') } } // Recherche dans l'auteur
        ]
    };
    
    // Compte le nombre total de résultats pour la pagination
    const totalArticles = await db.collection('articles').countDocuments(searchQuery);
    
    // Exécute la recherche avec pagination et tri par date de création (plus récents en premier)
    const articles = await db.collection('articles')
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    
    return {
        articles,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        searchQuery: query // Retourne la requête de recherche pour référence
    };
};

/**
 * Crée un nouvel article
 * @param {Object} articleData - Données de l'article
 * @returns {Promise<string>} ID de l'article créé
 */
const createArticle = async (articleData) => {
    const db = getDB();
    const completeArticle = {
        ...articleData,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await db.collection('articles').insertOne(completeArticle);
    return result.insertedId;
};

/**
 * Récupère tous les articles avec pagination
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'articles par page
 * @returns {Promise<Object>} Objet avec les articles et info de pagination
 */
const getAllArticles = async (page = 1, limit = 10) => {
    const db = getDB();
    const skip = (page - 1) * limit;
    const totalArticles = await db.collection('articles').countDocuments();
    
    const articles = await db.collection('articles')
        .find()
        .sort({ createdAt: -1 }) // Plus récents en premier
        .skip(skip)
        .limit(limit)
        .toArray();
    
    return {
        articles,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page
    };
};

/**
 * Récupère un article par ID
 * @param {string} articleId - ID de l'article
 * @returns {Promise<Object|null>} Article trouvé ou null
 */
const getArticleById = async (articleId) => {
    const db = getDB();
    return await db.collection('articles').findOne({ 
        _id: new ObjectId(articleId) 
    });
};

/**
 * Récupère des articles par titre (recherche insensible à la casse)
 * @param {string} title - Titre ou partie du titre
 * @returns {Promise<Array>} Liste des articles correspondants
 */
const getArticlesByTitle = async (title) => {
    const db = getDB();
    return await db.collection('articles')
        .find({ title: { $regex: new RegExp(title, 'i') } })
        .toArray();
};

/**
 * Récupère des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @returns {Promise<Array>} Liste des articles de l'auteur
 */
const getArticlesByAuthor = async (author) => {
    const db = getDB();
    return await db.collection('articles')
        .find({ author })
        .toArray();
};

/**
 * Met à jour un article par ID
 * @param {string} articleId - ID de l'article
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 */
const updateArticle = async (articleId, updateData) => {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db.collection('articles').updateOne(
        { _id: new ObjectId(articleId) },
        { $set: updateData }
    );
    return result.modifiedCount;
};

/**
 * Met à jour des articles par titre
 * @param {string} title - Titre ou partie du titre
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 */
const updateArticlesByTitle = async (title, updateData) => {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db.collection('articles')
        .updateMany(
            { title: { $regex: new RegExp(title, 'i') } },
            { $set: updateData }
        );
    return result.modifiedCount;
};

/**
 * Met à jour des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<number>} Nombre d'articles modifiés
 */
const updateArticlesByAuthor = async (author, updateData) => {
    const db = getDB();
    updateData.updatedAt = new Date();
    const result = await db.collection('articles')
        .updateMany(
            { author },
            { $set: updateData }
        );
    return result.modifiedCount;
};

/**
 * Supprime un article par ID
 * @param {string} articleId - ID de l'article
 * @returns {Promise<number>} Nombre d'articles supprimés
 */
const deleteArticle = async (articleId) => {
    const db = getDB();
    const result = await db.collection('articles')
        .deleteOne({ _id: new ObjectId(articleId) });
    return result.deletedCount;
};

/**
 * Supprime des articles par titre
 * @param {string} title - Titre ou partie du titre
 * @returns {Promise<number>} Nombre d'articles supprimés
 */
const deleteArticlesByTitle = async (title) => {
    const db = getDB();
    const result = await db.collection('articles')
        .deleteMany({ title: { $regex: new RegExp(title, 'i') } });
    return result.deletedCount;
};

/**
 * Supprime des articles par auteur
 * @param {string} author - Nom de l'auteur
 * @returns {Promise<number>} Nombre d'articles supprimés
 */
const deleteArticlesByAuthor = async (author) => {
    const db = getDB();
    const result = await db.collection('articles')
        .deleteMany({ author });
    return result.deletedCount;
};

module.exports = {
    createArticle,
    getAllArticles,
    getArticleById,
    getArticlesByTitle,
    getArticlesByAuthor,
    updateArticle,
    updateArticlesByTitle,
    updateArticlesByAuthor,
    deleteArticle,
    deleteArticlesByTitle,
    deleteArticlesByAuthor,
    searchArticles
};