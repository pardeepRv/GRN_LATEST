#  InoappsPogrnReactNative
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

* Standard compliant React Native App Utilizing [Ignite](https://github.com/infinitered/ignite)

## :arrow_up: How to Setup

**Step 1:** git clone this repo:

**Step 2:** cd to the cloned repo:

**Step 3:** Install the Application with `yarn` or `npm i`


## :arrow_forward: How to Run App

1. cd to the repo
2. Run Build for either OS
  * for iOS
    * run `react-native run-ios`
  * for Android
    * Run Genymotion
    * run `react-native run-android`

## :no_entry_sign: Standard Compliant

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
This project adheres to Standard.  Our CI enforces this, so we suggest you enable linting to keep your project compliant during development.

**To Lint on Commit**

This is implemented using [husky](https://github.com/typicode/husky). There is no additional setup needed.

**Bypass Lint**

If you have to bypass lint for a special commit that you will come back and clean (pushing something to a branch etc.) then you can bypass git hooks with adding `--no-verify` to your commit command.

**Understanding Linting Errors**

The linting rules are from JS Standard and React-Standard.  [Regular JS errors can be found with descriptions here](http://eslint.org/docs/rules/), while [React errors and descriptions can be found here](https://github.com/yannickcr/eslint-plugin-react).

## :closed_lock_with_key: Secrets

This project uses [react-native-config](https://github.com/luggit/react-native-config) to expose config variables to your javascript code in React Native. You can store API keys
and other sensitive information in a `.env` file:

```
API_URL=https://myapi.com
GOOGLE_MAPS_API_KEY=abcdefgh
```

and access them from React Native like so:

```
import Secrets from 'react-native-config'

Secrets.API_URL  // 'https://myapi.com'
Secrets.GOOGLE_MAPS_API_KEY  // 'abcdefgh'
```

The `.env` file is ignored by git keeping those secrets out of your repo.

### Get started:
1. Copy .env.example to .env
2. Add your config variables
3. Follow instructions at [https://github.com/luggit/react-native-config#setup](https://github.com/luggit/react-native-config#setup)
4. Done!


-----------------------------------------

# Following points are done By RV Technologies.


Mobile App Login Credentials for RVT Are Pre-populated 
Update Warning Message & Remove Orange PO Line Highlighting When Receipt Submitted With No Connection   
Photo functionality - Images are received with Incorrect Mime Type .
BUG - Add Photo Option Doesn't Allow A User to Take Photo, Only Choose Photo  
BUG - Able to Submit Receipts When No Lines Are Selected   
Login – Require Detail of Current Logic   
BUG - App Not Holding Quantities with Decimal Places Correctly When Moving Between PO Lines 
Purchase Order Receipt - Description Line Not Dynamic for Long Descriptions   
BUG - Receive Entire PO – App Appears to Send a Payload & Confirmation Message For Number of Lines on PO  
PO Header - Update Delivery Date field Label & Content  
PO Receipt Page – Item No. Missing   
Item No Displaying Incorrectly on Receipt Page 
Change Receipt & Reject Receipt - Time Taken to Release a Receipt to Allow Another Change or Reject to be Made 
Purchase Order Receipt - Time Taken to Release a PO to Allow Another Receipt to be Made 
Add ICC Environment URL 
Orders Page - Page No Longer Displays Purchase Orders by Order No. 
Receipts Page - Page No Longer Displays Receipts by Order No. 
Receipt - BUG - Data Not Held On Completed Receipt When Submitting From PO Header Page  
Change Receipt - Logic For Quantity Figure Passed Incorrect   
Purchase Order Header Page - BUG - Rendering Lines Not Relating To That PO 
PO Receipt - BUG - Open Quantity - Appears to be Working Back-to-Front 
Purchase Order Header Page - Are There Any Filters on Which Purchase Order Lines are Displayed?   
Inoapps Construction Cloud Environment URLs  
Settings Page - Refresh Data Button  
Comments on Receipts - Confirm Character Limit in Place, If Any  
Reject Receipt - Add Photo Functionality Not Working Correctly in App 
Login Page - Help Text on Fields - Make a Darker Grey to Make Them Clearer to Read for the User 
App Menu - Hide As Only One Option Available & Not Required to Access Functionality of App 
App Home Page - Hide As No Data or Functionality Associated With It At Present 
Correct Display of Error Popup When User Tries to Submit Again From the PO Header Page  
Logging Out - Sometimes if a User Logs Out of the App & Tries to Log Back In They can be Met With An Error  
If User Leaves PO Header Page Whilst Receipting, Completed Lines will be Locked & Cannot Be Changed Before Submitting   
Logging In With Different User - Orders Page Will Load with Previous Users Data 
Receipts Page - Page Can Be Unstable and Cause The App to Crash   
Update Settings Page 
Reject Receipt - Allow A User to Add a Comment  
Initial Login - User Has to Press Refresh Data in Settings to Get Data  
Login - Environment Field Issues 
 