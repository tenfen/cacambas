import API from "helpers/API"

const BucketController = {
  createBucket: (bucket) => {
    return API.request("/bucket", bucket, "POST")
  },

  updateBucket: (bucketId, content) => {
    return API.request(`/bucket/${bucketId}`, content, "PUT")
  },

  deleteBucket: (bucketId) => {
    return API.request(`/bucket/delete/${bucketId}`, null, "DELETE")
  },

  getOneBucket: (bucketId) => {
    return API.request(`/bucket/one/${bucketId}`)
  },

  getAllBuckets: (filter) => {
    return API.request("/bucket/all", filter)
  },
}

export default BucketController
