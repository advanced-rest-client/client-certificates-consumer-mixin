import { LitElement } from 'lit-element';
import { ClientCertificatesConsumerMixin } from '../client-certificates-consumer-mixin.js';
/**
 * @customElement
 * @demo demo/index.html
 * @appliesMixin RequestsListMixin
 * @appliesMixin SavedListMixin
 */
class TestElementSaved extends ClientCertificatesConsumerMixin(LitElement) {}
window.customElements.define('test-element', TestElementSaved);
