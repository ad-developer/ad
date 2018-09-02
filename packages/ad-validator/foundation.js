import ADFoundation from './node_modules/base/foundation';


const cssClasses = {

};

const strings = {
  INSTANCE_KEY: 'ad-validator',
  VALIDATE: 'ad-validate',
};

const numbers = {

};

class ADValidatorFoundation extends ADFoundation {
  /** @return enum {cssClasses} */
  static get cssClasses() {
    return cssClasses;
  }

  /** @return enum {strings} */
  static get strings() {
    return strings;
  }

  /** @return enum {numbers} */
  static get numbers() {
    return numbers;
  }

  /** @return {!ADValidatorAdapter} */
  static get defaultAdapter() {
    return /** @type {!ADValidatorAdapter} */ ({
      isRootForm: () => /* boolean */ {},
      disableDefaultValidation: () => {},
      registerValidators: () => {},
      isValid: () => /* boolean */ {},
      getDetails: () => {},
      // Adaptor body
    });
  }

  constructor(adapter) {
    super(Object.assign(ADValidatorAdapter.defaultAdapter, adapter));
  }

  init() {
    // Disable the default client validation
    if (this.adapter_.isRootForm()) {
      this.adapter_.disableDefaultValidation();
    }
    this.adapter_.registerValidators();
  }

  isValid() {
    return this.adapter_.isValid();
  }

  getDetails() {
    return adapter_.getDetails();
  }
};

export default ADValidatorFoundation;
