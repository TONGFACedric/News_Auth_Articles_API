// Contrôleurs pour la gestion des articles

const articleService = require('../services/article.services');
const { ObjectId } = require('mongodb'); // Importe ObjectId de MongoDB
const fs = require('fs'); // Module de gestion des fichiers


// Création d'un nouvel article
// Création d'un nouvel article
const createArticle = async (req, res) => {
    try {
        // Ajoute l'URL de l'image au corps de la requête
        if (req.file && req.file.filename) {
            req.body.imageUrl = 'http://192.168.1.194:3000' + '/api/v1/uploads/' + req.file.filename;
        }

        const requiredFields = ['title', 'author', 'journalName', 'category', 'description'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Champs manquants', 
                missingFields 
            });
        }

        const articleId = await articleService.createArticleService(req.body);
        
        // Récupère l'article créé pour l'envoyer dans la notification
        const newArticle = await articleService.getArticleByIdService(articleId);
        
        // Envoie une notification WebSocket à tous les clients connectés
        if (req.app.locals.wsBroadcast) {
    req.app.locals.wsBroadcast({
        type: 'article.created',
        message: 'Nouvel article créé',
        article: newArticle,
        at: new Date().toISOString()
    });
}
        
        return res.status(201).json({
            message: '✅ Article créé avec succès',
            articleId
        });
        
    } catch (err) {
        console.error('Error creating article:', err);
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// get image controller
const getImage = (req, res) => {
    const imagePath = "./uploads/" + req.params.filename;
    const imageStream = fs.createReadStream(imagePath);
    imageStream.pipe(res);
};

// Récupère tous les articles (paginés)
const getAllArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        
        const result = await articleService.getArticlesService(page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Récupère un article par ID
const getArticleById = async (req, res) => {
    try {
        const article = await articleService.getArticleByIdService(new ObjectId(req.params.articleId));
        
        if (!article) {
            return res.status(404).json({ message: '❌ Article introuvable' });
        }
        res.json(article);
    } catch (err) {
        if (err.message.includes('BSONError')) {
            return res.status(400).json({ message: '❌ Format ID invalide' });
        }
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Récupère des articles par titre
const getArticlesByTitle = async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const articles = await articleService.getArticlesByTitleService(title);
        
        if (!articles || articles.length === 0) {
            return res.status(404).json({ 
                message: `Aucun article trouvé avec le titre: ${title}` 
            });
        }
        
        res.json(articles);
    } catch (err) {
        res.status(500).json({ 
            message: 'Erreur serveur',
            error: err.message 
        });
    }
};

// Récupère des articles par auteur
const getArticlesByAuthor = async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author);
        const articles = await articleService.getArticlesByAuthorService(author);
        
        if (!articles || articles.length === 0) {
            return res.status(404).json({ 
                message: `❌ Aucun article trouvé pour l'auteur: ${author}` 
            });
        }
        
        res.json(articles);
    } catch (err) {
        res.status(500).json({ 
            message: '❌ Erreur serveur',
            error: err.message 
        });
    }
};

// Met à jour un article par ID (admin)
const updateArticle = async (req, res) => {
    try {
        const modifiedCount = await articleService.updateArticleService(
            req.params.articleId, 
            req.body
        );
        
        if (modifiedCount === 0) {
            return res.status(404).json({ message: '❌ Article introuvable ou aucune modification' });
        }
        
        // Récupère l'article mis à jour pour l'envoyer dans la notification
        const updatedArticle = await articleService.getArticleByIdService(req.params.articleId);
        
        // Envoie une notification WebSocket à tous les clients connectés
        if (req.app.locals.wsBroadcast) {
    req.app.locals.wsBroadcast({
        type: 'article.updated',
        message: 'Article mis à jour',
        article: updatedArticle,
        at: new Date().toISOString()
    });
}
        
        res.json({ message: '✅ Article modifié' });
       
    } catch (err) {
        res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
    }
};

// Met à jour des articles par titre (admin)
const updateArticlesByTitle = async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const modifiedCount = await articleService.updateArticlesByTitleService(title, req.body);
        
        if (modifiedCount === 0) {
            return res.status(404).json({ 
                message: `Aucun article trouvé avec le titre: ${title} ou aucune modification nécessaire` 
            });
        }
        
        // Envoie une notification WebSocket pour les mises à jour multiples
        if (req.app.locals.wsBroadcast) {
            req.app.locals.wsBroadcast({
                type: 'articles.updated',
                message: `${modifiedCount} article(s) mis à jour avec le titre "${title}"`,
                count: modifiedCount,
                criteria: { title },
                at: new Date().toISOString()
            });
        }
        
        res.json({ 
            message: `${modifiedCount} article(s) avec le titre "${title}" mis à jour`,
            count: modifiedCount 
        });
       
    } catch (err) {
        res.status(500).json({ 
            message: 'Erreur serveur',
            error: err.message 
        });
    }
};

// Met à jour des articles par auteur (admin)
const updateArticlesByAuthor = async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author);
        const modifiedCount = await articleService.updateArticlesByAuthorService(
            author, 
            req.body
        );
        
        if (modifiedCount === 0) {
            return res.status(404).json({ 
                message: `❌ Aucun article trouvé pour l'auteur: ${author} ou aucune modification nécessaire` 
            });
        }
        
        // Envoie une notification WebSocket pour les mises à jour multiples
        if (req.app.locals.wsBroadcast) {
            req.app.locals.wsBroadcast({
                type: 'articles.updated',
                message: `${modifiedCount} article(s) de ${author} mis à jour`,
                count: modifiedCount,
                criteria: { author },
                at: new Date().toISOString()
            });
        }
        
        res.json({ 
            message: `✅ ${modifiedCount} article(s) de ${author} mis à jour`,
            count: modifiedCount 
        });
         
    } catch (err) {
        res.status(500).json({ 
            message: '❌ Erreur serveur',
            error: err.message 
        });
    }
};

// Supprime un article par ID (admin)
const deleteArticle = async (req, res) => {
    try {
        const deletedCount = await articleService.deleteArticleService(req.params.articleId);
        
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Article introuvable' });
        }
        
        // Envoie une notification WebSocket pour la suppression
        if (req.app.locals.wsBroadcast) {
            req.app.locals.wsBroadcast({
                type: 'article.deleted',
                message: 'Article supprimé avec succès',
                articleId: req.params.articleId,
                at: new Date().toISOString()
            });
        }
        
        res.json({ 
            message: 'Article supprimé avec succès',
            deletedCount 
        });
    } catch (err) {
        res.status(400).json({ 
            message: 'Erreur lors de la suppression',
            error: err.message 
        });
    }
};

// Supprime des articles par titre (admin)
const deleteArticlesByTitle = async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const deletedCount = await articleService.deleteArticlesByTitleService(title);
        
        if (deletedCount === 0) {
            return res.status(404).json({ 
                message: `Aucun article trouvé avec le titre: ${title}` 
            });
        }
        
        // Envoie une notification WebSocket pour les suppressions multiples
        if (req.app.locals.wsBroadcast) {
            req.app.locals.wsBroadcast({
                type: 'articles.deleted',
                message: `${deletedCount} article(s) supprimé(s) avec le titre "${title}"`,
                count: deletedCount,
                criteria: { title },
                at: new Date().toISOString()
            });
        }
        
        res.json({ 
            message: `${deletedCount} article(s) supprimé(s) avec le titre "${title}"`,
            deletedCount 
        });
    } catch (err) {
        res.status(400).json({ 
            message: 'Erreur lors de la suppression',
            error: err.message 
        });
    }
};

// Supprime des articles par auteur (admin)
const deleteArticlesByAuthor = async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author);
        const deletedCount = await articleService.deleteArticlesByAuthorService(author);
        
        if (deletedCount === 0) {
            return res.status(404).json({ 
                message: `Aucun article trouvé pour l'auteur: ${author}` 
            });
        }
        
        // Envoie une notification WebSocket pour les suppressions multiples
        if (req.app.locals.wsBroadcast) {
            req.app.locals.wsBroadcast({
                type: 'articles.deleted',
                message: `${deletedCount} article(s) supprimé(s) pour l'auteur "${author}"`,
                count: deletedCount,
                criteria: { author },
                at: new Date().toISOString()
            });
        }
        
        res.json({ 
            message: `${deletedCount} article(s) supprimé(s) pour l'auteur "${author}"`,
            deletedCount 
        });
    } catch (err) {
        res.status(400).json({ 
            message: 'Erreur lors de la suppression',
            error: err.message 
        });
    }
};

/**
 * Recherche des articles par mots-clés
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Promise<void>}
 */
const searchArticles = async (req, res) => {
    try {
        // Récupération des paramètres de la requête
        const query = req.query.q; // Terme de recherche
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Validation du terme de recherche
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                message: 'La requête de recherche doit contenir au moins 2 caractères'
            });
        }
        
        // Appel du service de recherche
        const searchResults = await articleService.searchArticlesService(query, page, limit);
        
        // Vérification si des résultats ont été trouvés
        if (searchResults.totalArticles === 0) {
            return res.status(404).json({ 
                message: `❌ Aucun article trouvé pour la recherche: "${query}"`,
                searchQuery: query,
                suggestions: [
                    'Vérifiez l\'orthographe des mots',
                    'Essayez des termes plus généraux',
                    'Utilisez moins de mots-clés'
                ]
            });
        }
        
        // Réponse avec les résultats de la recherche
        res.json({
            message: `✅ ${searchResults.totalArticles} article(s) trouvé(s) pour "${query}"`,
            ...searchResults,
            currentPage: page,
            itemsPerPage: limit
        });
        
    } catch (err) {
        // Gestion des erreurs spécifiques
        if (err.message.includes('requête de recherche')) {
            return res.status(400).json({ 
                message: err.message 
            });
        }
        
        // Erreur serveur générique
        console.error('❌ Erreur lors de la recherche:', err);
        res.status(500).json({ 
            message: '❌ Erreur serveur lors de la recherche',
            error: err.message 
        });
    }
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
    getImage,
    searchArticles
};