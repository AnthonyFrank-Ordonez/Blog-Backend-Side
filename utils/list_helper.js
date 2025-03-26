const _ = require('lodash')


const dummy = () => {
  return 1
}

// total likes
const totalLikes = (blogs) => {
  // reduce the blogs to a single value
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

// favorite blog
const favoriteBlog = (blogs) => {
  // find the blog with the most likes
  const mostLikes = blogs.reduce((max, blog) => Math.max(max, blog.likes), -Infinity)

  return blogs.find(blog => blog.likes === mostLikes)

}

// most blogs
const mostBlogs = (blogs) => {
  // group blogs by author
  const authors = _.groupBy(blogs, 'author')

  // find the author with the most blogs
  const authorWithMostBlogs = _.maxBy(Object.keys(authors), (author) => authors[author].length)

  return {
    author: authorWithMostBlogs,
    blogs: authors[authorWithMostBlogs].length
  }
}

// most likes author
const mostLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  // group blogs by author
  const authors = _.groupBy(blogs, 'author')

  // find the author with the most likes
  const authorWithMostLikes = _.maxBy(Object.keys(authors), (author) => {
    return authors[author].reduce(reducer, 0)
  })

  return {
    author: authorWithMostLikes,
    likes: authors[authorWithMostLikes].reduce(reducer, 0)
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}