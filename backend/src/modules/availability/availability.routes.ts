import { Router } from 'express';
import { getByProfessional, setAvailability } from './availability.controller';
import { validate } from '../../middleware/validate';
import { setAvailabilitySchema } from './availability.schema';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/:professionalId', getByProfessional);
router.post('/', validate(setAvailabilitySchema), setAvailability);

export default router;
