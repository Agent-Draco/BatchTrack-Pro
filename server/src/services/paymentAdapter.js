class PaymentProvider {
  async processPayment(amount, method, metadata) { throw new Error('Not implemented'); }
  async processRefund(originalRef, amount, metadata) { throw new Error('Not implemented'); }
}

class ManualProvider extends PaymentProvider {
  async processPayment(amount, method, metadata) {
    return {
      status: 'COMPLETED',
      reference: `MANUAL-${Date.now().toString(36).toUpperCase()}`,
      provider: 'manual',
    };
  }
  async processRefund(originalRef, amount, metadata) {
    return {
      status: 'COMPLETED',
      reference: `REFUND-${Date.now().toString(36).toUpperCase()}`,
      provider: 'manual',
    };
  }
}

const providers = { manual: new ManualProvider() };

function getProvider(providerKey = 'manual') {
  return providers[providerKey] || providers.manual;
}

module.exports = { PaymentProvider, ManualProvider, getProvider };
