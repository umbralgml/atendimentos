import { Router } from 'express';
import { list, getById, create, update, remove } from './professional.controller';
import { validate } from '../../middleware/validate';
import { createProfessionalSchema, updateProfessionalSchema } from './professional.schema';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/', list);
router.get('/:id', getById);
router.post('/', validate(createProfessionalSchema), create);
router.put('/:id', validate(updateProfessionalSchema), update);
router.delete('/:id', remove);

export default router;
