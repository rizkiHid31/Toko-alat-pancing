import { Router } from 'express';
import { getProducts, getProductBySlug, getCategories, getFeaturedProducts, getRelatedProducts } from '../controllers/products';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

export default router;
