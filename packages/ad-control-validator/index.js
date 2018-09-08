import ADComponent from './node_modules/base/component';
import ADControlValidatorFoundation from './foundation';

class ADControlValidator extends ADComponent {
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

  static addRule(rule) {
    ADControlValidatorFoundation.addRule(rule);
  }

  initialize() {

  }

  getDefaultFoundation() {
    return new ADControlValidatorFoundation({
      isRequired: () => {
        return this.root_.hasAttribute(ADControlValidatorFoundation.strings.REQUIRED);
      },
      registerEvent: (type, handler) => {
        this.root_.addEventListener(type, (e) => {
          handler(e.value);
        });
      },
      getAllAtributes: () => {
        const attributes = [];
        let nodeName = '';
        for (let i = 0, attribute; attribute = this.root_.attributes; i++) {
          nodeName = attribute.nodeName;
          if (nodeName.startWith(ADControlValidatorFoundation.strings.START_WITH)) {
            attributes.push(nodeName);
          }
        }
        return attributes;
      },
      getCustomDetail: () => {
        const detail
          = this.root_
            .getAttribute(ADControlValidatorFoundation.strings.DETAIL);
        return detail;
      },
      getTitle: () => {
        let title = this.root_
          .getAttribute(ADControlValidatorFoundation.strings.TITLE);
        if (!title) {
          title = this.root_
            .getAttribute(ADControlValidatorFoundation.strings.ID);
        }
        return title;
      },
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
    if (root.tagName === 'SELECT') {
      value = root.options[root.selectedIndex].value;
    } else {
      value = root.value;
    }
    return value;
  }
};

export {ADControlValidatorFoundation, ADControlValidator};
