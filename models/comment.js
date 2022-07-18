const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    upvotes: {
        type: Number,
        default: 0,
        required: true,
    },
    downvotes: {
        type: Number,
        default: 0,
        required: true,
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
})

module.exports = mongoose.model('Comment', CommentSchema)