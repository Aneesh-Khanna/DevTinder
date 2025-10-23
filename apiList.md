# DevTinder APIs

## authRouter
- POST /signup   - Saves data from signup into DB
- POST /login    - Logs in the user
- POST /logout   - Logs out the user

## profileRouter
- GET /profile/view   - Gets details of the user profile for viewing
- PATCH /profile/edit   - Allows user to edit profile details(about,skills and other fields)
- PATCH /profile/password  - Allows user to edit password(Forget Password API)

## connectionRequestRouter
- POST /request/send/:status/:userId - Allows user to send request to other user(ignore or interest)
- POST /request/review/:status/:requestId  - Allows a user to accept/reject a request

## userRouter
- GET /user/requests/received - fetches all pending incoming requests
- GET /user/connections - fetches all the accepted connections of a user
- GET /user/feed - Gets you the profiles of other users on platform


Status: ignored, interested, accepted, rejected