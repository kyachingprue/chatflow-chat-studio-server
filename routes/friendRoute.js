// routes/friendRoute.js
import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { getUsersNotFriends } from '../controllers/friendController.js';

const router = express.Router();

router.get('/not-friends', isAuthenticated, getUsersNotFriends);

export default router;
