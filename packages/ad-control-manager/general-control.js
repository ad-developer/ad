/* ========================================================================
 * ad-js framework
 * general-control.js v1.0.0
 * ========================================================================
 * Copyright 2017 A. D.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

import ADControl from './control';
import ADControlManager from './control-manager';

class ADGeneralControl extends ADControl {
  renderDom() {
    const json = this.getJson();
    const ctrl = document.createElement(json.c);
    let i = 0;
    let el;

    for (el in this.attr_) {
      if (this.attr_.hasOwnProperty(el)) {
        if (el === 'ad_inner_text') {
          ctrl.textContent = this.attr_[el];
        } else {
          ctrl.setAttribute(el, this.attr_[el]);
        }
      }
    }
    if (this.controls_ && this.built) {
      for (; el = this.controls_[i]; i++) {
        el.setState(this.state_, this.model_);
      }
    }
    this.root_ = ctrl;
    this.built_ = true;
  }
  // Implement interfaces...
  guid() {
    return ADControlManager.guid();
  }
  addContainer(id, container, parent, index) {
    ADControlManager.addContainer(id, container, parent, index);
  }
  convertDomToJson(domObj) {
    return ADControlManager.convertDomToJson(domObj);
  }
  getControl(tagName) {
    return ADControlManager.getControl(tagName);
  }
};

ADControlManager.registerControl('general-control', ADGeneralControl);
