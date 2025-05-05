import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

function App() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const getPosts = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    const json = await response.json()
    return json
  }

  const getPost = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    const id = Math.floor(Math.random() * 100) + 1
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
    const json = await response.json()
    return json
  }

  const createPost = async (request) => {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  const updatePost = async (request) => {
    await fetch(`https://jsonplaceholder.typicode.com/posts/${request.id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  }

  const posts = useQuery({
    queryKey: ['posts', { page }],
    queryFn: getPosts,
    staleTime: 5000,
  })

  const post = useQuery({
    queryKey: ['post'],
    queryFn: getPost,
    enabled: posts.data?.length > 0,
  })

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts'],
        exact: true
      })
      queryClient.invalidateQueries({
        queryKey: ['post'],
        exact: true
      })
    }
  })

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts'],
      })
      queryClient.invalidateQueries({
        queryKey: ['post'],
      })
    }
  })

  function handleHover() {
    queryClient.prefetchQuery({
      queryKey: ['post'],
      queryFn: getPost,
    })
  }

  return (
    <>
      <button onClick={() => createPostMutation.mutate({
        title: 'example title',
        body: 'example body',
        userId: 1,
      })} disabled={createPostMutation.isPending}>
        Create post
      </button>

      <button onClick={() => updatePostMutation.mutate({
        title: 'example title',
        body: 'example body',
        userId: 1,
        id: 1
      })} disabled={updatePostMutation.isPending}>
        update post
      </button>

      <button onClick={() => { setPage(page + 1) }}>
        Load more
      </button>

      current page: { page }

      <h1>Random post</h1>
      {post.isFetching && <div>isFetching...</div>}

      {post.error && <div>Error: {post.error.message}</div>}

      {!post.isFetching && post.data && (
        <div key={post.data.id}>
          <h2>{post.data.title} - {post.data.id}</h2>
          <p>{post.data.body}</p>
        </div>
      )} 

      <h1>Posts</h1>
      {posts.isFetching && <div>Loading...</div>}

      {posts.error && <div>Error: {posts.error.message}</div>}

      {!posts.isFetching && posts.data?.map((post: any) => (
        <div key={post.id}>
          <h2 onMouseEnter={handleHover}>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </>
  )
}

export default App
