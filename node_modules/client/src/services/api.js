import tracklyApi from './trackly/tracklyApi.js';
import averoApi from './avero/averoApi.js';

export * from './trackly/tracklyApi.js';
export * from './avero/averoApi.js';

export { tracklyApi, averoApi };

export default {
  ...tracklyApi,
  ...averoApi,
  trackly: tracklyApi,
  avero: averoApi,
};
