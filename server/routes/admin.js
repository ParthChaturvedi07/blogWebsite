const express = require('express')
const router = express.Router()
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * Check Login middleware
*/

const isLoggedIn = (req,res,next) => {
    const token = req.cookies.token;
    
    if(!token) {
        return res.status(401).json({message: 'unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({message: "Unauthorized"});
    }
}


/**
 * GET /
 * Admin - Login page
*/

router.get('/admin', async (req,res) => {
    try{

    const locals = {
        title: "Admin",
        description: "Simple Blog created with Nodejs, Express & MongoDb."
    }
       res.render('admin/index', {locals, layout: adminLayout});
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }

})

/**
 * Post /
 * Admin  register
*/

router.post('/register', async (req, res) => {
  try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
          const user = await User.create({ username, password: hashedPassword });

          const token = jwt.sign({ userId: user._id }, jwtSecret);
          res.cookie('token', token, { httpOnly: true });

          res.status(201).redirect('/dashboard');
      } catch (error) {
          if (error.code === 11000) {
              return res.status(409).json({ message: 'Username already in use' });
          }
          res.status(500).json({ message: 'Internal server error' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * Post /
 * Admin - Check Login
*/

router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne( { username } );
  
      if(!user) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });

      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });

/**
 * Post /
 * Admin - Check Login
*/

router.get('/dashboard', isLoggedIn, async (req,res) => {
   
  
  try{
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with Nodejs, Express & MongoDB."
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } catch(error){
    console.log(error);
  }

});

/**
 * Get /
 * Admin - Create New Post
*/

router.get('/add-post', isLoggedIn, async (req,res) => { 
  
  try{
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with Nodejs, Express & MongoDB."
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      data,
      layout: adminLayout
    });
  } catch(error){
    console.log(error);
  }

});

/**
 * Post /
 * Admin - Create New Post
*/

router.post('/add-post', isLoggedIn, async (req,res) => { 
  try{
    try{
      const createPost = await Post.create({
        title: req.body.title,
        body: req.body.body
      });

      res.redirect('/dashboard')
    } catch(error){
      console.log(error);
    }
  } catch (error){
    log.error(error);
  }
});

/**
 * PUT /
 * Admin - Edit Post
*/

router.get('/edit-post/:id', isLoggedIn, async (req,res) => { 
  try{
    
    const locals = {
      title: "Edit Post",
      description: "'Free Nodejs User Management System"
    } 

    const data = await Post.findOne({_id:req.params.id});

    res.render('admin/edit-post', {
      data,
      locals,
      layout: adminLayout
    })

  } catch (error){
    log.error(error);
  }
});


/**
 * PUT /
 * Admin - Edit Post
*/

router.put('/edit-post/:id', isLoggedIn, async (req,res) => { 
  try{

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/post/${req.params.id}`)

  } catch (error){
    log.error(error);
  }
});


/**
 * DELETE /
 * Admin - Edit Post
*/

router.delete('/delete-post/:id', isLoggedIn, async(req,res) => {
  try{
    const deletePPost = await Post.deleteOne({_id: req.params.id});
    res.redirect('/dashboard')
  } catch(error){
    console.log(error);
  }
})

/**
 * get /
 * Admin - Logout
*/

router.get('/logout', (req,res) => {
  res.clearCookie('token');
  // res.json({message: 'Logout Successful'})
  res.redirect('/');
});


module.exports = router;