$(document).ready(function () {


    $( ".upvotePost" ).each(function(){
        $(this).click(e => {

            const post_id = this.id.replace('upvotePost=', '')
            // get the comment's ID
            // const comment_id = this.id.replace('upvote=', '')

            // server request
            $.ajax({
                method: 'POST',
                url: `post/${post_id}/upvote`
            }).then((res) => { // then use the info the server sent back (inside res)
                const postPoints = $(document.getElementById(`postPoints=${post_id}`))
                postPoints.html(`${res.post.upvotes - res.post.downvotes}`)
            })
        })
    })  

    $( ".downvotePost" ).each(function(){
        $(this).click(e => {
            const post_id = this.id.replace('downvotePost=', '')
            // get the comment's ID
            // const comment_id = this.id.replace('downvote=', '')

            // server request
            $.ajax({
                method: 'POST',
                url: `post/${post_id}/downvote`
            }).then((res) => { // then use the info the server sent back (inside res)
                const postPoints = $(document.getElementById(`postPoints=${post_id}`))
                postPoints.html(`${res.post.upvotes - res.post.downvotes}`)
            })
        })
    })  
})