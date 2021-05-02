<template>
  <div class="header">
    <span class="header-title">Complete Nutrition</span>
    <span class="header-login">
      <input type="username" v-model="usernameInput">
      <input type="password" v-model="passwordInput">
      <button class="login-btn" v-on:click="attemptLogin()">Login</button>
      <button class="create-account-btn" v-on:click="attemptCreateAccount()">Create New Account</button>
      <div>{{ accountStatusMsg }}</div>
    </span>
  </div>
</template>

<script>
import PostService from '../PostService'

export default {
  name: 'PostComponent',
  data() {
    return {
      usernameInput: "",
      passwordInput: "",

      accountStatusMsg: "",
      accountInfo: []
    }
  },
  methods: {
    async attemptLogin() {
      this.accountInfo = await PostService.attemptLogin(this.usernameInput, this.passwordInput)
    },
    async attemptCreateAccount() {
      this.accountStatusMsg = await PostService.attemptCreateAccount(this.usernameInput, this.passwordInput)
    }
  }
}
</script>
<style>
  .login {
    background: lightblue;
    display: flex;
    justify-content: space-between;
    margin: 50px 20% 50px 20%;
    padding: 20px;
  }
  .login-title {
    font-size: 1.5em;
  }
</style>