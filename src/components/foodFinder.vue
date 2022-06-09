<template>
  <div class="main container food-finder">

    <div class="login-bar">
      <span class="login-title">Diet Nutrition Tool</span>
      <span v-if="accountInfo.username != ''" class="login-info lb-account">
        <div class="li-username">{{accountInfo.username}}</div>
        <button v-on:click="signOut()" class="li-sign-out btn">Save & Sign Out</button>
      </span>
      <span v-if="accountInfo.username == ''" class="login-input lb-account">
        <form class="li-form" @submit.prevent="" action="">
          <div class="lif-inputs">
            <input class="input" type="username" v-model="usernameInput">
            <input class="input" type="password" v-model="passwordInput">
          </div>
          <div class="lif-btns">
            <button type="submit" class="login-btn btn" v-on:click="attemptLogin()">Login</button>
            <button class="create-account-btn btn" v-on:click="attemptCreateAccount()">New Account</button>
          </div>
        </form>
      </span>
      <div class ="lb-status" :style="lbStatusChange">{{ accountStatusMsg }}</div>
    </div>

    <img class="apple-img" alt="Apple" src="../assets/burger-fries.png">

    <!--<button v-on:click="apiTestFunction()">API TEST</button>-->
    <div class="search-params">
      <input class="search-input" type="text" placeholder="Search your food here" v-model="searchQuery" v-on:input="findSearchResults()"/>
      <select v-model="branded" v-on:input="findSearchResults()" class="branded dropdown-menu">
        <option value="true">Include branded</option>
        <option value="false">Don't include branded</option>
      </select>
    </div>
    <div class="row">


      <div class="search row-item" v-bind:style='{"display": searchDisplay}'>
        <div class="search-results">
          <div class="sr-item" v-for="(item, index) in searchResults" :key='index'>
            <span class="sri-info">
              <div class="sri-info-row food-title1">{{ item.description }}</div>
              <div class="sri-info-row">Calories {{ item.energy }} Per 100g | Protein {{ item.protein }}g Per 100g</div>
            </span>
            <button class="sri-btn btn" v-on:click="addToDiet(item.fdcId)">Add to Diet</button>
          </div>
          <button class="btn sr-button" v-bind:style='{"display": searchButtonDisplay}' v-on:click="findMoreSearchResults()">More Search Results</button>
        </div>
      </div>


      <div class="diet row-item" v-bind:style='{"display": dietDisplay}'>
        <div class="d-item" v-for="(dietItem, dietIndex) in diet" :key='dietIndex'>
          <img class="x-icon" src="@/assets/x-icon.png" alt="x-icon" v-on:click="deleteDietItem(dietIndex)">
          <span class="di-info">
            <span class="di-title food-title1">{{ dietItem.description }}</span>
            <span class="di-amount">Weight: {{dietItem.weight}}g</span>&nbsp;
            <span class="di-amount">Portion:
              <input class="di-input num-input" type="number" v-model="dietItem.portionCount" v-on:input="displayNutrientList(dietIndex, false)"> of 
              <select v-model="dietItem.portionIndex" v-on:input="displayNutrientList(dietIndex, false)" class="di-portion-index dropdown-menu di-input">
                <option v-for="(portionItem, portionIndex) in dietItem.portionData" :key='portionIndex' :value='portionIndex'>
                  {{portionItem.portionDescription}} ({{portionItem.gramWeight}}g)
                </option>
              </select>
            </span>
          </span>
          <button class="di-btn btn" v-on:click="displayNutrientList(dietIndex, true)">More Details</button>
        </div>
        <div class="d-item" v-bind:style='{"display": loadingDisplay}'>Loading {{loadingTracker}} diet item<span v-if="loadingTracker != 1">s</span>...</div>
      </div>


      <div class="nutrition-specifics row-item" v-bind:style='{"display": nutrientDisplay}'>
        <div v-if="diet.length > 0">
          <div class="ns-back-arrow-wrapper" v-on:click="backToDiet()">
            <img class="back-arrow ns-back-arrow" src="@/assets/back-arrow.png" alt="x-icon">
            <span class="ns-back-arrow-text">Back to Diet</span>
          </div>
          <span class="ns-title food-title1">{{ diet[nutrientListDietReferenceIndex].description }} ({{convertPortionToGrams(diet[nutrientListDietReferenceIndex])}}g)</span>
          <div class="ns-item" v-for="(item, index) in diet[nutrientListDietReferenceIndex].nutrients" :key='index'>
            <span class="nsi-info"><!--{{ item.nutrientId }}-->{{ item.nutrientName }} | Value {{ item.value }} {{ item.unitName }}</span>
          </div>
        </div>
      </div>


    </div>


    <div class="diet-settings">
      <span class="header1">Diet Timeframe:</span>
      <input class="ds-Timeframe num-input" type="number" v-model="accountInfo.timeframe">
      <select class="ds-time-unit input" v-model="accountInfo.timeMultiplier">
        <option value="1">Days</option>
        <option value="7">Weeks</option>
        <option value="30">Months</option>
      </select>
      <button class="btn calculate-btn" v-on:click="compareDietToDailyValues()">Calculate Complete Nutrition</button>
    </div>


    <div class="diet-report" v-bind:style='{"display": reportDisplay}'>
        <div class="dr-item" v-for="(item, index) in totalUserNutrition" :key='index'>
          <span class="dri-title header1">{{item.nutrientName}} </span>
          <span class="dri-info row">
            <span class="row-item">{{ index }} | Value: {{ item.value }} {{ reactiveDailyValue[index].unit }}</span>
            <span v-if="item.DVCompare == 'normal'" class="row-item drii-DVCompare-normal">{{ item.DVCompare }}</span>
            <span v-if="item.DVCompare == 'low' || item.DVCompare == 'high'" class="row-item drii-DVCompare-low-high">{{ item.DVCompare }}</span>
            <span v-if="item.DVCompare == 'slightly low' || item.DVCompare == 'slightly high'" class="row-item drii-DVCompare-slightly">{{ item.DVCompare }}</span>
          </span>
          <span class="dri-more-info">
            <button @click="moreInfoToggle(index)" class="btn drimi-btn drimi-row">
              <span v-if="item.moreInfoToggle">Less Info</span>
              <span v-if="!item.moreInfoToggle">More Info</span>
            </button>
            <span class="drimi-content" v-if="item.moreInfoToggle">
              <div class="drimi-row drimi-category header2">Daily Values</div>
              <div class="drimi-row">Minimum: {{ reactiveDailyValue[index].min }} {{ reactiveDailyValue[index].unit }} | Maxiumum: {{ reactiveDailyValue[index].max }} {{ reactiveDailyValue[index].unit }}</div>
              <div class="drimi-row drimi-category header2">Timeframe Values</div>
              <div class="drimi-row">Minimum: {{ reactiveTimeframeValue[index].min }} {{ reactiveTimeframeValue[index].unit }} | Maxiumum: {{ reactiveTimeframeValue[index].max }} {{ reactiveTimeframeValue[index].unit }}</div>
              <div class="drimi-row drimi-category header2">Reference</div>
              <div class="drimi-row"><a :href="reactiveDailyValue[index].reference">{{ reactiveDailyValue[index].reference }}</a></div>
            </span>
          </span>
        </div>
    </div>
    <mainFooter/>

  </div>
</template>

<script>
import dailyValue from '@/assets/daily-value.json'
import postService from '../PostService'
import mainFooter from './mainFooter'
const axios = require('axios').default

export default {
  name: 'HelloWorld',
  components: {
    mainFooter
  },
  data() { 
    return {
      usernameInput: "",
      passwordInput: "",

      accountStatusMsg: "Welcome!",
      accountInfo: {
        username: "",
        password: "",
        diet: {},
        timeframe: 1,
        timeMultiplier: 1
      },

      searchQuery: "cheerios",
      searchDisplay: "none",
      searchButtonDisplay: "none",
      dietDisplay: "none",
      nutrientDisplay: "none",
      reportDisplay: "none",
      loadingDisplay: "none",
      loadingTracker: 0,

      displayNutrientListBlockingVariable: true,
      branded: "true",
      Timeframe: 1,
      timeMultiplier: "1",
      nutrientListDietReferenceIndex: 0,
      searchScroll: 0,
      resultsLength: 0,
      searchResults:[],
      diet:[],
      totalUserNutrition:{},
      totalUserNutritionReactive:[],
      reactiveDailyValue: dailyValue,
      reactiveTimeframeValue: {},

      //CSS Styles
      lbStatusChange: {
        'font-style': 'normal'
      }
    }
  },
  methods: {

    async attemptLogin() {
      // Check input validity
      if (!(this.isValidAccountInput(this.usernameInput) && this.isValidAccountInput(this.passwordInput))){
        this.accountStatusMsg = "Username or password is invalid"
        return
      }
      // Backend request
      let res = await postService.attemptLogin(this.usernameInput, this.passwordInput)
      //fdjsalkfjdsal
      if (this.lbStatusChange['font-style'] == "normal"){
        this.lbStatusChange = {'font-style': 'italic'}
      } else {
        this.lbStatusChange = {'font-style': 'normal'}
      } 
      this.accountStatusMsg = res.msg
      //Checking if account is up to date
      let contemporaryAccount = this.checkAccountContemporaneity(res.account)
      if (res.msg == "Successful Login"){
        this.diet = contemporaryAccount.diet
        this.accountInfo = contemporaryAccount
        //updates diet display so that it shows your diet once you login
        this.dietDisplay = "block"
        this.nutrientDisplay = "none"
      }
      //Code for updating outdated accounts

    },
    async attemptCreateAccount() {
      //Checking account validity
      if (!(this.isValidAccountInput(this.usernameInput) && this.isValidAccountInput(this.passwordInput))){
        this.accountStatusMsg = "Username or password is invalid"
        return
      }
      //creating new account data and sending it to backend, then recieving a response
      let newAccount = {
        username: this.usernameInput,
        password: this.passwordInput,
        diet: this.diet,
        timeframe: this.accountInfo.timeframe,
        timeMultiplier: this.accountInfo.timeMultiplier
      }
      let res = await postService.attemptCreateAccount(newAccount)
      this.accountStatusMsg = res.data.msg
      this.accountInfo = res.data.account
    },
    async saveAccountData() {
      this.accountInfo.diet = this.diet
      let res = await postService.attemptUpdateAccount(this.accountInfo)
      this.accountStatusMsg = res.data.msg
    },
    signOut: function() {
      this.saveAccountData()
      this.accountInfo = {
        username: "",
        password: "",
        diet: {},
        timeframe: 1,
        timeMultiplier: 1
      }
    },
    checkAccountContemporaneity: function(account) {
      // Compares account to client account schema
      let contemporaryAccount = account
      for (let item in this.accountInfo) {
        if (account[item] == undefined) {
          contemporaryAccount[item] = this.accountInfo[item]
        }
      }
      return contemporaryAccount
    },
    isValidAccountInput: function(variable) {
      if (variable == "" || variable.includes(" ")) {
        return false
      }
      return true
    },


    findSearchResults: function() {
      return axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.searchQuery,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          let i = 0
          this.resultsLength = 30
          this.searchResults = []
          while(i < this.resultsLength) {
            if (res.data.foods[i] != null) {
              if ((!(res.data.foods[i].dataType == "Branded" && this.branded == "false")) && (!(res.data.foods[i].foodNutrients.length == 0))) {
                  this.searchResults.push({
                    fdcId: res.data.foods[i].fdcId,
                    description: res.data.foods[i].description,
                    energy: this.findNutrientValue(res.data.foods[i].foodNutrients, 1008).value,
                    protein: this.findNutrientValue(res.data.foods[i].foodNutrients, 1003).value
                  })
              }
              else {
                this.resultsLength++
              }
            } else {
              break
            }
            i++
          }
          // Search Button Display Checking
          this.searchButtonDisplay = "none"
          if (res.data.foods[i] != null) {
            this.searchButtonDisplay = "inline"
          }
          // Search Results Display Checking
          this.searchDisplay = "block"
          if (this.searchResults.length == 0) {
            this.searchDisplay = "none"
          }
          if (this.searchQuery == "") {
            this.searchDisplay = "none"
          }
          
        })
        .catch(err => {console.error(err)})
    },

    findMoreSearchResults: function() {
      if (this.searchQuery == "") {
        this.searchDisplay = "none"
      } else {
        this.searchDisplay = "block"
      }
      return axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.searchQuery,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
          let i = this.resultsLength
          this.resultsLength += 30
          while(i < this.resultsLength) {
            if (res.data.foods[i] != null) {
              if ((!(res.data.foods[i].dataType == "Branded" && this.branded == "false")) && (!(res.data.foods[i].foodNutrients.length == 0))) {
                  this.searchResults.push({
                    fdcId: res.data.foods[i].fdcId,
                    description: res.data.foods[i].description,
                    energy: this.findNutrientValue(res.data.foods[i].foodNutrients, 1008).value,
                    protein: this.findNutrientValue(res.data.foods[i].foodNutrients, 1003).value
                  })
              }
              else {
                this.resultsLength++
              }
            } else {
              break
            }
            i++
          }
          // Search Button Display Checking
          if (res.data.foods[i] != null) {
            this.searchButtonDisplay = "inline"
          }
          else {
            this.searchButtonDisplay = "none"
          }
        })
        .catch(err => {console.error(err)})


    },



    addToDiet: function(fdcId) {
      let isNew = true
      //Checking diet if fdcId is already there
      for (let i in this.diet) {
        if (this.diet[i].fdcId == fdcId) {
          this.diet[i].portionCount = parseInt(this.diet[i].portionCount) + 5
          this.displayNutrientList(i, false)
          isNew = false
        }
      }
      if (isNew) {
        this.loadingTracker += 1
        this.loadingDisplay = "block"
        this.dietDisplay = "block"
        console.log("Requesting fdcId " + fdcId)
        axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
          params: {
            query: fdcId,
            API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
          }
        })
          .then(res => {
            console.log("Food Received")
            console.log(res.data.foods[0])
              let searchRes = res
              let foodUrl = "https://api.nal.usda.gov/fdc/v1/food/" + fdcId
              axios.get(foodUrl, {
                params: {
                  API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
                }
              })
                .then(res => {
                  let portionDataExtended = [{
                    id: null,
                    portionDescription: "1 Gram",
                    gramWeight: 1,
                    sequenceNumber: null,
                    modifier: null,
                    measureUnit: {
                      id: 9999,
                      name: "undetermined",
                      abbreviation: "undetermined",
                    },
                  }]
                  for (let portion in res.data.foodPortions){
                    portionDataExtended.push(res.data.foodPortions[portion])
                  }
                  this.diet.push({
                    fdcId: fdcId,
                    description: searchRes.data.foods[0].description,
                    energy: this.findNutrientValue(searchRes.data.foods[0].foodNutrients, 1008).value,
                    protein: this.findNutrientValue(searchRes.data.foods[0].foodNutrients, 1003).value,
                    nutrients: [],
                    portionCount: 1,
                    portionIndex: 0, 
                    portionData: portionDataExtended,
                    weight: 1 * portionDataExtended[0].gramWeight
                  })
                  console.log(this.diet[0].portionData)
                  //updating the nutrients list
                  this.displayNutrientList(this.diet.length-1, false)
                  // Loading bar managemment
                  this.loadingTracker -= 1
                  if(this.loadingTracker == 0) {
                    this.loadingDisplay = "none"
                  }
                  //Diet Display management
                  if (this.diet.length == 0) {
                    this.dietDisplay = "none"
                  } else {
                    this.dietDisplay = "block"
                    this.nutrientDisplay = "none"
                  }
                })
                .catch(err => {console.error(err)})
            
          })
          .catch(err => {console.error(err)})
      }
    },




    displayNutrientList: function(dietIndex, displayBool) {
      //Somtimes this function is used just to gather api data, so displaybool is for when i call it, if i want it to display or not
      if (displayBool) {
        this.nutrientDisplay = "block"
        this.dietDisplay = "none"
      }
      //Variables for other functions idk which ones im writing these comments late
      this.nutrientListDietReferenceIndex = dietIndex
      this.displayNutrientListBlockingVariable = true
      //Calling API and updating list
      console.log("Api call inside displayNutrientList is happening now")
      axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
        params: {
          query: this.diet[dietIndex].fdcId,
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        //so what I wanna do here is somehow manage the nutrients that nobody cares about
        .then(res => {
          console.log("Food object for nutrients list")
          console.log(res.data.foods[0])
          //this is for keeping the number values consistent with the portion selected
          this.diet[dietIndex].nutrients = []
          this.diet[dietIndex].weight = this.convertPortionToGrams(this.diet[dietIndex])
          let foodScaleMultiplier = this.diet[dietIndex].weight/100

          let currentNutrientValue = 0
          for (let i in res.data.foods[0].foodNutrients) {
            currentNutrientValue = +(res.data.foods[0].foodNutrients[i].value*foodScaleMultiplier).toFixed(3)
            if (res.data.foods[0].foodNutrients[i] != null) {
              //console.log("pushing " + i + " to dietIndex:" + dietIndex)
              this.diet[dietIndex].nutrients.push({
                nutrientId: res.data.foods[0].foodNutrients[i].nutrientId,
                nutrientName: res.data.foods[0].foodNutrients[i].nutrientName,
                value: currentNutrientValue,
                unitName: res.data.foods[0].foodNutrients[i].unitName
              })
            } else {
              this.displayNutrientListBlockingVariable = false
              break
            }
          }
          this.displayNutrientListBlockingVariable = false

        })
        .catch(err => {console.error(err)})
      console.log("end of displayNutrientList")
      console.log(this.totalUserNutrition)
    },





    findNutrientValue: function(data , nutrient) {
      let i = 0
      //console.log(data, data.length)
      try {
        while (nutrient != data[i].nutrientId || i >= data.length) {
          //console.log(i, data[i].nutrientName)
          i++
        }
        return {
          value: data[i].value,
          unitName: data[i].unitName,
          index: i
        }
      }
      catch {
        return {
          value: 0,
          unitName: "G",
          index: 0
        }
      }
    },

    backToDiet: function() {
      this.dietDisplay = "block"
      this.nutrientDisplay = "none"
    },

    deleteDietItem: function(i) {
      this.diet.splice(i, 1)
      this.nutrientListDietReferenceIndex = 0
      if (this.diet.length == 0) {
        this.dietDisplay = "none"
      }
    },

    // toggles the more info reference of a specified index in totalUserNutrition
    moreInfoToggle: function(index) {
      if (this.totalUserNutrition[index].moreInfoToggle == false){
        this.totalUserNutrition[index].moreInfoToggle = true
      } else {
        this.totalUserNutrition[index].moreInfoToggle = false
      }
      let objectTempReactivityVariable = this.totalUserNutrition
      this.totalUserNutrition = {}
      this.totalUserNutrition = objectTempReactivityVariable
    },

    totalUpDietNutrition: function() {
      // let userNutritionKeys = Object.keys(this.totalUserNutrition)
      // console.log(userNutritionKeys)
      for(let i in this.diet) {
        console.log("Calculating nutrition facts based on weight for this.diet[" + i + "]")
        for (let n in this.diet[i].nutrients) {
          console.log(this.diet[i].nutrients)
          console.log("n is " + n)
          console.log("attempting to print data")

          console.log(this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] == undefined)
          if (this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] == undefined) {
            this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId] = {value: 0, nutrientName: this.diet[i].nutrients[n].nutrientName, DVCompare: "normal", moreInfoToggle: false}
            // checking reactive daily value for data on the nutrient in question
            if (this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId] == undefined) {
              this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId] = {name: this.diet[i].nutrients[n].nutrientName, min: 0, max: 999999, unit: this.diet[i].nutrients[n].unit, reference: "none"}
              console.log("Reactive Daily Value new entry")
              console.log(this.reactiveDailyValue[this.diet[i].nutrients[n].nutrientId])
            }
          }
          this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value = this.diet[i].nutrients[n].value + this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value
          console.log(this.totalUserNutrition[this.diet[i].nutrients[n].nutrientId].value)
          //console.log(this.totalUserNutrition.parseInt(this.diet[i].nutrients[n].fcdId))
        }
        console.log("finished with this.diet[" + i + "]")
        
      }
      // TotalUserNutrition should be added up with everhthing from this.diet
      console.log(this.totalUserNutrition)
      console.log(this.totalUserNutrition[1003])
    },

    compareDietToDailyValues: function() {
      this.saveAccountData()
      console.log("totaling up nutrition")
      this.totalUserNutrition = {}
      let tempJSONDVString = JSON.stringify(dailyValue)
      this.reactiveDailyValue = JSON.parse(tempJSONDVString)
      this.totalUpDietNutrition()
      tempJSONDVString = JSON.stringify(this.reactiveDailyValue)
      this.reactiveTimeframeValue = JSON.parse(tempJSONDVString)
      //comparing diet nutrient totals to daily value data
      for(let i in this.reactiveTimeframeValue) {
        console.log("now working with nutrient " + i)
        //let minimumTimeframeValue = this.reactiveTimeframeValue[i].min * this.accountInfo.timeframe * parseInt(this.accountInfo.timeMultiplier)

        // updating reactiveTimeframeValue to match Timeframe
        this.reactiveTimeframeValue[i].min = this.reactiveTimeframeValue[i].min * this.accountInfo.timeframe * parseInt(this.accountInfo.timeMultiplier)
        this.reactiveTimeframeValue[i].max = this.reactiveTimeframeValue[i].max * this.accountInfo.timeframe * parseInt(this.accountInfo.timeMultiplier)
        // starting at a baseline normal value
        if (this.totalUserNutrition[i] == undefined) {
          this.totalUserNutrition[i] = {value: 0, nutrientName: this.reactiveTimeframeValue[i].name, DVCompare: "normal", moreInfoToggle: false}
        }
        // checking if too low
        if (this.reactiveTimeframeValue[i].min > this.totalUserNutrition[i].value) {
          this.totalUserNutrition[i].DVCompare = "low"
          console.log(this.reactiveTimeframeValue[i].min*.7)
          console.log(this.reactiveTimeframeValue[i].max + this.reactiveTimeframeValue[i].min*.3)
          if (this.reactiveTimeframeValue[i].min*.7 < this.totalUserNutrition[i].value) {
            console.log("slightly low")
            this.totalUserNutrition[i].DVCompare = "slightly low"
          }
        }
        // checking if too high
        if (this.reactiveTimeframeValue[i].max < this.totalUserNutrition[i].value) {
          this.totalUserNutrition[i].DVCompare = "high"
          if (this.reactiveTimeframeValue[i].max + this.reactiveTimeframeValue[i].min*.3 > this.totalUserNutrition[i].value) {
            this.totalUserNutrition[i].DVCompare = "slightly high"
          }
        }
      }
      console.log("rTimeframe")
      console.log(this.reactiveTimeframeValue["1003"].min)
      console.log(this.reactiveTimeframeValue)
      console.log("rdaily")
      console.log(this.reactiveDailyValue["1003"].min)
      console.log(this.reactiveDailyValue)
      console.log("daily")
      console.log(dailyValue["1003"].min)
      console.log(dailyValue)
      console.log(this.totalUserNutrition)
      this.reportDisplay = "block"
    },

    convertPortionToGrams: function (dietItem) {
      return dietItem.portionCount * dietItem.portionData[dietItem.portionIndex].gramWeight
    },

    apiTestFunction: function() {
      return axios.get("https://api.nal.usda.gov/fdc/v1/food/1101702", {
        params: {
          API_KEY: "i4ljZA3H5yxGNHOmFgcEbBy0U5Kiwxd7LWs2u3ya"
        }
      })
        .then(res => {
          console.log(res.data)
        })
        .catch(err => {console.error(err)})
    }
  }
}

</script>

<!-- totalUserNutrition data structure
{
  value: 0, 
  nutrientName: dailyValue[i].name, 
  DVCompare: "normal", 
  moreInfoToggle: false
}
-->


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}

* {
  clear: right;
}



.container {
  max-width: 1150px;
  margin: 0 auto;
  padding: .5em .5em;
  background: #fefefe;
}

.row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.row-item {
  flex-basis: 0;
  flex-grow: 1;
  margin: 20px;
  flex-wrap: wrap;
  flex-basis: 400px;
}

.food-title1 {
  font-weight: bold;
  display: block;
}

.btn {
  background: #FF9900;
  border: 2px solid #C13100;
  font-weight: bold;
  transition: all .3s;
  box-shadow: 2px 3px 6px black;
}

.btn:hover {
  background: #C13100;
}

.num-input {
  border: 2px solid black;
  width: 3.5em;
  background: #eeeeee;
  font-weight: bold;
}

.input {
  border: 2px solid black;
  background: #eeeeee;
  font-weight: bold;
}

.dropdown-menu {
  border: 2px solid black;
  background: #eeeeee;
  font-weight: bold;
}

.x-icon {
  width: 15px;
  height: 15px;
  padding: 5px;
  filter: grayscale(100%);
  transition: filter .15s;
}

.x-icon:hover {
  filter: grayscale(0%);
}

.header1 {
  font-weight: bold;
  font-size: 1.1em;
}

.header2 {
  font-weight: bold;
}

/* --------------------------------------------SPECIFICS-------------------------------------------*/

.login-bar {
  background: #eee;
  display: flex;
  justify-content: space-evenly;
  padding: 20px;
  flex-wrap: wrap;
}

.login-title {
  font-size: 1.5em;
  margin: auto 0;
  padding: 5px;
}

.lb-account {
  margin: auto 0;
}

.lb-status{
  margin: auto 0;
  padding: 5px;
}

.li-username {
  margin-bottom: 3px;
  font-weight: 600;
}

.li-form {
  display: flex;
  justify-content: center;
}

.li-form * *{
  margin: 1px 2px;
}

.lif-inputs {
  margin: auto 0;
}

.lif-btns {
  margin: auto 0;
}

.apple-img {
  display: block;
  margin: auto;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  height: auto;
}

/*
------------------------------------------Search----------------------------------------------*/
.search-params {
  display: flex;
  margin-bottom: 5px;
  justify-content: center;
  flex-wrap: wrap;
}

.search-input {
  display: block;
  margin: auto 2px;
  width: 300px;
  font-size: 1.25em;
}

.branded {
  display: block;
  margin: auto 2px;
}

.search-results {
  display: block;
  border: 1px solid black;
  max-height: 300px;
  overflow: scroll;
  overflow-x: hidden;
}

.sr-item {
  display: flex;
  padding: 5px;
  text-align: center;
  justify-content: space-between;
}
.sr-item:nth-child(even){
  background: #eee;
}
.sr-item:hover {
  background: rgba(0, 0, 0, .1);
}

.sr-button{
  margin: 5px 0;
}

.sri-info {
  display: block;
  width: 85%;
}

.sri-info-row {
  flex-wrap: wrap;
}

.sri-btn {
  margin-left: 2%;
  width: 15%;
  min-width: 45px;
}

/* DIET */

.diet {
  display: block;
  min-height: 43px;
  max-height: 300px;
  border: 1px solid black;
  overflow: scroll;
  overflow-x: hidden;
}

.d-item {
  display: flex;
  padding: 5px;
}

.d-item:nth-child(even){
  background: #eee;
}

.di-info {
  display: block;
  width: 85%;
  padding: 4px 0;
}

.di-title{
  margin-bottom: 5px;
}

.di-amount {
  display: inline-block;
}

.di-input {
  font-size: 1em;
}

.di-btn {
  margin-left: 2%;
  width: 15%;
  min-width: 60px;
}

.di-portion-index {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media only screen and (max-width: 450px) {
  .d-item {
    flex-wrap: wrap;
    justify-content: center;
  }
  .di-btn{
    display: block;
    width: 80%;
  }
}

/* NUTRITION SPECIFICS */

.nutrition-specifics {
  display: block;
  min-height: 43px;
  max-height: 300px;
  border: 1px solid black;
  overflow: scroll;
  overflow-x: hidden;
}

.ns-item {
  margin: 2px;
}
.ns-item:nth-child(even) {
  background: #eee
}

.ns-title {
  margin: 0 30px;
}

.ns-back-arrow-wrapper {
  display: block;
  position: absolute;
  border: 1px solid black;
  margin: 2px;
  background: #FF9900;
  box-shadow: 2px 3px 6px black;
  transition: all 1s;
}

.ns-back-arrow {
  width: 25px;
  height: 25px;
  padding: 5px 0 5px 0px;
  vertical-align: middle;
}

.ns-back-arrow-text{
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  padding-top: 2px;
  color: black;
  vertical-align: middle;
  font-stretch: ultra-condensed;
  width: 0px;
  transition: all 1s;
  overflow: hidden;
}

.ns-back-arrow-wrapper:hover {
  background: #C13100;
}

.ns-back-arrow-wrapper:hover .ns-back-arrow-text{
  display: inline-block;
  width: 100px;
  font-stretch: normal;
}

/* DIET SETTINGS */
.diet-settings {
  margin-bottom: 1em;
}
.diet-settings *{
  margin: 0 5px;
}

.ds-Timeframe {
  width: 35px;
}

/* DIET REPORT */

.diet-report{
  margin-top: 10px;
  border: 1px solid black;
}

.dr-item {
  padding: 10px 0;
}

.dr-item:nth-child(even) {
  background: #eee;
}

.drii-DVCompare-normal {
  color: green;
}
.drii-DVCompare-low-high {
  color: red;
}
.drii-DVCompare-slightly {
  color: orange
}

.drimi-row {
  margin: .2em 0 .2em 0
}

</style>
