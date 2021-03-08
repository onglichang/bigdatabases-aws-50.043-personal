const reviewsRouter = require('express').Router();
const Review = require('../model/review');
const sequelize = require('../utils/config').sequelize
const User = require('../model/reviewer');
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
require('../model/associations');


const serverErrorReponse = {
  statusCode: 400,
  body: JSON.stringify({
    message: 'Server not responding',
  }),
};

reviewsRouter.get('/', async (req, res) => {
// TODO: Parse the filters into the sql query statement
    // Something like first 10, then the next time the same user requests, we need to send the next 10
    const oneReview = await Review.findOne({
      where:{
        asin: "B000FA64PA"
      }
    })

})

// RETRIEVE SPECIFIC REVIEW
reviewsRouter.get('/:reviewID', async (req, res) => {
  // Should throw validation error if not int

  // Conduct SELECT sql query to retrieve the review based on reviewID
  // const oneReview = await Review.findOne({
  //   where:{
  //     id: req.params.reviewID
  //   }
  // })
  const oneReview = await Review.findOne({
    where:{
      id: req.params.reviewID
    },
    include: {
      model: User,
      attributes: ['reviewerName']
    }
  })
  res.send(oneReview)

})

// RETRIEVE REVIEWS BASED ON BOOKID
reviewsRouter.post('/filterBook/:bookID', async (req, res) => {
  // Frontend is to let us know which reviews we are to send. This populates the start and amount fields in the reqeuest body

    // Raw query constructed for sequelize query
    // var sqlQuery = 'SELECT * FROM kindle_Review_Data WHERE asin = "'+req.params.bookID+'" LIMIT '+req.body.start+','+req.body.amount

    // //  Conduct SELECT sql query to retrieve all reviews for specific
    // const allBookReviews = await sequelize.query(sqlQuery)

    const allBookReviews = await Review.findAll({
      where: {
        asin: req.params.bookID
      },
      offset: req.body.start,
      limit: req.body.amount,
      include: {
        model: User,
        attributes: ['reviewerName']
      }
    })

    // res.send(allBookReviews[0])
    res.send(allBookReviews)

  })

// curl -d "asin=B0324714&helpful=[0,0]&overall=3&reviewText=NotThatBadIGuess&reviewTime=201012&reviewerID=J05EJ011N50N&unixReviewTime=1234567890&reviewerName=JoseJohnson" -X POST http://localhost:5000/review/addReview
// id = 982620
// ADD A NEW REVIEW
reviewsRouter.post('/addReview', async (req, res) => {
    // Generate UID for new review.
      // UID is auto generated by Sequelize
    // Conduct the INSERT sql query to add review to database
    // TODO: Hi Jose, added authentication here :) Can have a look at react 'services' to see how it intergrates

    const {asin, overall, reviewText, reviewTime, unixReviewTime } = req.body
    const decodedToken = jwt.verify(req.token, config.ACCESS_KEY);
    const reviewerID = decodedToken.reviewerID

    if (!decodedToken || !reviewerID) {
        return res.status(401).json({ error: 'token missing or invalid' });
    }

    const addReview = await Review.create({asin, overall, reviewText, reviewTime, reviewerID, unixReviewTime })
    res.send(addReview)

  })

// DELETE REIVEW BASED ON REIVEWID
//curl -X DELETE http://localhost:5000/review/deleteReview/982621
reviewsRouter.delete('/deleteReview/:reviewID', async (req, res) => {
    // Delete review based on reviewID in the URL parameters
    // console.log("Delete review")
    const deleteReview = await Review.destroy({
      where:{
        id: req.params.reviewID
      }
    })

    if (deleteReview>0){
      res.send('Deleted '+ deleteReview + ' reviews successfully')
    }else{
      res.send('Deleted ' + deleteReview + ' reviews. No deletion made')
    }

  })

// UPDATE A SPECIFIC REVIEW
//curl -d "overall=5&reviewText=OkayLaIChangethetext" -X POST http://localhost:5000/review/updateReview/982623
reviewsRouter.post('/updateReview/:reviewID', async(req, res) => {

    // console.log("Update review")
    const {overall, reviewText} = req.body

    const updateReview = await Review.update({overall,reviewText},
      {
        where:{
          id: req.params.reviewID
      }
    })

    if (updateReview[0]){
      res.send('Updated '+ updateReview[0] + ' reviews successfully')
    }else{
      res.send('Updated ' + updateReview[0] + ' reviews. No updates made')
    }

  })

// RETRIEVE REVIEWS BASED ON PROVIDED FILTERS
reviewsRouter.get('/test', (req, res) => {
    // TODO: figure out how to use query params to get the necessary filters
    // TODO: Parse the filters into the sql query statement
    // TODO: Decide what is the limit that we will send to frontend each time
    // TODO: How to keep track of the reviews that we have sent and the ones to send
        // Something like first 10, then the next time the same user requests, we need to send the next 10
    res.send('Hello World!')
  })


module.exports = reviewsRouter;