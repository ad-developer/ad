/* ========================================================================
 * ad-js framework
 * control-manager.js v1.0.0
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

const ADControlManager = {

  /**
   * Key/Value (map) object to keep controls.
   * @private
   */
  controls_: {},

  /**
   * Key/Value (map) object to keep data sources.
   * @private
   */
  dataSources_: {},

  /**
   * Key/Value (map) object to keep modules.
   * @private
   */
  modules_: {},

  /**
   * Key/Value (map) object to keep containers.
   * @private
   */
  containers_: {},

  /**
   * Key/Value (map) object to keep states.
   * @private
   */
  state_: {},

  /**
   * Pre pad text to form global id.
   * @private
   */
  gpad_: 'ad',

  /**
   * Next global id index.
   * @private
   */
  gid_: 1,

  /**
   * locateObj_ - Locating the object inside the json grath based on the submitted path.
   *
   * @param  {object} JSONObj  JSON object
   * @param  {string} path     Path
   * @return {string}          Extracted object
   */
  locateObj_(JSONObj, path) {
    if (path === '') {
      return obj;
    }
    path = path.split('.');
    const arrayPattern = /(.+)\[(\d+)\]/;
    for (let i = 0, match; i < path.length; i++) {
      match = arrayPattern.exec(path[i]);
      if (match) {
        JSONObj = JSONObj[match[1]][parseInt(match[2])];
      } else {
        JSONObj = JSONObj[path[i]];
      }
    }
    return JSONObj;
  },

  /**
   * getNodeText_ - description
   *
   * @param  {type} domNode  DOM node.
   * @return {string}    returns the node's text content, disregarding all
   * childrens' text content.
   */
  getNodeText_(domNode) {
    let res = '';
    let i = 0;
    const children = domNode.childNodes;
    for (; domNode = children[i]; i++) {
      if (domNode.nodeType === Node.TEXT_NODE && domNode.textContent.trim() !== '') {
        res += domNode.textContent;
      }
    }
    return res.trim();
  },

  /**
   * convertDomToJson - Method to convert dom structure into the Json object.
   * This method add missing Id(s) to dom element(s) and resolve Json object
   * nodes. This is a default implementation and is not controlled at this
   * moment... it can be added as an opt-out feature in the future
   * implementation.
   * @param  {object} domObj Dom object.
   * @return {object}       Json object.
   */
  convertDomToJson(domObj) {
    const obj = {};
    let i = 0;
    let el;
    let children;
    const arrObj = [];
    const attr = domObj.attributes;
    let tag = domObj.tagName.toLowerCase();
    let id = false;

    obj.c = tag;

    // Get all attributes
    for (; el = attr[i]; i++) {
      tag = el.value;
      // Make sure not to add display: none; as a
      // value of style attribute
      if (el.value.indexOf('display: none;') >= 0) {
        tag = tag.replace('display: none;', '');
      }
      tag = tag.trim();
      if (tag.length || el.name.startsWith('ad-')) {
        obj[el.name] = tag;
        if (el.name === 'id') {
          id = true;
        }
      }
    }
    // Add id if missing...
    // TODO: This needs to be reviewed.
    if (!id) {
      obj.id = this.guid();
    }

    // Check if element has an inner text
    tag = ADControlManager.getNodeText_(domObj); // domObj.textContent.trim();
    if (tag.length) {
      obj.ad_inner_text = tag;
    }

    // Add children.
    if (domObj.children.length) {
      i = 0;
      children = domObj.children;
      for (; el = children[i]; i++) {
        arrObj.push(ADControlManager.convertDomToJson(el));
      }
      obj.cs = arrObj;
    }
    return obj;
  },

  /**
   *  Generates next clobal id.
   * @return {string}  description
   */
  guid() {
    return ADControlManager.gpad_ + ADControlManager.gid_++;
  },

  /**
   * build - The main method of the framework. It applys
   *
   * @param  {string|object} meta  Meta can be either container id
   * or JSON object representing the content of the container. If container id
   * is provided then the HTML markup will be used to build the content of the
   * container...
   * If JSON, then the following JSON format is used:
   * { contId: "id", controls: [{tag: "name", attribute: "value", attribute: "value"}, ..., ]}
   * @param  {object=} model Represents a model of the container
   * controls.
   * @param  {string=} state State of the control(s) it can be
   * form, edit, or view.
   */
  build(meta, model, state) {
    let id;
    let parent;
    let tag;
    let po;
    let i;

    // JSON
    if (meta.id) {
      id = meta.id;
      tag = meta.c;
    } else {
      id = meta;
    }

    // TODO: Can be replace with the
    // document.querySelector(...);
    const con = ADControlManager.getDomElementById_(id);
    if (!tag) {
      tag = con.tagName.toLowerCase();
    }
    // Hide container untill it's rendered in full.
    // It is implemented through display css property.
    // TODO: This can be done as a setting... to apply more robust mechanism using
    // css transformation/animation properties.
    con.style.display = 'none';


    // Get a 'parent and the position within it
    // in case of replacement
    po = this.purge_(id);
    // tag = null;
    if (po) {
      parent = po.p;
      i = po.i;
    }

    // Make instance of the corresponding
    // container control
    let ControlObj = this.getControl(tag);
    ControlObj = new ControlObj(meta, model, state, parent, i);

    // Add new control, and JSON branch to a parent
    // in case of replacement
    if (po) {
      parent.addControl(ControlObj, i);
      tag = ADControlManager.locateObj_(
        ControlObj.getRootContainer().getJson(),
        parent.path);

      tag.cs.splice(i, 1, ControlObj.getJson());
    }

    ControlObj.hide();
    parent = con.parentElement;
    // po is a new element
    po = ControlObj.getDom();
    parent.replaceChild(po, con);
    ControlObj.show();
  },

  /**
   * Method to registers controls.
   *
   * @param  {string} name   A tag name or Json node name example "ad-text";
   * @param  {Control} control   Control class.
   */
  registerControl(name, control) {
    this.controls_[name] = control;
  },

  /**
   * Method to register datasources.
   *
   * @param  {string} name       DataSource name.
   * @param  {DataSource} dataSource DataSource class.
   */
  registerDataSource(name, dataSource) {
    this.dataSources_[name] = dataSource;
  },

  /**
   * Method to register modules.
   *
   * @param  {string} name   Madule name.
   * @param  {Module} module Module class.
   */
  registerModule(name, module) {
    this.modules_[name] = module;
  },

  /**
   * getDataSource get datasource class.
   *
   * @param  {string} name DataSorce name
   * @return {object}      DataSource class.
   */
  getDataSource(name) {
    return this.dataSources_[name];
  },

  /**
   * getModule get module classs.
   *
   * @param  {string} name Module name.
   * @return {object}      Module class.
   */
  getModule(name) {
    return this.modules_[name];
  },

  /**
   * Method to build container path. Used as a key to save/retrieve container
   * object from containers_ map.
   *
   * @param  {ADControl} parent Parent Object
   * @param  {number} index     Position within parent collection of controls.
   * @return {string}           New calculated path.
   */
  getContainerPath_(parent, index) {
    let p = parent.path;
    if (p !== '') {
      p += '.';
    }
    p += 'cs[' + index + ']';
    return p;
  },

  /**
   * addContainer - Method to add a container to containers_ map;
   *
   * @param  {string} id           Container id.
   * @param  {ADControl} container Container object.
   * @param  {ADControl} parent    Parent object.
   * @param  {number} index        Position within parent collection of controls.
   */
  addContainer(id, container, parent, index) {
    let path = '';
    if (parent) {
      path = ADControlManager.getContainerPath_(parent, index);
    }
    container.path = path;
    this.containers_[id] = container;
  },

  /**
   * Getter to get container object from containers_ map;
   *
   * @param  {string} id    Container id.
   * @return {ADControl}    Container object.
   */
  getContainer(id) {
    return ADControlManager.containers_[id];
  },

  /**
   * getControl - Getter to get control class from controls_ map;
   *
   * @param  {string} tagName conrols's tag name.
   * @return {Control}     Control class.
   */
  getControl(tagName) {
    let c = this.controls_[tagName];
    if (!c) {
      c = this.controls_['general-control'];
    }
    return c;
  },

  /**
   * getParentAndIndex_ - Extract parent and index elememt from the path.
   *
   * @param  {string} path Path
   * @return {object}      Object with the two fields p - as a parent and
   *                       i - index ... {i,p} ...
   */
  getParentAndIndex_(path) {
    const p = path.substr(0, path.length - 3);
    const i = path.substr(path.length - 2, 1);
    return {
      // path
      p: p,
      // index
      i: parseInt(i),
    };
  },

  /**
   * purge_ - Method removes the node traces from the (1) containers_ list,
   * (2) from global Json path and (3) from parent controls list array.
   *
   * @private
   * @param  {string} id Id
   * @return {object}    Object of parent and index within it.
   */
  purge_(id) {
    // Remove this container and all subcontainers from containers_ list.
    // Remove this from JOSN path.
    // Remove this control from parent controls.
    let con = this.containers_[id];
    let path;
    let el;
    let i = 0;

    if (!con) {
      return;
    }

    const parent = con.getParent();
    path = con.path;

    // Remove from container...
    delete this.containers_[id];

    // ... and all subcontainers.
    for (el in this.containers_) {
      if (this.containers_.hasOwnProperty(el)) {
        if (this.containers_[el].path.startsWith(path)) {
          delete this.containers_[el];
        }
      }
    }

    // If not a parent then it's a root container and the entire JSON
    // object will be deleted
    if (!parent) {
      el = con.getJson();
      // Set the JSON object to the empty object.
      el = {};
      return;
    }
    path = this.getParentAndIndex_(path);

    con = ADControlManager.locateObj_(parent.getRootContainer().getJson(), path.p);

    // Remove JSON branch from the parent.
    con.splice(path.i, 1);

    path = parent.getControls();
    i = 0;
    for (;i < path.length; i++) {
      con = path[i];
      if (con.getId() === id) {
        // i = i - 1;
        path.splice(i, 1);
        break;
      }
    }
    return {
      p: parent,
      i: i,
    };
  },

  /**
   * getDomElementById_ - gets dom element by id
   *
   * @param  {string} id element id
   * @return {Object}    dom element
   */
  getDomElementById_(id) {
    return document.getElementById(id);
  },

};

export default ADControlManager;
