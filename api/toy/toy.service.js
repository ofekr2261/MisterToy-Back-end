const { ObjectId } = require('mongodb')
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')

const PAGE_SIZE = 4

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

async function query(filterBy) {
  try {
    const criteria = setCriteria(filterBy)
    const { sortByVal, sortByChange } = filterBy
    const collection = await dbService.getCollection('toy')
    //                                                     name: 1
    let toys = await collection
      .find(criteria)
      .sort({ [sortByVal]: +sortByChange })
      .toArray()

    if (filterBy.pageIdx !== undefined) {
      const startIdx = filterBy.pageIdx * PAGE_SIZE
      toys = toys.slice(startIdx, PAGE_SIZE + startIdx)
    }
    return toys
  } catch (err) {
    logger.error('cannot find toys', err)
    throw err
  }
}

function setCriteria(filterBy) {
  const criteria = {}
  if (filterBy.name) {
    criteria.name = { $regex: filterBy.name, $options: 'i' }
  }
  if (filterBy.inStock === 'true') criteria.inStock = true
  if (filterBy.labels) {
    criteria.labels = filterBy.labels
  }

  //criteria={
  // name : { $regex: filterBy.name, $options: 'i' }, ab
  // inStock : true,
  // labels : filterBy.labels // doll
  // }

  ////  in case you can filter by few labels

  // if (filterBy?.labels?.length) {
  //   criteria.lables = { $all: filterBy.labels }
  // }

  return criteria
}

async function getById(toyId) {
  console.log(toyId)
  try {
    const collection = await dbService.getCollection('toy')
    const toy = collection.findOne({ _id: ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId(toyId) })
    return toyId
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      labels: toy.labels,
      inStock: toy.inStock,
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg, loggedinUser) {
  try {
    const msgToSave = {
      ...msg,
      by: {
        fullname: loggedinUser.fullname,
        _id: loggedinUser._id,
      },
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId(toyId) },
      { $push: { msgs: msgToSave } }
    )
    return msgToSave
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId(toyId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}
