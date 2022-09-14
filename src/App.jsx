import React, { useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { Button, Card, Comment, Divider, Space, notification } from 'antd';
import { useRequest } from 'ahooks';
import db from './db';
import './App.css';

const App = () => {
  const [count, setCount] = useState(1);
  const [posts, setPosts] = useState([]);

  const { run: getNewPost } = useRequest(
    () => fetch(`https://jsonplaceholder.typicode.com/posts/${count}`),
    {
      manual: true,
      onSuccess: async (result) => {
        const data = await result.json();
        await db.addNewPost({ ...data, comments: [] });
        setPosts(await db.getAllPosts());
        setCount(count + 1);
      },
    }
  );

  const getComments = async () => {
    const responses = await Promise.all(
      posts
        .map((post) => post.id)
        .map((id) =>
          fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`).then((res) =>
            res.json()
          )
        )
    );
    // console.log(responses.map((res) => res[0]));
    return responses.map((res) => res[0]);
  };

  useEffect(() => {
    const getAllPosts = async () => {
      const allPosts = await db.getAllPosts();
      setPosts(allPosts);
    };
    getAllPosts();
  }, []);

  const openNotification = async (id) => {
    const post = await db.getPostById(id);

    notification.open({
      message: 'Post bookmarked',
      description: (
        <Card title={post.title} style={{ margin: 20 }}>
          <p>{post.body}</p>
        </Card>
      ),
      duration: 2,
    });
  };

  return (
    <>
      <Space size='large'>
        <Button type='primary' onClick={getNewPost}>
          Add a new post
        </Button>
        <Button
          onClick={async () => {
            const comments = await getComments();
            await db.updateComments(comments);
            setPosts(await db.getAllPosts());
          }}
        >
          Update comments
        </Button>
        <Button type='text'>Total posts: {posts.length}</Button>
      </Space>

      {posts.length > 0 &&
        posts.map((post) => (
          <Card
            title={post.title}
            style={{ width: 800, margin: 20 }}
            key={post.id}
            extra={
              <Space>
                <Button type='link' onClick={() => openNotification(post.id)}>
                  Bookmark
                </Button>
                <Button
                  type='text'
                  onClick={async () => {
                    await db.deletePost(post.id);
                    setPosts(await db.getAllPosts());
                  }}
                  danger
                >
                  Delete
                </Button>
              </Space>
            }
          >
            <p>{post.body}</p>
            <Divider plain>Comments ({post.comments.length})</Divider>
            {post.comments.map((cmt, idx) => (
              <Comment author={cmt.name} content={cmt.body} key={idx} />
            ))}
          </Card>
        ))}
    </>
  );
};

export default App;
