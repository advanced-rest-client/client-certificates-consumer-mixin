[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/client-certificates-consumer-mixin.svg)](https://www.npmjs.com/package/@advanced-rest-client/client-certificates-consumer-mixin)

[![Build Status](https://travis-ci.org/advanced-rest-client/client-certificates-consumer-mixin.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/client-certificates-consumer-mixin)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/client-certificates-consumer-mixin)

# client-certificates-consumer-mixin

A common function for element that handles lists of client certificates. Primarily made for Advanced REST Client.

The mixin does not offer models to work with as the storing implementation may be different for different platforms.
Use `@advanced-rest-client/arc-models/client-certificate-model.js` as a default store.

See the model definition to learn about events API for certificates to implement own store.
Required events are:
-   client-certificate-insert
-   client-certificate-list
-   client-certificate-delete

Other elements may require additional event:
-   client-certificate-get

## Usage

### Installation
```
npm install --save @advanced-rest-client/client-certificates-consumer-mixin
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import { ClientCertificatesConsumerMixin } from '@advanced-rest-client/client-certificates-consumer-mixin/client-certificates-consumer-mixin.js';

class SampleElement extends ClientCertificatesConsumerMixin(LitElement) {
  render() {
    return html`
      ${(this.items || []).map((item) => html`...`)};
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

The element queries certificates storage for the list of certificates when initialized.
After that you need to call `refresh()` function manually.

## Development

```sh
git clone https://github.com/advanced-rest-client/client-certificates-consumer-mixin
cd client-certificates-consumer-mixin
npm install
```

### Running the tests

```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
