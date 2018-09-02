import ADComponent from './node_modules/base/component';

import ADValidatorFoundation from './foundation';
import ADValidatorItem from './item';

class ADValidator extends ADComponent {
  /**
   * @param {!Element} root
   * @return {!ADComponent}
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
   * @return {!MDCComponent}
   */
  static getInstance(root) {
    return root.ad && root.ad[ADValidatorFoundation.strings.INSTANCE_KEY]
      ? root.ad[ADValidatorFoundation.strings.INSTANCE_KEY] : null;
  }

  initialize(validatorItemFactory = (root) => new ADValidatorItem(root)) {
    this.valItemFactory_ = validatorItemFactory();
    this.controls_ = [];
  }

  getDefaultFoundation() {
    return new ADValidatorFoundation({
      isRootForm: () => this.root_.tagName === 'FORM',
      disableDefaultValidation: () => {
        this.root_.setAttribute('novalidate', '');
      },
      registerValidators: () => {
        const controls = this.root_.querySelectorAll(`[${ADValidatorFoundation.strings.VALIDATE}]`);
        for (let i = 0, root; root = controls[i]; i++) {
          const control = this.valItemFactory_(root);
          this.controls_.push(control);
        }
      },
      isValid: () =>{
        let valid = true;

        for (let i = 0, control; control = this.controls_(i); i++) {
          if (!control.isValid()) {
            valid = false;
          }
        }
        return valid;
      },
      getDetails: () => {
        const details = [];
        for (let i = 0, control, detail; control = this.controls_(i); i++) {
          detail = control.getDetail();
          if (detail) {
            details.push(detail);
          }
        }
        return details;
      },
    });
  }

  isValid() {
    return this.foundation_.isValid();
  }

  getDetails() {
    return foundation_.getDetails();
  }
};

export {ADValidatorFoundation, ADValidator};
