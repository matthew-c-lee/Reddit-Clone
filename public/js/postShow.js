$(document).ready(function () {
    const post_id = $(location).attr('pathname').replace('/', '')
    // post_id = `${post_id}`.replace('/', '')

    $('.upvotePost').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/upvote`,
        }).then(res => {
            const postPoints = $(document.getElementById(`postPoints=${post_id}`))
            postPoints.html(`${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $('.downvotePost').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/downvote`,
        }).then(res => {
            // console.log('DOWNVOTE')
            const postPoints = $(document.getElementById(`postPoints=${post_id}`))
            postPoints.html(`${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $('.upvoteComment').each(function () {
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('upvote=', '')

            // server request
            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/upvote`,
            }).then(res => {
                // then use the info the server sent back (inside res)

                // get value from commentScore span (span has comment_id set as its ID)
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))

                // update the comment score
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes}`)
            })
        })
    })

    $('.downvoteComment').each(function () {
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('downvote=', '')

            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/downvote`,
            }).then(res => {
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes}`)
            })
        })
    })

    const addReplyBox = (comment_id) => {
        // remove any other replyboxes present so there's always only 1
        $('.replyBox').remove()

        // create reply box
        $(
        `<div class="replyBox px-4 py-4 border-2 my-4 ml-12">
            <form>
                <div class="mb-2">
                    <label for="reply" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Reply</label>
                    <textarea required name="reply" id="reply" class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="large-input" id="" cols="30" rows="3"></textarea>
                </div>
                <button class="submitReply mt-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Reply</button>
            </form>
        </div>`
        ).appendTo($(document.getElementById(`comment=${comment_id}`)))
    }

    $('.viewReplyBox').each(function () {
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('viewReplyBox=', '')

            addReplyBox(comment_id)

            // this must be inside the .viewReplyBox function so that it can detect the button
            $('.submitReply').each(function () {
                $(this).click(e => {
                    e.preventDefault()

                    const replyText = $('#reply').val()

                    $.ajax({
                        type: 'POST',
                        url: `${post_id}/comment/${comment_id}`,
                        data: { replyText },
                    }).then(res => {
                        // console.log(res)
                        reply = res.newComment

                        $('.replyBox').remove()

                        const newComment = $(document.getElementById(`comment=${comment_id}`))

                        const commentBody = $(`
                            <div class="container mx-auto my-1">
                                <div id="comment=${reply._id}" class="ml-12">
                                    <div class="border-2 px-4 py-4 w-100">
                                        <p><b>Username</b> • a few seconds ago</p>
                                        <p class="mb-2">${reply.text}</p>
                            
                                        <div class="flex">
                                            <div class="flex w-min inline-block">
                                                <button id="upvote=${reply._id}" class="upvoteComment block"><i class="text-gray-500 fa-xl fa-solid fa-arrow-up"></i></button>
                                                <span class="mx-2" id="commentScore=${reply._id}">${reply.upvotes - reply.downvotes}</span>
                                                <button id="downvote=${reply._id}" class="downvoteComment block"><i class="text-gray-500 fa-xl fa-solid fa-arrow-down"></i></button>
                                            </div>
                            
                                            <div class="inline-block ml-3">
                                                <a class="hover:bg-gray-200 inline-block px-1" href="/${post_id}/${reply._id}">View</a>
                                                <form class="hover:bg-gray-200 inline-block px-1" method="POST" action="/${post_id}/${reply._id}?_method=DELETE">
                                                    <button>Delete</button>
                                                </form>
                                                <button id="viewReplyBox=${reply._id}" class="viewReplyBox hover:bg-gray-200 inline-block px-1">Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `)
                        newComment.append(commentBody)
                        
                        const replyButton = $(`
                        <button id="viewReplyBox=${reply._id}" class="viewReplyBox hover:bg-gray-200 inline-block px-1">Reply</button>
                        `)

                        newComment.append(replyButton)
                        replyButton.on('click', function() {
                            addReplyBox(reply._id)
                        })


                    })
                })
            })

            // $.ajax({
            //     method: 'POST',
            //     url: `${post_id}/comment/${comment_id}/reply`
            // }).then((res) => {
            //     const commentScore = $(document.getElementById(`commentScore=${comment_id}`))
            //     commentScore.html(`${res.comment.upvotes - res.comment.downvotes}`)
            // })
        })
    })
})
