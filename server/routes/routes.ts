import express from 'express';
import passport from 'passport';
import { createJWT } from '../utils/jwt';

import dotenv from 'dotenv';
dotenv.config();

// Create a new router instance..
const router = express.Router();

// Import auth middleware to protect routes..
import auth from '../utils/auth';

// Import userImgMiddleware for handling image uploads..
import uploadImg from '../utils/userImgMiddleware';

// Import controller functions that handle the logic..
import { signup, login, updateProfile, deleteUser, getUserById, getAllUsers } from '../controllers/userController';
import adminAuth from '../middleware/adminAuth';
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


// Admin Route: Get All Users
router.get( '/users', auth, adminAuth, getAllUsers );


// Import checkout controller functions..
import { userCheckout, guestCheckout } from '../controllers/checkoutController';

// Import post controller functions
import { getAllPosts, createPost, updatePost, deletePost } from '../controllers/postController';


// Route to create a new user "Sign Up"..
router.post( '/users/signup', uploadImg.single( 'photo' ), signup );

// Route to log in an existing user..
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

// Route to update a user's profile "requires user ID and updated data"
router.put( '/users/update', uploadImg.single( 'photo' ), updateProfile );
router.delete( '/users/:userId', auth, deleteUser );


// Route to get a user by their ID..
router.get( '/users/:userId', getUserById );

// Route to get all shows available to display to user..
router.get( '/shows', getAllShows );

// Route to get all shows available to display to user..
router.get( '/shows/:state', getShowsByLocation );

// --- Admin Show Routes ---
router.post( '/shows', auth, adminAuth, createShow );
router.put( '/shows/:id', auth, adminAuth, updateShow );
router.delete( '/shows/:id', auth, adminAuth, deleteShow );


/* Route: GET /api/products -> Fetches all products in the
  database. Controller retrieves all products from database to
  display to user at the Shop Page */
router.get( '/products', getAllProducts );

/* Route: GET /api/products/featured -> Fetches a limited set of
 "featured" i.e "top 3". Controller retrieves relevant products from
 database to display at the featured section of the Home Page */
router.get( '/products/featured', getFeaturedProducts );

/* Route: GET /api/products/:id -> Fetches a specific product by
  its ID. Controller gets Product details from database to send to
  frontend for the checkout cart in this application */
/* Route: GET /api/products/:id -> Fetches a specific product by
  its ID. Controller gets Product details from database to send to
  frontend for the checkout cart in this application */
router.get( '/products/:id', getProductById );

// --- Admin Product Routes ---
router.post( '/products', auth, adminAuth, createProduct );
router.put( '/products/:id', auth, adminAuth, updateProduct );
router.delete( '/products/:id', auth, adminAuth, deleteProduct );


/* Route: POST /api/checkout/user -> Handles checkout for signed-in
  users. Controller adds products to the user's purchase history */
router.post( '/checkout/user', auth, userCheckout );

/* Route: POST /api/checkout/guest -> Handles checkout for guest users not
  signed in. Controller creates a new guest checkout record */
router.post( '/checkout/guest', guestCheckout );

// --- Chatroom Routes --- //

// Route to get all posts..
router.get( '/posts', getAllPosts );

// Route to create a new post..
// Protected: Only logged-in users can post
router.post( '/posts', auth, createPost );

// Route to update a post..
// Protected: Only the author can update their post
router.put( '/posts/:id', auth, updatePost );

// Route to delete a post..
// Protected: Only the author can delete their post
router.delete( '/posts/:id', auth, deletePost );

// --- Lesson Routes --- //

// Route to get all lessons (supports filtering by ?instrument=guitar&difficulty=beginner)
router.get( '/lessons', getAllLessons );

// Route to get a specific lesson
router.get( '/lessons/:id', getLessonById );

// Route to mark a lesson as complete (Protected)
// Route to mark a lesson as complete (Protected)
router.post( '/users/lessons/:id', auth, markLessonComplete );

// --- Admin Lesson Routes ---
router.post( '/lessons', auth, adminAuth, createLesson );
router.put( '/lessons/:id', auth, adminAuth, updateLesson );
router.delete( '/lessons/:id', auth, adminAuth, deleteLesson );


// Export the routes to be used in server.js
export default router;
