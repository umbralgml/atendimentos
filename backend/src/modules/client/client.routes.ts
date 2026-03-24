import { Router } from 'express';
import { list, getById, create, update, remove } from './client.controller';
import { validate } from '../../middleware/validate';
import { createClientSchema, updateClientSchema } from './client.schema';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/', list);
router.get('/:id', getById);
router.post('/', validate(createClientSchema), create);
router.put('/:id', validate(updateClientSchema), update);
router.delete('/:id', remove);

export default router;
