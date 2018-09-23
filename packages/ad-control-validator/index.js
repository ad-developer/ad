import ADComponent from './node_modules/base/component';
import ADControlValidatorFoundation from './foundation';

export default class ADControlValidator extends ADComponent {
  /**
   * @param {!Element} root
   * @return {!ADComponent}
   */
  static attachTo(root) {
    const instance = new ADControlValidator(root);

    // Attach instance to the root
    root.ad = root.ad || {};
    root.ad[ADControlValidatorFoundation.strings.INSTANCE_KEY] = instance;
    return instance;
  }

  /**
   * @param {!Element} root
   * @return {!MDCComponent}
   */
  static getInstance(root) {
    return root.ad && root.ad[ADValidatorItemFoundation.strings.INSTANCE_KEY]
      ? root.ad[ADValidatorItemFoundation.strings.INSTANCE_KEY] : null;
  }

  initialize(rules) {
    this.rules_ = rules;
  }

  getDefaultFoundation() {
    return new ADControlValidatorFoundation({
      isRequired: () => {
        return this.root_.hasAttribute(ADControlValidatorFoundation.strings.REQUIRED);
      },
      registerEvent: (type, handler) => {
        this.listen(type, (e) => {
          handler(e.value);
        });
      },
      getAllAtributes: () => {
        const attributes = [];
        let name = '';
        for (let i = 0, attribute; attribute = this.root_.attributes[i]; i++) {
          name = attribute.name;
          if (name.startsWith(ADControlValidatorFoundation.strings.START_WITH)) {
            attributes.push(name);
          }
        }
        return attributes;
      },
      getMessage: () => {
        const detail
          = this.root_
            .getAttribute(ADControlValidatorFoundation.strings.MESSAGE);
        return detail;
      },
      getRules: () => {
        return this.rules_;
      },
      setNotValidIndicator: (details) => {
        // Set the validator indicator
        const gr = this.root_.closest(`[${ADControlValidatorFoundation.strings.CONTROL_GROUP}]`);
        if (gr) {
          gr.classList.add(ADControlValidatorFoundation.strings.ERROR_CLASS);
        }
        const det = gr.querySelector(`[${ADControlValidatorFoundation.strings.MESSAGE_SHOW}]`);
        if (det) {
          det.innerHTML = details.message;
          det.style.display = 'block';
        }
      },
      removeNotValidIndicator: () => {
        // Remove the validator indicator
        const gr = this.root_.closest(`[${ADControlValidatorFoundation.strings.CONTROL_GROUP}]`);
        if (gr) {
          gr.classList.remove(ADControlValidatorFoundation.strings.ERROR_CLASS);
        }
        const det = gr.querySelector(`[${ADControlValidatorFoundation.strings.MESSAGE_SHOW}]`);
        if (det) {
          det.innerHTML = '';
          det.style.display = 'none';
        }
      },
      isChangeCheckboxType: () => {
        const root = this.root_;
        const res =
          root.nodeName === 'SELECT' ||
          root.type && (root.type == 'checkbox' || root.type == 'radio');
        return res;
      },
      getValue: () => {
        return this.getValue_();
      },
      getElement: () => {
        return this.root_;
      },
      getLabel: () => {
        let res = '';
        const gr = this.root_.closest(`[${ADControlValidatorFoundation.strings.CONTROL_GROUP}]`);
        const el = gr.querySelector(`[${ADControlValidatorFoundation.strings.LABEL}]`);
        if (el) {
          res = el.getAttribute(ADControlValidatorFoundation.strings.LABEL);
        }
        return res;
      },
      isInGroup: () => {
        return this.root_.hasAttribute(ADControlValidatorFoundation.strings.GROUP);
      }
    });
  }

  isValid() {
    const value = this.getValue_();
    return this.foundation_.isValid(value);
  }

  getDetail() {
    return this.foundation_.getDetail();
  }

  getValue_() {
    let value;
    const root = this.root_;
    if(root.type && (root.type === 'checkbox' || root.type === 'radio')) {
      value = root.checked;
    } else {
      value = root.value;
    }
    return value;
  }
};

export {ADControlValidatorFoundation, ADControlValidator};
