import axios from 'axios'

const url = 'api/posts/'


class PostService {
  // Get Posts
   //static means I can use the method without creating an instance of the class
  static attemptLogin(username, password) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: {
          user: username,
          pass: password
        }
      }).then(res => {
        const data = res.data
        resolve(
          data
        )
      })
      .catch(error => {
        reject(error)
      })
    })
  }
  // Create Post
  static attemptCreateAccount(newAccount) {
    return axios.post(url, newAccount)
  }
  // Update Account
  static attemptUpdateAccount(account) {
    return axios.put(url, account)
  }
  //Delete Post
  static deletePost(id) {
    return axios.delete(url + "" + id)
  }
}

export default PostService