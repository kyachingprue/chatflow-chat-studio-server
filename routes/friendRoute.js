// routes/friendRoute.js
import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { getReceivedFriendRequests, getUsersNotFriends } from '../controllers/friendController.js';
import { addFriend } from '../controllers/friendController.js';
import { removeFriend } from '../controllers/friendController.js';

const router = express.Router();

router.get('/not-friends', isAuthenticated, getUsersNotFriends);
router.post('/add/:id', isAuthenticated, addFriend);
router.delete('/remove/:id', isAuthenticated, removeFriend);
router.get('/received', isAuthenticated, getReceivedFriendRequests);

export default router;
