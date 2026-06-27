import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import addressRoutes from './routes/address.routes';
import placesRoutes from './routes/places.routes';
import restaurantRoutes from './routes/restaurant.routes';
import searchRoutes from './routes/search.routes';
import categoryRoutes from './routes/category.routes';
import uploadRoutes from './routes/upload.routes';
import menuItemRoutes from './routes/menuItem.routes';
import ratingRoutes from './routes/rating.routes';
import favoriteRoutes from './routes/favorite.routes';
import promoRoutes from './routes/promo.routes';
import momoRoutes from './routes/momo.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: ENV.NODE_ENV });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/places', placesRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/menu-items', menuItemRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/promo', promoRoutes);
app.use('/api/v1/momo', momoRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

export default app;
