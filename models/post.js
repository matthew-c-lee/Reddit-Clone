const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
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
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Post', PostSchema)
