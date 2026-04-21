import { Router } from 'express';
import {
  adminGetProducts, adminGetProduct, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct, adminDeleteProductImage,
} from '../../controllers/admin/products';
import { upload } from '../../middleware/upload';

const router = Router();

router.get('/', adminGetProducts);
router.get('/:id', adminGetProduct);
router.post('/', upload.array('images', 5), adminCreateProduct);
router.put('/:id', upload.array('images', 5), adminUpdateProduct);
router.delete('/:id', adminDeleteProduct);
router.post('/:id/delete-image', adminDeleteProductImage);

export default router;
