import express from 'express';
import passport from 'passport';
import { createJWT } from '../utils/jwt';

import dotenv from 'dotenv';
dotenv.config();

/**
 * =========================================
 * Centralized API Router
 * =========================================
 * Architectural Pattern: Express Router / Endpoint Registry
 * Purpose: Aggregates all incoming HTTP traffic directed at `/api/*` and explicitly
 * maps URLs to their respective specialized controller logic functions.
 */
const router = express.Router();

// --- Security & Utility Middleware ---
import auth from '../utils/auth'; // JWT Validation Pipeline.
import adminAuth from '../middleware/adminAuth'; // Role-Based Access Control (RBAC) Guard.
import uploadImg from '../utils/userImgMiddleware'; // Multipart Form/Image Parsing (Multer).

// --- Controller Logic Injections ---
import { signup, login, updateProfile, deleteUser, getUserById, getAllUsers } from '../controllers/userController';
import
{
  getAllProducts, getFeaturedProducts, getProductById,
  createProduct, updateProduct, deleteProduct
} from '../controllers/productController';
import
{
  getAllShows, getShowsByLocation,
  createShow, updateShow, deleteShow
} from '../controllers/showControllers';
import
{
  getAllLessons, getLessonById, markLessonComplete,
  createLesson, updateLesson, deleteLesson
} from '../controllers/lessonController';


// ==========================================
// AUTHENTICATION & USER MANAGEMENT ROUTES
// ==========================================

/**
 * SECURE: Retrieves a complete list of registered platform users.
 * Requires both a valid user JWT and an active Administrator boolean flag.
 */
router.get( '/users', auth, adminAuth, getAllUsers );


// Import checkout controller functions..
import { userCheckout, guestCheckout } from '../controllers/checkoutController';

// Import post controller functions
import { getAllPosts, createPost, updatePost, deletePost } from '../controllers/postController';


/**
 * PUBLIC: Signs up a brand new user locally and provisions a JWT.
 * Parses multipart form data natively to extract local profile avatars.
 */
router.post( '/users/signup', uploadImg.single( 'photo' ), signup );

/**
 * PUBLIC: Authenticates an existing local user via Passport.
 * Returns the securely signed JWT session string and masked user object.
 */
router.post( '/users/login', ( req, res, next ) =>
{
  passport.authenticate( 'local', { session: false }, ( err: any, user: any, info: any ) =>
  {
    if ( err ) return next( err );
    if ( !user ) return res.status( 400 ).json( { message: info?.message || 'Login failed' } );

    const token = createJWT( user );
    return res.json( { user, token } );
  } )( req, res, next );
} );

// -- Google Auth Routes --
router.get( '/auth/google', passport.authenticate( 'google', { scope: [ 'profile', 'email' ] } ) );
router.get( '/auth/google/callback', passport.authenticate( 'google', { session: false } ), ( req: any, res: any ) =>
{
  const token = createJWT( req.user );
  // Redirect to frontend with token
  res.redirect( `${ process.env.ORIGIN }/auth/success?token=${ token }` );
} );

// -- Apple Auth Routes --
router.get( '/auth/apple', passport.authenticate( 'apple' ) );
router.post( '/auth/apple/callback', passport.authenticate( 'apple', { session: false } ), ( req: any, res: any ) =>
{
  const token = createJWT( req.user );
  res.redirect( `${ process.env.ORIGIN }/auth/success?token=${ token }` );
} );

/**
 * SECURE: Patches an existing user's profile metadata.
 * Includes Multer injection for image blob replacements.
 */
router.put( '/users/update', uploadImg.single( 'photo' ), updateProfile );

/**
 * SECURE: Permanently drops a user ID based on matching credentials.
 */
router.delete( '/users/:userId', auth, deleteUser );


// Route to get a user by their ID..
router.get( '/users/:userId', getUserById );

// ==========================================
// CONCERT & VENUE AGGREGATION ROUTES
// ==========================================

/**
 * PUBLIC: Full spectrum pull of all active venue shows directly out of the database array.
 */
router.get( '/shows', getAllShows );

/**
 * PUBLIC: Filtered Pull based on explicit State strings (e.g., 'NY', 'CA').
 */
router.get( '/shows/:state', getShowsByLocation );

/**
 * SECURE ADMIN PORTAL: CRUD operations explicitly restricted behind JWT and RBAC barriers.
 * Governs the actual creation and cancellation of tour dates dynamically.
 */
router.post( '/shows', auth, adminAuth, createShow );
router.put( '/shows/:id', auth, adminAuth, updateShow );
router.delete( '/shows/:id', auth, adminAuth, deleteShow );


// ==========================================
// STOREFRONT & E-COMMERCE CHECKOUT ROUTES
// ==========================================

/**
 * PUBLIC: Retrieves the entire catalog of purchasable active database products.
 */
router.get( '/products', getAllProducts );

/**
 * PUBLIC: Fetches a hard-limited top 6 subset of products for the homepage UI carousel.
 */
router.get( '/products/featured', getFeaturedProducts );

/**
 * PUBLIC: Yields the explicit metadata of a single product ID for checkout cart referencing.
 */
router.get( '/products/:id', getProductById );

// --- Administrator Protected Store CRUD ---
router.post( '/products', auth, adminAuth, createProduct );
router.put( '/products/:id', auth, adminAuth, updateProduct );
router.delete( '/products/:id', auth, adminAuth, deleteProduct );

/**
 * SECURE: Commits a parsed purchase history directly into the verified user's database footprint.
 */
router.post( '/checkout/user', auth, userCheckout );

/**
 * PUBLIC: Orchestrates a localized purchase session for an anonymous un-authenticated guest string.
 */
router.post( '/checkout/guest', guestCheckout );

// ==========================================
// COMMUNITY FORUM (CHAT) ROUTES
// ==========================================

/**
 * PUBLIC: Pulls the aggregate list of community chat broadcasts.
 */
router.get( '/posts', getAllPosts );

/**
 * SECURE: Allows any verified user holding a valid JWT to broadcast into the public feed.
 */
router.post( '/posts', auth, createPost );

/**
 * SECURE (Author Gating): Express matches the JWT signature explicitly against the Post author ID internally.
 */
router.put( '/posts/:id', auth, updatePost );
router.delete( '/posts/:id', auth, deletePost );

// ==========================================
// EDUCATIONAL HUD (LESSONS) ROUTES
// ==========================================

/**
 * PUBLIC: Query parameter supported retrieval filtering (e.g., `?instrument=guitar&difficulty=beginner`).
 */
router.get( '/lessons', getAllLessons );

/**
 * PUBLIC: Single detail fetch mechanism.
 */
router.get( '/lessons/:id', getLessonById );

/**
 * SECURE: Patches the authenticated User's document array with the successfully completed lesson ID.
 */
router.post( '/users/lessons/:id', auth, markLessonComplete );

/**
 * SECURE ADMIN PORTAL: Curriculum Management. 
 * Allows administration to dynamically upload or modify lesson structures blocking standard users.
 */
router.post( '/lessons', auth, adminAuth, createLesson );
router.put( '/lessons/:id', auth, adminAuth, updateLesson );
router.delete( '/lessons/:id', auth, adminAuth, deleteLesson );


// Export the routes to be used in server.js
export default router;
