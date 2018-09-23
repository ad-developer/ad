import ADFoundation from './node_modules/base/foundation';

const strings = {
  INSTANCE_KEY: 'ad-validator-item',
  START_WITH: 'ad-val',
  MESSAGE: 'ad-message',
  MESSAGE_SHOW: 'ad-message-show',
  BLUR_EVENT: 'blur',
  KEYUP_EVENT: 'keyup',
  CHANGE_EVENT: 'change',
  REQUIRED: 'ad-val-required',
  ERROR_CLASS: 'ad-error',
  LABEL: 'ad-label',
  CONTROL_GROUP: 'ad-control-group',
  GROUP: 'ad-group',
};

class ADControlValidatorFoundation extends ADFoundation {
  /** @return enum {strings} */
  static get strings() {
    return strings;
  }

  /** @return {!ADValidatorAdapter} */
  static get defaultAdapter() {
    return /** @type {!ADValidatorAdapter} */ ({
      isRequired: () => /* boolean */{},
      registerEvent: (/* type: string, handler: EventListener  */) => {},
      getAllAtributes: () => {},
      getMessage: () => /* string */ {},
      getRules: () => /* Object */ {},
      setNotValidIndicator: (/* string */) => {},
      removeNotValidIndicator: () => {},
      isChangeCheckboxType: () => /* boolean */{},
      getValue: () => /**/ {},
      getElement: () => /* Element */{},
      getLabel: () => /* string */{},
      isInGroup: () => /* boolean */ {},
    });
  }

  constructor(adapter) {
    super(Object.assign(ADControlValidatorFoundation.defaultAdapter, adapter));
    this.attributes_ = [];
    this.required_ = false;
    this.detail_ = {};
    this.label_ = 'Control';
    this.validateHandler_ = () => {
      const value = this.adapter_.getValue();
      this.isValid(value);
    };
  }

  init() {
    this.attributes_ = this.adapter_.getAllAtributes();
    this.isRequired_ = this.adapter_.isRequired();
    this.element_ = this.adapter_.getElement();
    if (this.adapter_.isChangeCheckboxType()) {
      // retgiter change event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.CHANGE_EVENT, this.validateHandler_);
    } else {
      // register keyup event
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.KEYUP_EVENT, this.validateHandler_);
      this.adapter_.registerEvent(ADControlValidatorFoundation.strings.BLUR_EVENT, this.validateHandler_);
    }
    const label = this.adapter_.getLabel();
    if (label && label.trim() != '') {
      this.label_ = label;
    }
  }

  isValid(value) {
    let valid = true;
    // First check if required
    if (this.isRequired_) {
      valid = this.validate_(ADControlValidatorFoundation.strings.REQUIRED, value);
    }
    if(!typeof(value) === "boolean"){
        value = value.trim() !== ''
    }
    // Check for the rest of validators
    if (valid && value) {
      for (let i = 0, attr; attr = this.attributes_[i]; i++) {
        valid = this.validate_(attr, value);
        if (!valid) {
          break;
        }
      }
    }
    if (!valid) {
      this.adapter_.setNotValidIndicator(this.detail_);
    } else {
      this.adapter_.removeNotValidIndicator();
    }
    return valid;
  }

  getDetail() {
    return this.detail_;
  }

  validate_(attr, value) {
    let valid = true;
    let {validated, detail} = this.resolveAttribute_(attr, value);
    this.detail_ = {};
    if (!validated) {
      // Second use for custom details
      validated = this.adapter_.getMessage();
      if (validated) {
        detail = validated;
      }
      this.detail_ = {
        label: this.label_,
        message: detail,
        isGroup: this.adapter_.isInGroup(),
      };
      valid = false;
    }
    return valid;
  }

  resolveAttribute_(attr, value) {
    const rules = this.adapter_.getRules();
    const rule = rules[attr];
    let validated = true;
    let detail = '';
    if (rule) {
      if (rule.hnd) {
        validated = rule.hnd(this.element_, this.attributes_, value);
      } else {
        validated = rule.pattern.exec(value);
      }
      detail = rule.detail;
    }
    return {validated, detail};
  }
}

export default ADControlValidatorFoundation;
