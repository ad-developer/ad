import ADFoundation from './node_modules/base/foundation';

const cssClasses = {};

const strings = {
  INSTANCE_KEY: 'ad-validator',
  VALIDATE: 'ad-val',
  MATCH: 'ad-val-match',
  ID: 'ad-id',
  GROUP: 'ad-group',

};

const rules = {
  'ad-val-required': {
    hnd: (el, attrs, value) => {
      let res = false;
      if (el.type && (el.type === 'checkbox' || el.type === 'radio')) {
        if (value) {
          res = true;
        } else {
          const group = el.getAttribute(ADValidatorFoundation.strings.GROUP);
          const grEls = document
            .querySelectorAll(`[${ADValidatorFoundation.strings.GROUP}=${group}]`);
          for (let i = 0, gEl; gEl = grEls[i]; i++) {
            if (gEl.checked === true) {
              res = true;
            }
          }
        }
      } else if (value.trim() !== '') {
        res = true;
      }
      return res;
    },
    detail: 'Required',
  },
  'ad-val-phone': {
    pattern: /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    detail: 'Phone number is not valid',
  },
  'ad-val-email': {
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    detail: 'Email is not valid',
  },
  'ad-val-url': {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
    detail: 'URL is not valid',
  },
  'ad-val-zip': {
    pattern: /^\d{5}(-\d{4})?$/,
    detail: 'ZIP code is not valid',
  },
  'ad-val-decimal': {
    pattern: /^[0-9]+(\.[0-9][0-9]?)?$/,
    detail: 'Decimal number is not valid',
  },
  'ad-val-number': {
    pattern: /^[0-9]*$/,
    detail: 'Number is not valid',
  },
  'ad-val-match': {
    hnd: (el, attrs, value) => {
      let res = false;
      const id = el.getAttribute(ADValidatorFoundation.strings.MATCH);
      const mEl = document.querySelector(`[${ADValidatorFoundation.strings.ID}=${id}]`);
      if (mEl) {
        const mValue = mEl.value.trim();
        value = value.trim();

        if (value && (value === '' || value === mValue)) {
          res =true;
        }
      }
      return res;
    },
    detail: 'Does not match',
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
    });
  }

  constructor(adapter) {
    super(Object.assign(ADValidatorFoundation.defaultAdapter, adapter));
  }

  init() {}

  isValid() {
    return this.adapter_.isValid();
  }

  getDetails() {
    return this.adapter_.getDetails();
  }
};

export default ADValidatorFoundation;
