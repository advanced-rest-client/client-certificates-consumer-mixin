/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
/**
 * A mixin to be used with elements that consumes lists of client certificates.
 * It implements event listeners related to certificates data change.
 *
 * The mixin does not offer models to work with as the storing implementation
 * may be different for different platforms.
 * Use `@advanced-rest-client/arc-models/client-certificate-model.js` as a
 * default store.
 * Also, see the model definition to learn about events API for certificates.
 *
 * @mixinFunction
 * @memberof ArcComponents
 * @param {Class} base
 * @return {Class}
 */
export const ClientCertificatesConsumerMixin = (base) => class extends base {
  static get properties() {
    return {
      /**
       * The list of certificates to render.
       * @type {Array<Object>}
       */
      items: { type: Array },
      /**
       * True when loading data from the datastore.
       */
      loading: { type: Boolean },
    };
  }
  /**
   * @return {Boolean} `true` if `items` is set and has cookies
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * A computed flag that determines that the query to the databastore
   * has been performed and empty result was returned.
   * This can be true only if not in search.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, loading } = this;
    return !loading && !hasItems;
  }

  constructor() {
    super();
    this._dbDestroyHandler = this._dbDestroyHandler.bind(this);
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._certDeleteHandler = this._certDeleteHandler.bind(this);
    this._certInsertHandler = this._certInsertHandler.bind(this);
  }

  connectedCallback() {
    /* istanbul ignore else */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('datastore-destroyed', this._dbDestroyHandler);
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('client-certificate-delete', this._certDeleteHandler);
    window.addEventListener('client-certificate-insert', this._certInsertHandler);
  }

  disconnectedCallback() {
    /* istanbul ignore else */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('datastore-destroyed', this._dbDestroyHandler);
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('client-certificate-delete', this._certDeleteHandler);
    window.removeEventListener('client-certificate-insert', this._certInsertHandler);
  }

  firstUpdated() {
    if (!this.items) {
      this.reset();
    }
  }

  _dbDestroyHandler(e) {
    const { datastore } = e.detail;
    if (datastore !== 'client-certificates') {
      return;
    }
    this.items = undefined;
  }

  /**
   * Handler for `data-imported` cutom event.
   * Refreshes data state.
   */
  _dataImportHandler() {
    this.reset();
  }

  _certDeleteHandler(e) {
    if (e.cancelable) {
      return;
    }
    const { id } = e.detail;
    const items = this.items || [];
    const index = items.findIndex((i) => i._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.items = [...items];
  }

  _certInsertHandler(e) {
    if (e.cancelable) {
      return;
    }
    const item = e.detail;
    const items = this.items || [];
    const index = items.findIndex((i) => i._id === item._id);
    if (index === -1) {
      items.push(item);
    } else {
      items[index] = item;
    }
    this.items = [...items];
  }
  /**
   * Resets current view and requeries for certificates.
   */
  reset() {
    this.loading = false;
    this.items = undefined;
    this.queryCertificates();
  }
  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  _handleException(message) {
    const e = new CustomEvent('send-analytics', {
     bubbles: true,
     composed: true,
     detail: {
       type: 'exception',
       description: message
     }
    });
    this.dispatchEvent(e);
  }

  /**
   * Queries application for list of cookies.
   * It dispatches `session-cookie-list-all` cuystom event.
   * @return {Promise} Resolved when cookies are available.
   */
  async queryCertificates() {
    this.loading = true;
    const e = new CustomEvent('client-certificate-list', {
      detail: {},
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.loading = false;
      this._handleException('Certificates store not redy.');
      return;
    }
    try {
      this.items = await e.detail.result;
    } catch (e) {
      this.items = undefined;
      this._handleException(e.message);
    }
    this.loading = false;
  }
  /**
   * Performs a delete action of a client certificate.
   *
   * @param {String} id An id of the certificate to delete
   * @return {Promise}
   */
  async _delete(id) {
    const e = new CustomEvent('client-certificate-delete', {
      detail: {
        id
      },
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._handleException('Certificates store not redy');
      return;
    }
    try {
      return await e.detail.result;
    } catch (e) {
      this._handleException(e.message);
    }
  }

  async _importCert(opts) {
    if (!opts.name) {
      opts.name = new Date().toGMTString();
    }
    const e = this.dispatchImportCert(opts);
    return await e.detail.result;
  }
  /**
   * Dispatches `client-certificate-insert` to import a certificate into the application.
   * @param {Object} value Certificate definition.
   * @return {CustomEvent} Dispatched event
   */
  dispatchImportCert(value) {
    const e = new CustomEvent('client-certificate-insert', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        value
      }
    });
    this.dispatchEvent(e);
    return e;
  }
}
export const CcConsumerMixin = ClientCertificatesConsumerMixin;
