const Post = require('../models/post');
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/reddit-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log('Database connected')
})

const seedDB = async() => {
    await Post.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const upvotes = Math.floor(Math.random() * 50)
        const downvotes = Math.floor(Math.random() * 50)
        const post = new Post({
            title: `this is test title #${i + 1}`,
            text: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim voluptas corporis aliquam! Provident asperiores facere nam velit alias? Architecto, officiis magni officia dolore culpa nesciunt tempora asperiores ipsum ullam reiciendis.',
            upvotes,
            downvotes
        })
        await post.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})