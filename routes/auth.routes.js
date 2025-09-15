/**
 * Routes d'authentification et gestion des utilisateurs
 * Définit les endpoints pour l'inscription, connexion et gestion des utilisateurs
 */

// Importation du framework Express pour créer le routeur
const express = require('express');
// Création d'une instance de routeur Express
const router = express.Router();
// Importation du service d'authentification
const authService = require('../services/auth.services');
// Importation du modèle utilisateur
const userModel = require('../models/user.model');

/**
 * Middleware d'authentification
 * Vérifie la présence et validité du token JWT
 */
const authenticate = async (req, res, next) => {
    // Récupération du header d'autorisation
    const authHeader = req.headers.authorization;
    // Extraction du token du format: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    // Vérification de la présence du token
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        // Vérification et décodage du token
        req.user = await authService.verifyToken(token);
        // Passage au middleware suivant
        next();
    } catch (err) {
        // Gestion des erreurs de token invalide
        return res.status(401).json({ 
            message: 'Token invalide', 
            error: err.message 
        });
    }
};

/**
 * Middleware pour vérifier le rôle admin
 */
const isAdmin = (req, res, next) => {
    // Vérification si l'utilisateur a le rôle admin
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Accès refusé - Admin requis' 
        });
    }
    // Passage au middleware suivant
    next();
};

// Routes publiques (pas besoin d'authentification)

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, author, admin]
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentification]
 *     summary: Inscription d'un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Erreur lors de la création de l'utilisateur
 */
router.post('/register', async (req, res) => {
    try {
        // Appel du service d'inscription avec les données de la requête
        const userId = await authService.registerUser(req.body);
        // Réponse de succès
        res.status(201).json({ 
            message: 'Utilisateur créé', 
            userId 
        });
    } catch (err) {
        // Gestion des erreurs d'inscription
        res.status(400).json({ 
            message: 'Erreur d\'inscription', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentification]
 *     summary: Connexion d'un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Identifiants incorrects
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', async (req, res) => {
    try {
        // Extraction de l'email et du mot de passe de la requête
        const { email, password } = req.body;
        // Appel du service de connexion
        const result = await authService.loginUser(email, password);
        
        // Vérification du résultat de connexion
        if (!result) {
            return res.status(401).json({ 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Réponse avec le token et les informations utilisateur
        res.json(result);
    } catch (err) {
        // Gestion des erreurs de connexion
        res.status(500).json({ 
            message: 'Erreur de connexion', 
            error: err.message 
        });
    }
});

// Routes protégées (nécessitent un token valide)

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Liste tous les utilisateurs (admin seulement)
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès refusé - droits administrateur requis
 *       500:
 *         description: Erreur serveur
 */
router.get('/users', authenticate, isAdmin, async (req, res) => {
    try {
        // Récupération de tous les utilisateurs via le service
        const users = await authService.getAllUsers();
        // Réponse avec la liste des utilisateurs
        res.json(users);
    } catch (err) {
        // Gestion des erreurs serveur
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/id/{userId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Récupère un utilisateur par ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/users/id/:userId', authenticate, async (req, res) => {
    try {
        // Récupération de l'utilisateur par son ID via le service
        const user = await authService.getUserById(req.params.userId);
        // Vérification de l'existence de l'utilisateur
        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        // Réponse avec les informations de l'utilisateur
        res.json(user);
    } catch (err) {
        // Gestion des erreurs serveur
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/email/{email}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Récupère un utilisateur par email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email de l'utilisateur à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/users/email/:email', authenticate, async (req, res) => {
    try {
        // Récupération de l'utilisateur par son email via le modèle
        const user = await userModel.findUserByEmail(req.params.email);
        // Vérification de l'existence de l'utilisateur
        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Ne pas renvoyer le mot de passe dans la réponse
        const { password, ...userWithoutPassword } = user;
        // Réponse avec les informations de l'utilisateur (sans mot de passe)
        res.json(userWithoutPassword);
    } catch (err) {
        // Gestion des erreurs serveur
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/username/{username}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Récupère un utilisateur par username
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Nom d'utilisateur à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/users/username/:username', authenticate, async (req, res) => {
    try {
        // Récupération de l'utilisateur par son nom d'utilisateur via le modèle
        const user = await userModel.findUserByUsername(req.params.username);
        // Vérification de l'existence de l'utilisateur
        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Ne pas renvoyer le mot de passe dans la réponse
        const { password, ...userWithoutPassword } = user;
        // Réponse avec les informations de l'utilisateur (sans mot de passe)
        res.json(userWithoutPassword);
    } catch (err) {
        // Gestion des erreurs serveur
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/id/{userId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Met à jour un utilisateur par ID (admin seulement)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à modifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la mise à jour
 */
router.put('/users/id/:userId', authenticate, isAdmin, async (req, res) => {
    try {
        // Mise à jour de l'utilisateur par son ID via le service
        const modifiedCount = await authService.updateUser(
            req.params.userId, 
            req.body
        );
        
        // Vérification si l'utilisateur a été modifié
        if (modifiedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé ou non modifié' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur mis à jour', 
            modifiedCount 
        });
    } catch (err) {
        // Gestion des erreurs de mise à jour
        res.status(500).json({ 
            message: 'Erreur de mise à jour', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/email/{email}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Met à jour un utilisateur par email (admin seulement)
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email de l'utilisateur à modifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la mise à jour
 */
router.put('/users/email/:email', authenticate, isAdmin, async (req, res) => {
    try {
        // Mise à jour de l'utilisateur par son email via le modèle
        const modifiedCount = await userModel.updateUserByEmail(
            req.params.email, 
            req.body
        );
        
        // Vérification si l'utilisateur a été modifié
        if (modifiedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé ou non modifié' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur mis à jour', 
            modifiedCount 
        });
    } catch (err) {
        // Gestion des erreurs de mise à jour
        res.status(500).json({ 
            message: 'Erreur de mise à jour', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/username/{username}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Met à jour un utilisateur par username (admin seulement)
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Nom d'utilisateur à modifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 modifiedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la mise à jour
 */
router.put('/users/username/:username', authenticate, isAdmin, async (req, res) => {
    try {
        // Mise à jour de l'utilisateur par son nom d'utilisateur via le modèle
        const modifiedCount = await userModel.updateUserByUsername(
            req.params.username, 
            req.body
        );
        
        // Vérification si l'utilisateur a été modifié
        if (modifiedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé ou non modifié' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur mis à jour', 
            modifiedCount 
        });
    } catch (err) {
        // Gestion des erreurs de mise à jour
        res.status(500).json({ 
            message: 'Erreur de mise à jour', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/id/{userId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Supprime un utilisateur par ID (admin seulement)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression
 */
router.delete('/users/id/:userId', authenticate, isAdmin, async (req, res) => {
    try {
        // Suppression de l'utilisateur par son ID via le service
        const deletedCount = await authService.deleteUser(req.params.userId);
        
        // Vérification si l'utilisateur a été supprimé
        if (deletedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur supprimé', 
            deletedCount 
        });
    } catch (err) {
        // Gestion des erreurs de suppression
        res.status(500).json({ 
            message: 'Erreur de suppression', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/email/{email}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Supprime un utilisateur par email (admin seulement)
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email de l'utilisateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression
 */
router.delete('/users/email/:email', authenticate, isAdmin, async (req, res) => {
    try {
        // Suppression de l'utilisateur par son email via le modèle
        const deletedCount = await userModel.deleteUserByEmail(req.params.email);
        
        // Vérification si l'utilisateur a été supprimé
        if (deletedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur supprimé', 
            deletedCount 
        });
    } catch (err) {
        // Gestion des erreurs de suppression
        res.status(500).json({ 
            message: 'Erreur de suppression', 
            error: err.message 
        });
    }
});

/**
 * @swagger
 * /api/v1/auth/users/username/{username}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Utilisateurs]
 *     summary: Supprime un utilisateur par username (admin seulement)
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Nom d'utilisateur à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression
 */
router.delete('/users/username/:username', authenticate, isAdmin, async (req, res) => {
    try {
        // Suppression de l'utilisateur par son nom d'utilisateur via le modèle
        const deletedCount = await userModel.deleteUserByUsername(req.params.username);
        
        // Vérification si l'utilisateur a été supprimé
        if (deletedCount === 0) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Réponse de succès
        res.json({ 
            message: 'Utilisateur supprimé', 
            deletedCount 
        });
    } catch (err) {
        // Gestion des erreurs de suppression
        res.status(500).json({ 
            message: 'Erreur de suppression', 
            error: err.message 
        });
    }
});

// Importation du modèle d'article pour le middleware isAuthorOrAdmin
const articleModel = require('../models/article.model');

/**
 * Middleware pour vérifier le rôle auteur ou si l'utilisateur est l'auteur de l'article
 */
const isAuthorOrAdmin = async (req, res, next) => {
    // Récupération de l'utilisateur à partir de la requête
    const user = req.user;

    // Vérification de la présence de l'utilisateur
    if (!user) {
        return res.status(403).json({ message: 'Accès refusé - Utilisateur non connecté' });
    }

    // Vérification si l'utilisateur est admin
    if (user.role === 'admin') {
        // Admins peuvent toujours passer
        return next();
    }

    // Vérification si l'utilisateur est auteur
    if (user.role === 'author') {
        const articleId = req.params.articleId;
        // Vérification si un articleId est fourni
        if (articleId) {
            // Récupération de l'article par son ID
            const article = await articleModel.getArticleById(articleId);
            // Vérification de l'existence de l'article
            if (!article) {
                return res.status(404).json({ message: 'Article non trouvé' });
            }
            // Vérification si l'auteur de l'article correspond à l'utilisateur
            if (article.author !== user.username) {
                return res.status(403).json({
                    message: 'Accès refusé - Vous n\'êtes pas l\'auteur de cet article'
                });
            }
        }
        // Si pas d'articleId ou que l'auteur correspond, on continue
        return next();
    }

    // Si pas admin ni author
    return res.status(403).json({
        message: 'Accès refusé - Rôle author ou admin requis'
    });
};

// Exportation du routeur et des middlewares
module.exports = {
    authRoutes: router,
    authenticate,
    isAdmin,
    isAuthorOrAdmin
};