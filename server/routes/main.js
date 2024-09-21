const express = require('express')
const router = express.Router()
const Post = require('../models/Post');

/**
 * GET /
 * HOME
*/

router.get('/', async (req, res) => {
    try{

    const locals = {
        title: "Nodejs Blog",
        description: "Simple Blog created with Nodejs, Express & MongoDB"            
    }
    
    let perPage = 10; //This line defines the number of documents (posts) to show per page. In this case, 10 documents will be displayed on each page.
    let page = req.query.page || 1; //This line retrieves the page number from the request query parameter (req.query.page). If the page number is not provided in the request, it defaults to 1 (the first page).
  
    // Fetch posts with pagination
    const data = await Post.aggregate([{ $sort: {createdAt: -1} }]) // posts will be ordered from the most recent to the oldest based on their createdAt timestamp.
    .skip(perPage * page - perPage) // This ensures that only the posts for the current page are returned.
    .limit(perPage) // This limits the number of documents returned to the number specified by perPage, which is 10 in this case.
    .exec(); // This executes the query and returns the result.

    // Count total number of documents/posts in the database
    const count = await Post.countDocuments();
    // Calculate next page number
    const nextPage =  parseInt(page) + 1;
    // Determine if there is a next page
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

        // Render the response
        res.render('index', {
            locals, 
            data,
            current: page, // Current page number
            nextPage: hasNextPage ? nextPage : null, // Next page number or null if no next page
            currentRoute: '/',
        });

    }catch(error){
     console.log(error);   
    }
});


/**
 * GET  
 * Post /:id
 * 
*/

router.get('/post/:id', async (req,res) => {
    try{

        const data = await Post.findById({_id: req.params.id});;
        
        const locals = {
            title: data.title,
            description: "Simple Blog created with Nodejs, Express & MongoDB"
        }
        
        res.render('post', {
            locals, 
            data, 
            currentRoute: `/post`
            });
    } catch (error) {
        console.log(error);
    }

});

/**
 * POST
 * Post search
 * 
*/

router.post('/search', async(req,res)=> {
    try{
            
        const locals = {
            title: "Search",
            description: "Simple Blog created with Nodejs, Express & MongoDB"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        
        
        const data = await Post.find({
            $or: [
                {title: {$regex: new RegExp(searchNoSpecialChar, 'i') }},
                {body: {$regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        });
        
        res.render("search", {
            data,
            locals
        });
    } catch(error){
        console.log(error);
    } 
})

router.get('/about', (req,res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

router.get('/contact', (req, res)=> {
    res.render('contact', {
        currentRoute: '/contact'
    })
})

module.exports = router;