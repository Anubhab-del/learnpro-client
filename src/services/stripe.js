export const redirectToStripeCheckout = (sessionUrl) => {
  if (!sessionUrl) {
    return { error: { message: 'No payment URL returned from server.' } }
  }
  window.location.href = sessionUrl
  return { error: null }
}