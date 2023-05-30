const logger = require('../../services/logger.service')
const toyService = require('../toy/toy.service')
const authService = require('../auth/auth.service')
const reviewService = require('./review.service')

async function getReviews(req, res) {
  try {
    const reviews = await reviewService.query(req.query)
    res.send(reviews)
  } catch (err) {
    logger.error('Cannot get reviews', err)
    res.status(500).send({ err: 'Failed to get reviews' })
  }
}

async function deleteReview(req, res) {
  try {
    const deletedCount = await reviewService.remove(req.params.id)
    if (deletedCount === 1) {
      res.send({ msg: 'Deleted successfully' })
    } else {
      res.status(400).send({ err: 'Cannot remove review' })
    }
  } catch (err) {
    logger.error('Failed to delete review', err)
    res.status(500).send({ err: 'Failed to delete review' })
  }
}

async function addReview(req, res) {
  var { loggedinUser } = req

  try {
    var review = req.body
    review.byUserId = loggedinUser._id
    review = await reviewService.add(review)

    // prepare the updated review for sending out
    review.aboutToy = await toyService.getById(review.aboutToyId)
    review.byUser = loggedinUser

    const loginToken = authService.getLoginToken(loggedinUser)
    res.cookie('loginToken', loginToken)

    delete review.aboutToyId
    delete review.byUserId

    res.send(review)
  } catch (err) {
    logger.error('Failed to add review', err)
    res.status(500).send({ err: 'Failed to add review' })
  }
}

module.exports = {
  getReviews,
  deleteReview,
  addReview,
}
