import ADFoundation from './node_modules/base/foundation';


const cssClasses = {

};

const strings = {
  INSTANCE_KEY: 'ad-validator',
  VALIDATE: 'ad-val',
};

const numbers = {

};

const rules = {
  'ad-val-required': {
    hnd: (el, attrs, value) => {
      let res = false;
      if (value && value.trim() !== '') {
        res = true;
      }
      return res;
    },
    detail: 'is required',
  },
  'ad-val-phone': {
    pattern: /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    detail: 'is not valid phone',
  },
  'ad-val-email': {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    detail: 'is not valid email',
  },
  'ad-val-url': {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
    detail: 'is not valid URL',
  },
  'ad-val-zip': {
    pattern: /^\d{5}(-\d{4})?$/,
    detail: 'is not valid ZIP code',
  },
  'ad-val-decimal': {
    pattern: /^[0-9]+(\.[0-9][0-9]?)?$/,
    detail: 'is not valid decimal number',
  },
  'ad-val-number': {
    pattern: /^[0-9]*$/,
    detail: 'is not valid number',
  },
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

  static get rules() {
    return rules;
  }

  static addRule(rule, name) {
    rules[name] = rule;
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
