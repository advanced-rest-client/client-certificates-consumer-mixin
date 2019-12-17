// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

export {ClientCertificatesConsumerMixin};

declare type Constructor<T = {}> = new (...args: any[]) => T;
interface CcMixin {
  items: Array<Object>;
  loading: Boolean;
  readonly hasItems: Boolean;
  readonly dataUnavailable: Boolean;

  constructor(): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
  firstUpdated(): void;
  /**
   * Resets current view and requeries for certificates.
   */
  reset(): void;
  /**
   * Queries application for list of cookies.
   * It dispatches `session-cookie-list-all` cuystom event.
   * @return Resolved when cookies are available.
   */
  queryCertificates(): Promise<void>;
  /**
   * Dispatches `client-certificate-insert` to import a certificate into the application.
   * @param value Certificate definition.
   * @return Dispatched event
   */
  dispatchImportCert(value: Object): CustomEvent;
  _dbDestroyHandler(e: CustomEvent): void;
  _certDeleteHandler(e: CustomEvent): void;
  _certInsertHandler(e: CustomEvent): void;
  _dataImportHandler(): void;
  _handleException(message: String): void;
  /**
   * Performs a delete action of a client certificate.
   *
   * @param {String} id An id of the certificate to delete
   * @return
   */
  _delete(id: String): Promise<void>;
  _importCert(id: String): Promise<void>;
}

declare function ClientCertificatesConsumerMixin<TBase extends Constructor>(Base: TBase) : TBase & CcMixin;
declare function CcConsumerMixin<TBase extends Constructor>(Base: TBase) : TBase & CcMixin;
