# shopify Application
 Summer 2021 - Shopify Developer Intern Challenge Question

This is a REST API for an image repository. The files are saved on Amazon's S3 service which the user records are stored on Mongo Atlas service. The application is hosted on heroku. 

The app's features include:
* user signUp and Login
* Token based authentication for protected routes
* single and bulk uploads of files. Files size is restricted to 2MB with a maximum of 20 files per request. 
* single and bulk deleting of files. 

Notable Dependencies:
* JWT for token based authentications.
* Helmet for security for setting certain headers
* bcrypt for password encryption
* uuid to generate random unique identifiers
* AWS-SDK for S# bucket service
* Node-Input-Validator to validate client requests. 

Request Url: https://young-reaches-59390.herokuapp.com

API Documentation: https://documenter.getpostman.com/view/9973912/TVzVhvvW#3bf95ecb-aeba-4592-a5b0-f65ff4597637
