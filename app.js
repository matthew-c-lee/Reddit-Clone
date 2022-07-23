const methodOverride = require('method-override')
const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const Post = require('./models/post')
const Comment = require('./models/comment')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { postSchema } = require('./schemas')
// const { findById } = require('./models/post')

const app = express()

mongoose.connect('mongodb://localhost:27017/reddit-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    const posts = await Post.find({})
    res.render('posts/posts', { posts })
})

app.route('/submit')
    .get((req, res) => {
        res.render('posts/submit')
    })

    .post(
        catchAsync(async (req, res) => {
            const post = new Post(req.body.post)
            post.title = req.body.title
            post.text = req.body.text
            await post.save()
            res.redirect('/')
        })
    )

app.route('/:id')
    .get(
        catchAsync(async (req, res) => {
            const post = await Post.findById(req.params.id).populate({ path: 'comments' })

            if (!post) {
                console.log('Cannot find that post!')
                return res.redirect('/')
            }

            repliesToComments = []

            for (const comment of post.comments) {
                const agg = (await aggregateQuery(comment._id))[0]

                let replyComments = []

                await loadReplies(agg, replyComments, 1).then(replyList => {
                    if (!replyList) {
                        repliesToComments.push(null)
                    } else {
                        repliesToComments.push(replyList)
                    }
                })
            }

            res.render('posts/show', { post, repliesToComments })
        })
    )

    .post(
        catchAsync(async (req, res) => {
            const post = await Post.findById(req.params.id)
            const comment = await new Comment({ text: req.body.comment })
            comment.post_id = post._id

            // add comment to post
            post.comments.push(comment)
            await comment.save()
            await post.save()

            if (comment) {
                res.redirect(`/${req.params.id}`)
            }
        })
    )

app.post('/post/:id/upvote', async (req, res) => {
    const post = await Post.findById(req.params.id)

    post.upvotes++

    await post.save().then(() => {
        res.json({ post })
    })
})

app.post('/post/:id/downvote', async (req, res) => {
    const post = await Post.findById(req.params.id)

    post.downvotes++

    await post.save().then(() => {
        res.json({ post })
    })
})

app.post('/:id/comment/:comment_id/upvote', async (req, res) => {
    const comment = await Comment.findById(req.params.comment_id)

    comment.upvotes++

    // after database updates, send comment to jQuery in JSON format
    await comment.save().then(() => {
        res.json({ comment })
    })
})

app.post('/:id/comment/:comment_id/downvote', async (req, res) => {
    const comment = await Comment.findById(req.params.comment_id)

    comment.downvotes++
    await comment.save().then(() => {
        res.json({ comment })
    })
})

app.post(
    '/:id/upvote',
    catchAsync(async (req, res) => {
        const post = await Post.findById(req.params.id)
        post.upvotes++
        await post.save().then(() => {
            res.json({ post })
        })
    })
)

app.post(
    '/:id/downvote',
    catchAsync(async (req, res) => {
        const post = await Post.findById(req.params.id)
        post.downvotes++
        await post.save().then(() => {
            res.json({ post })
        })
    })
)

app.post(
    '/:id/:comment_id/upvote',
    catchAsync(async (req, res) => {
        const post = await Post.findById(req.params.id)
        post.upvotes++
        post.save()
        if (post) {
            res.redirect(`/${post._id}`)
        }
    })
)

const aggregateQuery = root_id => {
    const aggregateQuery = Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(root_id),
            },
        },
        {
            $graphLookup: {
                from: 'comments',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parent',
                as: 'replies',
                maxDepth: 0,
                depthField: 'depth',
            },
        },
    ])

    return aggregateQuery
}

const loadReplies = async (agg, replyComments, i) => {
    if (agg.replies == 0) {
        return
    }
    i++

    for (const reply of agg.replies) {
        replyObject = {
            _id: reply._id,
            parent: reply.parent,
            text: reply.text,
            upvotes: reply.upvotes,
            downvotes: reply.downvotes,
            // console.log()
            depth: i,
        }

        replyComments.push(replyObject)

        const newAgg = (await aggregateQuery(reply._id))[0]
        loadReplies(newAgg, replyComments, i)
    }

    return replyComments
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

app.route('/:id/:comment_id/')
    .get(
        catchAsync(async (req, res) => {
            const rootComment = await Comment.findById(req.params.comment_id)
            const post = await Post.findById(req.params.id)

            const agg = (await aggregateQuery(rootComment._id))[0]

            let replyComments = []

            await loadReplies(agg, replyComments, 1).then(replyList => {
                res.render('comments/show', { post, rootComment, replyList })
            })
        })
    )

    // reply
    .post(
        catchAsync(async (req, res) => {
            // original comment
            const comment = await Comment.findById(req.params.comment_id)
            const post = await Post.findById(req.params.id)

            // reply:
            const newComment = await new Comment({
                text: req.body.reply,
                parent: comment._id,
                post_id: post._id,
            })
            newComment.save()

            res.redirect(`/${req.params.id}/${req.params.comment_id}`)
        })
    )

    .delete(
        catchAsync(async (req, res) => {
            const comment = await Comment.findById(req.params.comment_id)

            // get parent id for redirecting
            const parent = comment.parent
            await comment.delete()

            if (!parent) {
                res.redirect(`/${req.params.id}`)
            }
            res.redirect(`/${req.params.id}/${parent}`)
        })
    )


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Port 3000 activated')
})
