import ADFoundation from './node_modules/base/foundation';

const strings = {
  INSTANCE_KEY: 'ad-validator-item',
  START_WITH: 'ad-v-',
  REQUIRED: 'ad-val-required',
  DATE: 'ad-v-date',
  ZIP: 'ad-v-zip',
  URL: 'ad-v-url',
  DETAIL: 'ad-detail',
  ID: 'ad-id',
  TITLE: 'ad-title',
  BLUR_EVENT: 'blur',
  CHANGE_EVENT: 'change',
  THIS_FIELD: 'This field',
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
      getTitle: () => /* string */ {},
      getRules: () => /* Object */ {},
    });
  }

  // static addRule(ruleName, rule) {
  //  rules[ruleName] = rule;
  // }

  static getRules() {
    return this.adapter_.getRules();
  }

  constructor(adapter) {
    super(Object.assign(ADControlValidatorFoundation.defaultAdapter, adapter));
    this.attributes_ = [];
    this.required_ = false;
    this.detail_ = '';
    this.changeHanler_ = ({detail}) => {
      const {value} = detail;
      this.isValid(value);
    };
    this.blurHandler_ = ({detail}) => {
      const {value} = detail;
      this.isValid(value);
    };
  }

  init() {
    this.attributes_ = this.adapter_.getAllAtributes();
    this.required_ = this.adapter_.isRequired();
    if (this.adapter_.changeType()) {
      // retgiter change event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.CHANGE_EVENT, this.changeHanler_);
    } else {
      // register blur event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.BLUR_EVENT, this.blurHandler_);
    }
  }

  isValid(value) {
    let valid = true;
    // First check if required
    if (this.isRequired_) {
      valid = this.validate_(ADControlValidatorFoundation.strings.REQUIRED, value);
    } else {
      for (let i = 0, attr; attr = this.attributes_[i]; i++) {
        valid = this.validate_(attr, value);
        if (!valid) {
          break;
        }
      }
    }
    return valid;
  }

  validate_(attr, value) {
    const valid = true;
    const {validated, detail} = this.resolveAttribute_(attr, value);
    if (!validated) {
      // Second use for custom details
      validated = this.adapter_.getCustomDetail();
      if (validated) {
        detail = validated;
      } else {
        this.detail_ = `${this.adapter_.getTitle()} ${detail}`;
      }
      valid = false;
    }
    return valid;
  }

  resolveAttribute_(attr, value) {
    const rules = this.getRules();
    const rule = rules[attr];
    let result = true;
    if (rule) {
      if (rule.hnd) {
        result = rule.hnd(this.root_, this.attributes_, value);
      } else {
        result = rule.pattern.exec(value);
      }
    }
    return result;
  }

  getDetail() {
    return this.detail_;
  }
}

export default ADControlValidatorFoundation;
