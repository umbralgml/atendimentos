import { Router } from 'express';
import { listByDate, listByWeek, create, update, cancel, getAvailableSlots } from './appointment.controller';
import { validate } from '../../middleware/validate';
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.schema';
import { authenticate } from '../../middleware/auth';
import { tenantGuard } from '../../middleware/tenantGuard';

const router = Router();
router.use(authenticate, tenantGuard);

router.get('/day', listByDate);
router.get('/week', listByWeek);
router.get('/slots', getAvailableSlots);
router.post('/', validate(createAppointmentSchema), create);
router.put('/:id', validate(updateAppointmentSchema), update);
router.patch('/:id/cancel', cancel);

export default router;
