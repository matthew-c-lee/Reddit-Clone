$(document).ready(function () {
    const post_id = $(location).attr('pathname')

    $('#upvoteButton').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/upvote`,
        }).then(res => {
            // console.log(`${res.post}`)
            $('#postPoints').html(`Points: ${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $('#downvoteButton').click(e => {
        $.ajax({
            method: 'POST',
            url: `${post_id}/downvote`,
        }).then(res => {
            // console.log(`${res.post}`)
            $('#postPoints').html(`Points: ${res.post.upvotes - res.post.downvotes}`)
        })
    })

    $( ".upvoteComment" ).each(function(){
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('upvote=', '')
            // console.log(comment_id)

            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/upvote`
            }).then((res) => {
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes} points`)
            })
        })
    })

    $( ".downvoteComment" ).each(function(){
        $(this).click(e => {
            // get the comment's ID
            const comment_id = this.id.replace('downvote=', '')
            // console.log(comment_id)

            $.ajax({
                method: 'POST',
                url: `${post_id}/comment/${comment_id}/downvote`
            }).then((res) => {
                const commentScore = $(document.getElementById(`commentScore=${comment_id}`))
                commentScore.html(`${res.comment.upvotes - res.comment.downvotes} points`)
            })
        })
    })
})
