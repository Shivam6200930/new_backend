import express from 'express';
const router = express.Router();
import Usercontroller from '../controllers/Usercontroller.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import imageupload from '../controllers/imageupload.js'
import {payment_generated,payment,verify} from '../payment/Razorpay.js'
import passport from 'passport';

//procted router 
router.use('/changepassword',checkUserAuth)
router.use('/loggedUser',checkUserAuth)
router.use('/edit',checkUserAuth)
router.use('/delete/:id',checkUserAuth)

router.use('/razorpay/order',checkUserAuth)
router.use('/razorpay/capture/:paymentId',checkUserAuth)
router.use('/order_history/:userId',checkUserAuth)
router.use('razorpay/verify-signature',checkUserAuth)
router.use('/contact',checkUserAuth)
router.get('/', (req, res) => {
    res.send("Hello World");
});
router.post('/register',Usercontroller.UserRegistration)
router.post('/login',Usercontroller.UserLogin)
router.post('/sendresetPassword',Usercontroller.resetPassword)
router.post('/resetPassword/:id/:token',Usercontroller.userPasswordReset)
router.delete('/delete/:id',Usercontroller.userDelete)
router.get('/logout',Usercontroller.UserLogout)
router.put('/edit/:user_id',Usercontroller.UserEdit)
router.post('/product',Usercontroller.product)
router.get('/search',Usercontroller.search)
router.get('/products',Usercontroller.products)
router.post('/contact',Usercontroller.contact)
router.post('/imageupload/:id',imageupload)
router.post('/razorpay/order',payment_generated)
router.post('/razorpay/capture/:paymentId',payment)
router.post('/order_history/:userId',Usercontroller.order_history)
router.post('razorpay/verify-signature',verify)
// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     res.redirect('/');
//   });

// router.get('/github',
//   passport.authenticate('github'));

// router.get('/github/callback',
//   passport.authenticate('github', { failureRedirect: '/login' }),
//   (req, res) => {
//     res.redirect('/');
//   });


//proctece
router.post('/changepassword',Usercontroller.changeUserpassword)
router.get('/loggedUser',Usercontroller.loggedUser)

export default router;