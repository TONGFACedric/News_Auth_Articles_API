/**
 * Routes pour la gestion des articles
 * Définit les endpoints pour les opérations CRUD sur les articles
 */

// ✅ CORRECTION: Utilisez express.Router() au lieu de require('router')
const express = require('express');
const router = express.Router();
const upload = require('../configs/multer.config');
const articleController = require('../controllers/article.controller');
const { authenticate, isAdmin, isAuthorOrAdmin } = require('./auth.routes');

// Routes publiques (lecture seule - accessibles à tous les utilisateurs)

/**
 * @swagger
 * /api/v1/articles/search:
 *   get:
 *     tags: [Articles]
 *     summary: Recherche des articles par mots-clés
 *     description: |
 *       Recherche des articles contenant les mots-clés spécifiés dans le titre,
 *       la description, les catégories, le nom du journal ou l'auteur.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Terme(s) de recherche
 *         schema:
 *           type: string
 *           example: "technologie"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'articles par page
 *     responses:
 *       200:
 *         description: Recherche réussie avec résultats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 totalArticles:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 itemsPerPage:
 *                   type: integer
 *                 searchQuery:
 *                   type: string
 *       400:
 *         description: Requête de recherche invalide
 *       404:
 *         description: Aucun article trouvé pour la recherche
 *       500:
 *         description: Erreur serveur lors de la recherche
 */
router.get('/search', articleController.searchArticles);

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     tags: [Articles]
 *     summary: Liste tous les articles (paginés)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des articles
 */
router.get('/', articleController.getAllArticles);

/**
 * @swagger
 * /api/v1/articles/id/{articleId}:
 *   get:
 *     tags: [Articles]
 *     summary: Récupère un article par ID
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article trouvé
 */
router.get('/id/:articleId', articleController.getArticleById);

/**
 * @swagger
 * /api/v1/articles/title/{title}:
 *   get:
 *     tags: [Articles]
 *     summary: Récupère des articles par titre
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles trouvés
 */
router.get('/title/:title', articleController.getArticlesByTitle);

/**
 * @swagger
 * /api/v1/articles/author/{author}:
 *   get:
 *     tags: [Articles]
 *     summary: Récupère des articles par auteur
 *     parameters:
 *       - in: path
 *         name: author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles trouvés
 */
router.get('/author/:author', articleController.getArticlesByAuthor);

// Routes protégées (nécessitent un token admin valide)
// Le middleware authenticate et isAdmin s'appliquera à toutes les routes suivantes
router.use(authenticate, isAdmin);

/**
 * @swagger
 * /api/v1/articles:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Crée un nouvel article (admin seulement)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       201:
 *         description: Article créé
 */
router.post('/', upload.single('image'), articleController.createArticle);

// Route pour accéder aux images uploadées
router.get('/uploads/:filename', articleController.getImage);

/**
 * @swagger
 * /api/v1/articles/id/{articleId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Modifie un article par ID (admin seulement)
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Article mis à jour
 */
router.put('/id/:articleId', isAuthorOrAdmin, articleController.updateArticle);

/**
 * @swagger
 * /api/v1/articles/title/{title}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Modifie des articles par titre (admin seulement)
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Articles mis à jour
 */
router.put('/title/:title', isAuthorOrAdmin, articleController.updateArticlesByTitle);

/**
 * @swagger
 * /api/v1/articles/author/{author}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Modifie des articles par auteur (admin seulement)
 *     parameters:
 *       - in: path
 *         name: author
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Articles mis à jour
 */
router.put('/author/:author', isAuthorOrAdmin, articleController.updateArticlesByAuthor);

/**
 * @swagger
 * /api/v1/articles/id/{articleId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Supprime un article par ID (admin seulement)
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article supprimé
 */
router.delete('/id/:articleId', isAuthorOrAdmin, articleController.deleteArticle);

/**
 * @swagger
 * /api/v1/articles/title/{title}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Supprime des articles par titre (admin seulement)
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles supprimés
 */
router.delete('/title/:title', isAuthorOrAdmin, articleController.deleteArticlesByTitle);

/**
 * @swagger
 * /api/v1/articles/author/{author}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Articles]
 *     summary: Supprime des articles por auteur (admin seulement)
 *     parameters:
 *       - in: path
 *         name: author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles supprimés
 */
router.delete('/author/:author', articleController.deleteArticlesByAuthor);

// Export du routeur
module.exports = router;