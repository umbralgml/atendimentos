import { Router } from 'express';
import { getTenant, updateTenant, getDashboard } from './tenant.controller';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/', getTenant);
router.put('/', updateTenant);
router.get('/dashboard', getDashboard);

export default router;
