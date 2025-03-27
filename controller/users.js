const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// GET /api/users
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate([
    { path: 'blogs', select: 'title author url ' },
    { path: 'comments', select: 'description createdAt updatedAt' },
  ])
  response.json(users)
})

// POST /api/users
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
