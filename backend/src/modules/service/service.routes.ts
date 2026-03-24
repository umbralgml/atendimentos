import { Router } from 'express';
import { list, getById, create, update, remove } from './service.controller';
import { validate } from '../../middleware/validate';
import { createServiceSchema, updateServiceSchema } from './service.schema';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/', list);
router.get('/:id', getById);
router.post('/', validate(createServiceSchema), create);
router.put('/:id', validate(updateServiceSchema), update);
router.delete('/:id', remove);

export default router;
