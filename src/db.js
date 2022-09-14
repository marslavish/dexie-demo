import Dexie from 'dexie';

export class PostsDB extends Dexie {
  constructor() {
    super('PostsDB');
    this.version(1).stores({
      posts: 'id,comments,title,body',
    });
  }

  // add a new post
  addNewPost(post) {
    this.posts.add(post);
  }

  // get all posts
  async getAllPosts() {
    const allPosts = await this.posts.toArray();
    return allPosts;
  }

  // get single post
  async getPostById(id) {
    const post = await this.posts.where('id').equals(id).first();
    return post;
  }

  // update the comments of the posts
  async updateComments(comments) {
    this.posts.toCollection().modify((post) => {
      const cmt = comments.filter((val) => val.postId === post.id);
      post.comments = [...post.comments, ...cmt];
    });
  }

  // delete a post
  deletePost(id) {
    this.posts.delete(id);
  }
}

const db = new PostsDB();

export default db;
