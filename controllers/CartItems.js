import { user, Product } from "../models/user.js"; // Assuming you have a User model

// Get cart for the user
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const User = await user.findById(userId).populate('cart.items.productId');
    res.status(200).json({ cart: User.cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch cart', error });
  }
};

// Add item to the cart
export const addItemToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Find the user by ID
    const User = await user.findById(userId);

    // Ensure the user exists
    if (!User) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize cart if it doesn't exist
    if (!User.cart) {
      User.cart = { items: [] };
    }

    // Initialize cart items if it doesn't exist
    if (!User.cart.items) {
      User.cart.items = [];
    }

    // Check if the productId is provided
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Find if the product is already in the cart
    const existingCartItem = User.cart.items.find(item => item.productId.toString() === productId);
    
    if (existingCartItem) {
      // Update the quantity if the item already exists in the cart
      existingCartItem.quantity += quantity;
    } else {
      // Add the new item to the cart
      User.cart.items.push({ productId, quantity });  // Ensure productId is passed here
    }

    // Save the updated user document
    await User.save();

    // Respond with the updated cart items
    res.status(200).json({ message: 'Item added to cart', cart: User.cart.items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to add item to cart', error });
  }
};

// Update item quantity in the cart
export const updateCartItemQuantity = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Fetch the user based on userId
    const User = await user.findById(userId);
    if (!User) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Find the item in the user's cart
    const cartItem = User.cart.items.find(item => item.productId.toString() === productId);
    if (cartItem) {
      // Update the quantity and save the updated user
      cartItem.quantity = quantity;
      await User.save();
      return res.status(200).json({ message: 'Cart updated', cart: User.cart.items });
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart:', error); // Log error for debugging
    return res.status(500).json({ message: 'Unable to update cart', error: error.message });
  }
};


// Remove item from the cart
export const removeItemFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const User = await user.findById(userId); // Ensure 'User' matches your model's naming
    if (!User) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure User.cart and items exist before accessing them
    User.cart.items = User.cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await User.save();
    res.status(200).json({ message: 'Item removed from cart', cart: User.cart.items }); // Use 'User' here too
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove item from cart', error });
  }
};

