import express from 'express';
const router = express.Router();
import Usercontroller from '../controllers/Usercontroller.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import imageupload from '../controllers/imageupload.js';
import { payment_generated, payment, verify , sendEmailPayment } from '../payment/Razorpay.js';
import {addItemToCart, updateCartItemQuantity, removeItemFromCart, getCart, deleteCartItems} from '../controllers/CartItems.js'

// Protected routes
router.use('/changepassword', checkUserAuth);
router.use('/loggedUser', checkUserAuth);
router.use('/edit', checkUserAuth)
// router.get('/products-all',checkUserAuth);
router.use('/razorpay/order', checkUserAuth);
router.use('/razorpay/capture/:paymentId', checkUserAuth);
router.use('/order_history/:userId', checkUserAuth);
router.use('/razorpay/verify-signature', checkUserAuth);
router.use('/contact', checkUserAuth);


router.get('/', (req, res) => {
    res.send("Hello World");
});

//basic and auth routers 
router.post('/register', Usercontroller.UserRegistration);
router.post('/login', Usercontroller.UserLogin);
router.post('/sendresetPassword', Usercontroller.resetPassword);
router.put('/resetPassword/:id/:token', Usercontroller.userPasswordReset);
router.delete('/delete/:id', Usercontroller.userDelete);
router.get('/logout/:id', Usercontroller.UserLogout);
router.post('/edit/:user_id', Usercontroller.UserEdit);
router.get('/search', Usercontroller.search);
router.post('/addProduct', Usercontroller.addProduct);

//payment and product related routers 
router.get('/products-all', Usercontroller.findAllProduct);
router.post('/contact', Usercontroller.contact);
router.post('/imageupload/:id', imageupload);
router.post('/razorpay/order', payment_generated);
router.post('/razorpay/capture/:paymentId', payment);
router.post('/order_history/:userId', Usercontroller.order_history);
router.post('/razorpay/verify-signature', verify);
router.delete('/profileImageDelete/:id', Usercontroller.userPhotoDelete);
router.post('/address/:id', Usercontroller.addresses);
router.get('/gPbyCatogeries/:category',Usercontroller.getProductCategories)
router.post('/products',Usercontroller.getProductsByIds)
router.get('/gPbyCatogeries-all/All',Usercontroller.getAllCategories)
router.get('/gP/bycategories/:category_get',Usercontroller.getCatProducts)
router.post('/product/update',Usercontroller.productUpdate)
router.get('/products/:productId',Usercontroller.productfetchDetails)
router.delete('/deleteProducts/:productId',Usercontroller.DeleteProduct)




//cart routers
router.get('/getCart/:userId', getCart);
router.post('/add/:userId', addItemToCart);
router.post('/update/:userId', updateCartItemQuantity);
router.post('/remove/:userId/:productId', removeItemFromCart);
router.post('/deletecart/:userId',deleteCartItems)
router.post('/payment_email/:email',sendEmailPayment)


//orderManagement router 
router.get("/allOrder", Usercontroller.fetchAllOrder);
router.post('/updated/:orderId/:userId',Usercontroller.updatedOrder)
router.post('/addOrder',Usercontroller.newOrder)

// Additional protected routes
router.post('/changepassword', Usercontroller.changeUserpassword);
router.get('/loggedUser', Usercontroller.loggedUser);

export default router;
