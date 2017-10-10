/* ========================================================================
 * ad-js framework
 * control.js v1.0.0
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

/**
 *
 */
export default class ADControl {
  /**
   * init - Object initialization method.
   *
   * @param  {object|string} meta  meta can be either control id,  JSON object,
   * or DOM element.
   * @param  {string} state  State of the control to be displayed. It can be
   * form, edit, or view.
   * @param  {object} model  Model to the control to be bind to.
   * @param  {object} parent Parent control (container).
   * @param  {number} index  Index within parent control (container).
   */
  constructor(meta, state, model, parent, index) {
    const $this = this;
    let id;
    let el;
    let json;

    // Resolve Id and meta data.
    // Assumption: the very first element/collection must be supplied with an id.
    if (meta.id) {
      json = meta;
      id = json.id;
    } else if (typeof meta === 'string') {
      id = meta;
    }
    $this.id_ = id;

    // Set Json, it runs only for the very first time in case of
    // HTML markup. All consecutive children's runs are JSON based only.
    if (!json) {
      el = document.getElementById(id);
      json = $this.convertDomToJson(el);
    }
    $this.json_ = json;

    // Set attributes
    $this.attr_ = {};
    $this.setAttr_(json);

    $this.state_ = state || 'form';
    $this.model_ = model;

    $this.root_ = null;
    $this.built_ = false;
    $this.path = null;
    $this.parent_ = parent;

    $this.init(id, json, model, state, parent, index);
  }

  /**
   * init - Object initialization method.
   *
   * @param  {string} id     Control id.
   * @param  {object} json   Json object representing this control
   * @param  {string} state  State of the control to be displayed. It can be
   * form, edit, or view.
   * @param  {object} model  Model to the control to be bind to.
   * @param  {object} parent Parent control (container).
   * @param  {number} index  Index within parent control (container).
   */
  init(id, json, state, model, parent, index) {
    const $this = this;
    let i = 0;
    let Cntrl;
    let node;

    // Render myself...
    $this.renderDom();

    // Am I a container...
    if (json.cs) {
      $this.controls_ = [];

      // ... I want to be added to container collection
      $this.addContainer(id, $this, parent, index);

      // ... and add all my chiilderen to myself
      for (; node = json.cs[i]; i++) {
        Cntrl = $this.getControl(node.c);
        Cntrl = new Cntrl(node, model, state, $this, i);
        $this.controls_.push(Cntrl);
        $this.root_.append(Cntrl.getDom());
      }
    }

    // In case of replacement...
    /* if(parent && !$this.getContainer($this.getId()) && json.cs){

      // add to parent controls
      cntrl = parent.getControls();
      cntrl.splice(index, i, $this);

      // add JSON branch
      json = $this.locateObj(
              $this.getRootContainer().getJson(),
              parent.path);
      json.cs.splice(index, 1, $this.json_);

    }*/
  }

  /**
   * getJson - returns json object representing control itself and all children
   * (optional) within it.
   *
   * @return {Object}  json object
   */
  getJson() {
    return this.json_;
  }

  /**
   * getDom - get the root_ dom object of the control...
   *
   * @return {HTMLElement}  description
   */
  getDom() {
    return this.root_;
  }

  /**
   * show - description
   *
   */
  show() {
    // TODO: Need to be reviewed to implemented
    // more robust way of showing with animation... etc.
    this.root_.style.display = 'block';
  }

  /**
   * hide - description
   *
   */
  hide() {
    // TODO: Need to be reviewed to implemented
    // more robust way of hiding with animation... etc.
    this.root_.style.display = 'none';
  }

  /**
   * exec - description
   *
   * @param  {string} method description
   * @param  {Object} par    description
   * @return {Object}        description
   */
  exec(method, par) {
    if (this[method]) {
      return this[method](par);
    }
  }

  /**
   * getAttributes - description
   *
   * @return {type}  description
   */
  getAttributes() {
    return this.attr_;
  }

  /**
   * setAttr_ - method to set internal attr_ variable
   *
   * @param  {Object} json json object
   */
  setAttr_(json) {
    let node;
    for (node in json) {
      if (json.hasOwnProperty(node)) {
        if (node !== 'cs' && node !== 'c') {
          this.attr_[node] = json[node];
        }
      }
    }
  }
  getId() {
    return this.id_;
  }
  getParent() {
    return this.parent_;
  }
  setState(state, model) {
    this.state_ = state;
    this.model_ = model;
    this.renderDom();
  }
  getControlById(id) {
    if (this.controls_) {
      for (let i = 0, ctrl, controls = this.controls_; ctrl = controls[i]; i++) {
        if (ctrl.id_ === id) {
          return ctrl;
        }
      }
    }
  }
  getControls() {
    return this.controls_;
  }
  /**
   * getRootContainer - description
   *
   * @param  {type} con description
   * @return {type}     description
   */
  getRootContainer(con) {
    const p = this.getParent();

    if (p) {
      con = p.getRootContainer(p);
    }
    return con;
  }
  /**
   * setData - set data to the control (former set)
   *
   * @param  {Object} data  data to be assinted to the control
   */
  setData(/* data*/) {}
  /**
   * getData - get data from the control (former get)
   *
   * @param  {string} id control id
   * @return {Object}    description
   */
  getData(/* id*/) {}

  addControl(ctrl, index) {
    this.controls_.splice(index, 0, ctrl);
  }
  // Interfaces...
  // TODO: can be implemented as adapter passed to the constructor?
  guid() {}
  addContainer(/* id, container, parent, index*/) {}
  convertDomToJson(/* domObj*/) {}
  getControl(/* name*/) {}
  renderDom() {}
};
