import ADFoundation from './node_modules/base/foundation';

const strings = {
  INSTANCE_KEY: 'ad-validator-item',
  START_WITH: 'ad-v-',
  REQUIRED: 'ad-v-required',
  DATE: 'ad-v-date',
  ZIP: 'ad-v-zip',
  URL: 'ad-v-url',
  DETAIL: 'ad-detail',
  ID: 'ad-id',
  TITLE: 'ad-title',
  BLUR_EVENT: 'blur',
  CHANGE_EVENT: 'change',
  THIS_FIELD: 'This field'
};

const rules = {
  required: {
    hnd: (el, value) => {
      let res = false;
      if(value && value.trim() !==  '') {
        res = true;
      }
      return res;
    },
    detail: 'is required'
  },
  phone: {
    hnd: (el, value) => {
      const ptn = /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
    },
    detail: 'is not valid phone'
  },
  email: {
    hnd: (el, value) => {
      const ptn = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    },
    detail: 'is not valid email'
  },
  url: {
    hnd: (el, value) => {
      const ptn = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    },
    detail: 'is not valid URL'
  },
  zip: {
    hnd: (el, value) => {
     const ptn = /^\d{5}(-\d{4})?$/;
   },
   detail: 'is not valid ZIP code'
 },
 decimal: {
    hnd: (el, value) => {
     const ptn = ^[0-9]+(\.[0-9][0-9]?)?;
    },
    detail: 'is not valid decimal number'
  },
  number: {
    hnd: (el, value) => {
      const ptn = ^[0-9]*$;
    },
    detail: 'is not valid number'
  }
};

class ADControlValidatorFoundation extends ADFoundation {
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
      isRequired: () => /* boolean */{},
      registerEvent: (/* type: string, handler: EventListener  */) => {},
      getAllAtributes: () => {},
      getCustomDetail: () => /* string */ {},
      getTitle: () => /* string */{}
    });
  }

  static addRule(ruleName, rule) {
    rules[ruleName] = rule;
  }

  static getRules() {
    return rules;
  }

  constructor(adapter) {
    super(Object.assign(ADControlValidatorFoundation.defaultAdapter, adapter));
    this.attributes_ = [];
    this.detail_ = '';
    this.changeHanler_ = ({detail}) => {
      const {value} = detail;
      this.isValid(value);
    };
    this.blurHandler_ = ({detail}) => {
      const {value} = detail;
      this.isValid(value);
    }
  }

  init() {
    this.attributes_ = this.adapter_.getAllAtributes();
    if(this.adapter_.changeType()){
      // retgiter change event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.CHANGE_EVENT, this.changeHanler_);
    } else {
      // register blur event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.BLUR_EVENT, this.blurHandler_);
    }
  }

  isValid(value) {
    let valid = true;
    for (let i = 0, attr; attr = this.attributes_[i]; i++) {
      let { validated, detail } = this.resolveAttribute_(attr ,value);
      if(!validated) {
        // Second use for custom details
        validated = this.adapter_.getCustomDetail();
        if(validated){
          detail = validated;
        } else {
            this.detail_ = `${this.adapter_.getTitle()} ${detail}`;
        }
        valid = false;
        break;
      }
    }
    return valid;
  }

  resolveAttribute_(attr, value) {
    let rule = ADValidatorFoundation.getRules()[attr];
    if(rule) {
      return rule.hnd(this.root_, value);
    }
  }

  getDetail() {
    return this.detail_;
  }
}

export default ADValidatorFoundation;
