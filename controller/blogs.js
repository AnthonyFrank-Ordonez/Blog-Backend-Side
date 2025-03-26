const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const jwt = require('jsonwebtoken')
const middlewares = require('../utils/middleware')

// get all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// create blog
blogsRouter.post('/', middlewares.userExtractor, async (request, response) => {
  const body = request.body
  // verify token
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  // check if token is valid
  if (!decodedToken.id)
    return response
      .status(401)
      .json({ error: 'token missing or invalid or expired' })

  // get user
  const user = request.user

  // create blog
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: !body.likes ? 0 : body.likes,
    user: user._id,
  })

  // save blog
  let savedBlog = await blog.save()
  // update user blogs
  user.blogs = user.blogs.concat(savedBlog._id)
  // save user
  await user.save()

  // populate user field in saved blog
  savedBlog = await Blog.findById(savedBlog._id).populate('user', {
    username: 1,
    name: 1,
  })

  response.status(201).json(savedBlog)
})

// delete blog
blogsRouter.delete(
  '/:id',
  middlewares.userExtractor,
  async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    // check if user token is valid
    if (!decodedToken.id)
      return response
        .status(401)
        .send({ error: 'token missing or invalid or expired' })

    // find blog and user
    const blogId = request.params.id
    const blog = request.user._id

    // check if user is authorized to delete blog
    if (blog.toString() !== decodedToken.id)
      return response.status(401).send({ error: 'unauthorized' })

    // delete blog if authorized
    await Blog.findByIdAndDelete(blogId)
    response.status(204).end()
  }
)

// update blog
blogsRouter.put(
  '/:id',
  middlewares.userExtractor,
  async (request, response) => {
    const body = request.body

    // verify token
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken.id)
      return response
        .status(401)
        .json({ error: 'token missing or invalid or expired' })

    // get the user
    const user = request.user

    // create blog object without _id
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    }

    const blogId = request.params.id
    const userId = request.user._id

    // check if user is authorized to delete blog
    if (userId.toString() !== decodedToken.id)
      return response.status(401).send({ error: 'unauthorized' })

    let returnedBlog = await Blog.findByIdAndUpdate(blogId, blog, {
      new: true,
      runValidators: true,
    })

    // populate user field
    returnedBlog = await Blog.findById(returnedBlog._id).populate('user', {
      username: 1,
      name: 1,
    })

    response.json(returnedBlog)
  }
)

module.exports = blogsRouter
