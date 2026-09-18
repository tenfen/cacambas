import API from "helpers/API";

const PaymentController = {
  createCheckout: (userId) => {
    return API.request(
      "/payment/create-checkout",
      { userId },
      "POST"
    );
  },

  getPaymentStatus: (userId) => {
    return API.request(
      `/payment/status/${userId}`,
      {},
      "GET"
    );
  },

  getRevenueSummary: () => {
    return API.request(
      "/payment/revenue",
      {},
      "GET"
    );
  },
};

export default PaymentController;