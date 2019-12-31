import { fixture, assert, html } from '@open-wc/testing';
import * as sinon from 'sinon';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import './test-element.js';

describe('RequestsListMixin', function() {
  async function basicFixture() {
    return await fixture(`<test-element></test-element>`);
  }

  async function noAutoFixture() {
    return await fixture(`<test-element noAutoQueryCertificates></test-element>`);
  }

  async function queryDataFixture() {
    const elmRequest = fixture(html`<div>
      <client-certificate-model></client-certificate-model>
      <test-element></test-element>
    </div>`);
    return new Promise((resolve) => {
      window.addEventListener('client-certificate-list', function f(e) {
        window.removeEventListener('client-certificate-list', f);
        const { detail } = e;
        setTimeout(() => {
          detail.result
          .then(() => elmRequest)
          .then((node) => {
            resolve(node.querySelector('test-element'));
          });
        });
      });
    });
  }

  async function untilAfterQuery(element, result) {
    return new Promise((resolve) => {
      element.addEventListener('client-certificate-list', function f(e) {
        element.removeEventListener('client-certificate-list', f);
        e.preventDefault();
        e.detail.result = Promise.resolve(result || []);
        setTimeout(() => resolve());
      });
      element.reset();
    });
  }

  describe('#hasItems', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await untilAfterQuery(element);
    });

    it('is false when no items', () => {
      assert.isFalse(element.hasItems);
    });

    it('is true when has items', () => {
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
      assert.isTrue(element.hasItems);
    });
  });

  describe('#dataUnavailable', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await untilAfterQuery(element);
    });

    it('is true when no items and not loading', () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('is false when no items and loading', () => {
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
      element.loading = true;
      assert.isFalse(element.dataUnavailable);
    });

    it('is false when has items', () => {
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
      assert.isFalse(element.dataUnavailable);
    });
  });

  describe('datastore-destroyed event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
    });

    it('resets items', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'client-certificates'
        }
      }));
      assert.isUndefined(element.items);
    });

    it('ignores other data stores', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'saved-requests'
        }
      }));
      assert.lengthOf(element.items, 5);
    });
  });

  describe('data-imported event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls reset()', () => {
      const spy = sinon.spy(element, 'reset');
      document.body.dispatchEvent(new CustomEvent('data-imported', {
        bubbles: true
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('client-certificate-delete event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      await untilAfterQuery(element, items);
    });

    function fire(id, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-delete', {
        cancelable,
        bubbles: true,
        detail: {
          id
        }
      });
      document.body.dispatchEvent(e);
    }

    it('removes existing item', () => {
      const item = element.items[0];
      fire(item._id);
      assert.lengthOf(element.items, 4);
    });

    it('ignores cancelable event', () => {
      const item = element.items[0];
      fire(item._id, true);
      assert.lengthOf(element.items, 5);
    });

    it('ignores when not on the list', () => {
      fire('some-id', true);
      assert.lengthOf(element.items, 5);
    });
  });

  describe('client-certificate-insert event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      items.forEach((item, index) => item._id = index + '_');
      await untilAfterQuery(element, items);
    });

    function fire(detail, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-insert', {
        cancelable,
        bubbles: true,
        detail
      });
      document.body.dispatchEvent(e);
    }

    it('updates existing item', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item);
      assert.equal(element.items[0].name, 'test');
    });

    it('ignores cancelable event', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item, true);
      assert.notEqual(element.items[0].name, 'test');
    });

    it('Adds new item to the list', () => {
      const item = DataGenerator.generateClientCertificate();
      item._id = '6_';
      fire(item);
      assert.lengthOf(element.items, 6);
    });
  });

  describe('Data list', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has items set', () => {
      assert.lengthOf(element.items, 15);
    });

    it('returns true for hasItems', () => {
      assert.isTrue(element.hasItems);
    });

    it('returns false for dataUnavailable', () => {
      assert.isFalse(element.dataUnavailable);
    });
  });

  describe('Deleting a certificate', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('removes certificate from the list', async () => {
      const id = element.items[0]._id;
      await element._delete(id);
      assert.lengthOf(element.items, 14);
    });

    it('dispatches client-certificate-delete event', async () => {
      const spy = sinon.spy();
      element.addEventListener('client-certificate-delete', spy);
      const id = element.items[0]._id;
      await element._delete(id);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.id, id);
    });

    it('handles errors', async () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      await element._delete('non-existing');
      assert.isTrue(spy.called);
    });
  });

  describe('Importing a certificate', () => {
    let element;
    let cert;
    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    beforeEach(async () => {
      element = await queryDataFixture();
      cert = {
        cert: {
          data: 'test'
        },
        type: 'pem'
      };
    });

    it('dispatches client-certificate-insert event', async () => {
      const spy = sinon.spy();
      element.addEventListener('client-certificate-insert', spy);
      await element._importCert(cert);
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0].detail.value, 'object');
    });

    it('adds default name', async () => {
      const spy = sinon.spy();
      element.addEventListener('client-certificate-insert', spy);
      await element._importCert(cert);
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0].detail.value.name, 'string');
    });

    it('respects existing name', async () => {
      cert.name = 'test';
      const spy = sinon.spy();
      element.addEventListener('client-certificate-insert', spy);
      await element._importCert(cert);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.value.name, 'test');
    });

    it('adds certificate to the list', async () => {
      const id = await element._importCert(cert);
      const item = element.items.find((i) => i._id === id);
      assert.typeOf(item, 'object');
    });
  });

  describe('#noAutoQueryCertificates', () => {
    it('does not query for certificates', async () => {
      const spy = sinon.spy();
      window.addEventListener('client-certificate-list', spy);
      await noAutoFixture();
      assert.isFalse(spy.called);
    });
  });
});
