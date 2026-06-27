import { Router } from 'express';
import { adminOnly } from '../middleware/admin.middleware';
import {
  getStats,
  listUsers,
  updateUser,
  deleteUser,
  listRestaurantsAdmin,
  createRestaurant,
  updateRestaurant,
  approveRestaurant,
  deleteRestaurant,
  getRestaurantDetail,
  listMenuSections,
  createMenuSection,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateRestaurantHours,
  listOrdersAdmin,
  listAllRatings,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require ADMIN role
router.use(adminOnly);

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Restaurants
router.get('/restaurants', listRestaurantsAdmin);
router.post('/restaurants', createRestaurant);
router.patch('/restaurants/:id', updateRestaurant);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);
router.get('/restaurants/:id', getRestaurantDetail);

// Menu Sections
router.get('/restaurants/:id/sections', listMenuSections);
router.post('/restaurants/:id/sections', createMenuSection);

// Menu Items
router.post('/restaurants/:restaurantId/items', createMenuItem);
router.patch('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

// Restaurant Hours
router.put('/restaurants/:id/hours', updateRestaurantHours);

// Orders
router.get('/orders', listOrdersAdmin);

// Ratings
router.get('/ratings', listAllRatings);

export default router;
