const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      minLength: 1,
      trim: true,
    },
    author: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blog: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
  },
  {
    timestamps: true,
  }
)

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Comment', commentSchema)
