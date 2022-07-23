$(document).ready(function () {
    const post_id = $(location).attr('pathname')

    $('#upvotePost').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/upvote`,
        }).then(res => {
            $('#postPoints').html(`Points: ${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $('#downvotePost').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/downvote`,
        }).then(res => {
            $('#postPoints').html(`Points: ${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $( ".upvoteComment" ).each(function(){
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('upvote=', '')

            // server request
            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/upvote`
            }).then((res) => { // then use the info the server sent back (inside res)

                // get value from commentScore span (span has comment_id set as its ID)
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))

                // update the comment score
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes}`)
            })
        })
    })

    $( ".downvoteComment" ).each(function(){
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('downvote=', '')

            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/downvote`
            }).then((res) => {
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes}`)
            })
        })
    })
})
