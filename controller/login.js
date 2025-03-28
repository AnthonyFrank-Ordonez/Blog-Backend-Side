const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  // find user
  const user = await User.findOne({ username })

  // check password
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  // if not valid, return error
  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  // create token
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // sign token
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

  // send response
  response.status(200).send({ token, username: user.username, name: user.name })

})

module.exports = loginRouter