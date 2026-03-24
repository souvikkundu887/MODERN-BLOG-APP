import { useDispatch, useSelector } from "react-redux";
import { SetisOpen } from "../../utils/commentSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { setCommentLike, setComments, setReplies, setUpdatedComment, deleteComment } from "../../utils/blogSlice";
import toast from "react-hot-toast";
function CommentCompo({ len }) {
    const { token } = useSelector((state) => (state.user));
    const { comments } = useSelector((state) => (state.blog))

    const dispatch = useDispatch();
    function handleComment(e) {
        e.preventDefault();
        if (token) {
            dispatch(SetisOpen())
        }
        else {
            return toast.error("sign in first!")
        }
    }
    return (
        <>
            <p className="flex justify-center items-center gap-2 " onClick={(e) => {
                handleComment(e)
            }}>{len}
                <i class="fi fi-rr-comment-alt"></i>
            </p>
        </>
    )
}

export function Comment() {
    const [comment, setcomment] = useState('')
    const dispatch = useDispatch();
    const { blogId, comments, creator: { _id: creatorId } } = useSelector(state => state.blog)
    const [activeReply, setactiveReply] = useState(null)
    const [currPop, setCurrPop] = useState(null)
    const [currEditComment, setcurrEditComment] = useState(null)
    const { token, id: userid } = useSelector(state => state.user)
    async function handleComment(e) {
        try {
            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`, { comment }, {

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }

            })
            dispatch(setComments(res.data.newComment))
            setcomment('')
        } catch (err) {
           toast.error("something went wrong")
        }
    }

    return (
        <>
            <div className="min-h-screen absolute top-0 right-0 w-[400px] bg-white p-4  border-l drop-shadow-xl flex flex-col gap-4 overflow-scroll">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-medium">Comments({comments.length})</h1>
                    <i class="fi fi-br-cross text-shadow-lg cursor-pointer" onClick={() => dispatch(SetisOpen())}></i>
                </div>


                <div className="flex flex-col gap-2">
                    <textarea name="" id="" placeholder="comment here........." className="drop-shadow w-full focus:outline-none p-4 border resize-none" onChange={(e) => { setcomment(e.target.value) }} value={comment}></textarea>
                    <button className="bg-gray-400 p-2 rounded-xl w-[15%]" onClick={handleComment}>Add</button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                    <h1>Most recent Comments</h1>
                    <div>
                        <DisplayComment comments={comments} userid={userid} blogId={blogId} token={token} val={0} activeReply={activeReply} setactiveReply={setactiveReply} setComments={setComments} currPop={currPop} setCurrPop={setCurrPop} dispatch={dispatch} currEditComment={currEditComment} setcurrEditComment={setcurrEditComment} setcomment={setcomment} creatorId={creatorId} />
                    </div>
                </div>
            </div>

        </>
    )
}

function DisplayComment({ comments, userid, blogId, token, val, activeReply, setactiveReply, setComments, dispatch, currPop, setCurrPop, currEditComment, setcurrEditComment, setcomment, creatorId }) {
    const [reply, setreply] = useState('')
    const [updatedCommentContent, setupdateComment] = useState('')
    async function handleCommentlike(commentId) {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/likecomment/${commentId}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })
            dispatch(setCommentLike({ commentId, userid }))
        }
        catch (err) {
         toast.error("something went wrong")
        }
    }

    async function handleReply(commentId) {
        try {
            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/comment/${commentId}/${blogId}`, { reply }, {

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }

            })
            dispatch(setReplies(res.data.newReply))
            setreply('')
        } catch (err) {
           toast.error("something went wrong")

        }
    }

    async function handleEdit(commentId) {
        try {
            let res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/blogs/editcomment/${commentId}`, { updatedCommentContent }, {

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }

            })
            setcurrEditComment(null)
            dispatch(setUpdatedComment(res.data.updatedComment))
        }
        catch (err) {
         toast.error("something went wrong")
        }
    }

    async function handleCommentDelete(commentId) {
        try {
            let res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${commentId}`, {

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }

            })
            setcurrEditComment(null)
            dispatch(deleteComment(res.data.comment))
           
        }
        catch (err) {
       toast.error("something went wrong")

        }
    }

  return (
  <div className="min-h-screen w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-0">
    {comments.map(
      (
        {
          comment,
          likes,
          _id,
          updatedAt,
          user: { name, _id: userCommentId },
          replies,
        },
        i
      ) => (
        <div key={_id} className="w-full">

          
          <div className="my-4 bg-white shadow-md rounded-2xl p-4 sm:p-6 transition hover:shadow-lg">

          
            {currEditComment === _id ? (
              <div className="flex flex-col gap-4">
                <textarea
                  placeholder="Edit your comment..."
                  className="w-full focus:outline-none p-4 border rounded-xl resize-none text-sm sm:text-base"
                  onChange={(e) => {
                    setupdateComment(e.target.value);
                  }}
                  defaultValue={comment}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition w-full sm:w-auto"
                    onClick={() => {
                      handleEdit(_id);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition w-full sm:w-auto"
                    onClick={() => setcurrEditComment(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
             
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12">
                      <img
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <div>
                      <p className="capitalize font-semibold text-sm sm:text-base">
                        {name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

               
                  {(userid == userCommentId || userid == creatorId) && (
                    <div className="relative">
                      {currPop === _id ? (
                        <div className="absolute right-0 mt-2 w-28 bg-white border shadow-lg rounded-xl p-2 z-20">
                          {userid == userCommentId && (
                            <p
                              className="px-2 py-1 hover:bg-gray-100 rounded-md cursor-pointer text-sm"
                              onClick={() => {
                                setCurrPop(null);
                                setcurrEditComment(
                                  (prev) => (prev === _id ? null : _id)
                                );
                              }}
                            >
                              Edit
                            </p>
                          )}
                          <p
                            className="px-2 py-1 hover:bg-gray-100 rounded-md cursor-pointer text-sm text-red-500"
                            onClick={() => {
                              setCurrPop(null);
                              handleCommentDelete(_id);
                            }}
                          >
                            Delete
                          </p>
                        </div>
                      ) : (
                        <i
                          className="fi fi-rr-menu-dots-vertical cursor-pointer text-gray-500"
                          onClick={() => {
                            setCurrPop((prev) =>
                              prev == _id ? null : _id
                            );
                          }}
                        ></i>
                      )}
                    </div>
                  )}
                </div>

              
                <div className="mt-4 text-gray-800 text-sm sm:text-base leading-relaxed break-words">
                  {comment}
                </div>

                
                <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">

                  <div className="flex items-center gap-2 cursor-pointer">
                    {likes.includes(userid) ? (
                      <i
                        className="fi fi-sr-heart text-red-500"
                        onClick={() => handleCommentlike(_id)}
                      ></i>
                    ) : (
                      <i
                        className="fi fi-rr-heart"
                        onClick={() => handleCommentlike(_id)}
                      ></i>
                    )}
                    {likes.length}
                  </div>

                 
                  <div className="flex items-center gap-1">
                    <i className="fi fi-sr-comment-alt"></i>
                    <p>{replies.length}</p>
                  </div>

                
                  <div
                    className="hover:underline cursor-pointer"
                    onClick={() => {
                      setactiveReply((prev) =>
                        prev == _id ? null : _id
                      );
                    }}
                  >
                    Reply
                  </div>
                </div>
              </>
            )}

       
            {activeReply === _id && (
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  placeholder="Write a reply..."
                  className="w-full p-4 border rounded-xl focus:outline-none resize-none text-sm sm:text-base"
                  onChange={(e) => {
                    setreply(e.target.value);
                  }}
                  value={reply}
                />
                <button
                  className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-black transition w-full sm:w-auto"
                  onClick={() => {
                    handleReply(_id);
                  }}
                >
                  Reply
                </button>
              </div>
            )}
          </div>

    
          {replies.length > 0 && (
            <div className="ml-4 sm:ml-10 border-l pl-4">
              <DisplayComment
                comments={replies}
                userid={userid}
                blogId={blogId}
                token={token}
                val={1}
                activeReply={activeReply}
                setactiveReply={setactiveReply}
                setComments={setComments}
                currPop={currPop}
                setCurrPop={setCurrPop}
                dispatch={dispatch}
                currEditComment={currEditComment}
                setcurrEditComment={setcurrEditComment}
                setcomment={setcomment}
                creatorId={creatorId}
              />
            </div>
          )}

          {!val && <hr className="border-gray-200 my-4" />}
        </div>
      )
    )}
  </div>
);
}
export default CommentCompo