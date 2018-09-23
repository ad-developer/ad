import ADComponent from './node_modules/base/component';

import ADValidatorFoundation from './foundation';
import ADControlValidator from './node_modules/control-validator';
 
class ADValidator extends ADComponent {
  /**
   * @param {!Element} root
   * @return {!ADControlValidator}
   */
  static attachTo(root) {
    const instance = new ADValidator(root);
    // Attach instance to the root
    root.ad = root.ad || {};
    root.ad[ADValidatorFoundation.strings.INSTANCE_KEY] = instance;
    return instance;
  }

  /**
   * @param {!Element} root
   * @return {!ADControlValidator}
   */
  static getInstance(root) {
    return root.ad && root.ad[ADValidatorFoundation.strings.INSTANCE_KEY]
      ? root.ad[ADValidatorFoundation.strings.INSTANCE_KEY] : null;
  }

  initialize(valItemFactory = (root, rules) => new ADControlValidator(root, undefined, rules)) {
    // Disable defautl validation if root is a form tag...
    if (this.root_.tagName === 'FORM') {
      this.root_.setAttribute('novalidate', '');
    }
    this.controls_ = [];
    const controls = this.root_.querySelectorAll(`[${ADValidatorFoundation.strings.VALIDATE}]`);
    for (let i = 0, root; root = controls[i]; i++) {
      const control = valItemFactory(root, ADValidatorFoundation.rules);
      this.controls_.push(control);
    }
  }

  getDefaultFoundation() {
    return new ADValidatorFoundation({
      isValid: () => {
        let valid = true;
        for (let i = 0, control; control = this.controls_[i]; i++) {
          if (!control.isValid()) {
            valid = false;
          }
        }
        return valid;
      },
      getDetails: () => {
        const details = [];
        for (let i = 0, control, detail; control = this.controls_[i]; i++) {
          if(control)
          detail = control.getDetail();
          if (detail.message) {
            // Check if elemet is a part of the group and the
            // message has already been added to the details list
            if(detail.isGroup && !this.isInDerailsList_(details, detail)
              || !detail.isGroup) {
              details.push(detail);
            }
          }
        }
        return details;
      },
    });
  }

  /**
   * isValid - description
   *
   * @return {type}  description
   */
  isValid() {
    return this.foundation_.isValid();
  }

  /**
   * getDetails - description
   *
   * @return {type}  description
   */
  getDetails() {
    return this.foundation_.getDetails();
  }

  /**
   * isInDerailsList_ - description
   *
   * @param  {type} list   description
   * @param  {type} detail description
   * @return {type}        description
   */
  isInDerailsList_(list, detail) {
    let res = false;
    for (let i = 0, el; el = list[i]; i++) {
      if(el.label === detail.label){
        res = true;
      }
    }
    return res;
  }

};

export {ADValidatorFoundation, ADValidator};
