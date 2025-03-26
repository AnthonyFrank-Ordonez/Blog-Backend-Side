const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../app')
const helper = require('./test_helper.test')
const Blog = require('../models/blogs')
const api = supertest(app)

describe('when there is initially some blogs saved', () => {
  let token = null
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
    token = await helper.loginUser(api, {
      username: 'root',
      password: 'sekret'
    })
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('check if the unique identifier property of the blog posts is named id', async () => {
    const blogs = await helper.blogInDb()

    assert(blogs.every(blog => Object.hasOwn(blog, 'id')))

  })

  describe('adding a new blog', () => {
    test('a valid blog can be added', async () => {

      const newBlog = {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
      }

      // send new blog
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // get all blogs
      const blogsAfterAdd = await helper.blogInDb()
      assert.strictEqual(blogsAfterAdd.length, helper.initialBlogs.length + 1)

      // check if new blog is in the list
      const titles = blogsAfterAdd.map(blog => blog.title)
      assert(titles.includes(newBlog.title))

    })

    test('likes are not required', async () => {
      // create new blog
      const newBlog = {
        title: 'Title without likes',
        author: 'Author without likes',
        url: 'Url without likes',
      }

      // send new blog
      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      // get all blogs
      const blogsAfterAdd = await helper.blogInDb()
      assert.strictEqual(blogsAfterAdd.length, helper.initialBlogs.length + 1)

      // check if new blog is in the list
      const titles = blogsAfterAdd.map(blog => blog.title)
      assert(titles.includes(newBlog.title))
    })
  })

  describe('invalid blogs is not saved', () => {
    test('invalid data is not saved', async () => {

      // create new blog
      const newBlog = {
        title: 'Invalid title',
        author: 'Invalid author',
      }

      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      // get all blogs
      const blogsAfterAdd = await helper.blogInDb()
      assert.strictEqual(blogsAfterAdd.length, helper.initialBlogs.length)
    })
  })


  describe('deleting a blog', () => {
    test('a valid blog can be deleted', async () => {
      // get all blogs
      const blogs = await helper.blogInDb()
      const blogsToBeDeleted = blogs[1]

      // delete blog
      await api.delete(`/api/blogs/${blogsToBeDeleted.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // get all blogs
      const blogsAfterDelete = await helper.blogInDb()
      assert.strictEqual(blogsAfterDelete.length, helper.initialBlogs.length - 1)

      // check if blog is deleted
      const titles = blogsAfterDelete.map(blog => blog.title)
      assert(!titles.includes(blogsToBeDeleted.title))
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})




// describe('updating a blog', () => {
//   test('a valid data can be updated', async () => {

//     const blogs = await helper.blogInDb()
//     const blogToUpdate = blogs[0]

//     const updatedBlog = {
//       title: 'React patterns updated',
//       author: 'Michael Chan updated',
//       url: 'https://reactpatterns.com/updated',
//       likes: 7,
//     }

//     await api.put(`/api/blogs/${blogToUpdate.id}`)
//       .send(updatedBlog)
//       .expect(200)
//       .expect('Content-Type', /application\/json/)

//     const blogsAfterUdpate = await helper.blogInDb()
//     assert.strictEqual(blogsAfterUdpate.length, helper.initialBlogs.length)

//     const updatedTitle = blogsAfterUdpate.map(blog => blog.title)
//     assert(updatedTitle.includes(updatedBlog.title))
//   })
// })



