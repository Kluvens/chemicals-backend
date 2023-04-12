const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Cart = require('../../models/Cart');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, "THISSCRETKEY111GOOD");

    // Send response with token and user data
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to database
    const savedUser = await newUser.save();

    const user = await User.findOne({ email });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, "IDONOTKNOW");

    // create cart
    const cart = new Cart({ user: user.id, items: [], total: 0 });

    await cart.save();

    res.status(200).json({
      message: 'User registered successfully',
      userId: user.id,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    // Find user by ID in database
    const user = await User.findById(req.params.id);

    // If user not found, return error response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.id }).populate('user', ['name', 'email']);

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    res.status(200).json({items: cart.items, total: cart.total});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addToCart', async (req, res) => {
  try {
    const { userId, itemName, itemId, itemDescription, itemPrice } = req.body;

    let cart = await Cart.findOne({user: userId});

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const index = cart.items.findIndex((item) => item.name === itemName);

    if (index !== -1) {
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({
        name: itemName,
        product_id: itemId,
        description: itemDescription,
        price: itemPrice,
        quantity: 1,
      });
    }

    cart.total = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({items: cart.items, total: cart.total});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

router.post('/removeFromCart', async (req, res) => {
  try {
    const { userId, itemName, itemDescription, itemPrice } = req.body;

    let cart = await Cart.findOne({user: userId});

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const index = cart.items.findIndex((item) => item.name === itemName);

    if (index !== -1) {
      cart.items[index].quantity -= 1;
    } else {
      cart.items.push({
        id: itemId,
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        quantity: 1,
      });
    }

    cart.total = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({items: cart.items, total: cart.total});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

router.delete('/deleteFromCart', async (req, res) => {
  try {
    const { userId, itemName } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(400).json({ error: 'Cart not found' });
    }

    const index = cart.items.findIndex((item) => item.name === itemName);

    if (index === -1) {
      return res.status(400).json({ error: 'Item not found in cart' });
    }

    cart.items.splice(index, 1);

    cart.total = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({ items: cart.items, total: cart.total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
