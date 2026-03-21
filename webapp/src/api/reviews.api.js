import api from './index'

export const reviewsApi = {
  getForTarget: (targetType, targetId) =>
    api.get(`/reviews/${targetType}/${targetId}`),

  // Accepts the current call shape from ReviewForm: { targetType, targetId, ...reviewData }
  create: ({ targetType, targetId, ...reviewData }) =>
    api.post(`/reviews/${targetType}/${targetId}`, reviewData),

  // Keep this wrapper flexible for future usage without changing UI/component logic.
  delete: ({ targetType, targetId, reviewId }) =>
    api.delete(`/reviews/${targetType}/${targetId}/${reviewId}`),
}