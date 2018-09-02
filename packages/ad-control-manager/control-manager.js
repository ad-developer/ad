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
   * @param  {Elememt} domElement  DOM element.
   * @return {string}    returns the node's text content, disregarding all
   * childrens' text content.
   */
  getNodeText_(domElement) {
    let res = '';
    let i = 0;
    const children = domElement.childNodes;
    for (; domElement = children[i]; i++) {
      if (domElement.nodeType === Node.TEXT_NODE && domElement.textContent.trim() !== '') {
        res += domElement.textContent;
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
   * @param  {Elemnt} domElement DOM element.
   * @return {object}       Json object.
   */
  convertDomToJson(domElement) {
    const obj = {};
    let i = 0;
    let el;
    let children;
    const arrObj = [];
    const attr = domElement.attributes;
    let tag = domElement.tagName.toLowerCase();
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
        if (el.name === 'ad-id') {
          id = true;
        }
      }
    }
    // Add id if missing...
    // TODO: This needs to be reviewed.
    if (!id) {
      obj['ad-id'] = this.guid();
    }

    // Check if element has an inner text
    tag = ADControlManager.getNodeText_(domElement);
    if (tag.length) {
      obj.ad_inner_text = tag;
    }

    // Add children.
    if (domElement.children.length) {
      i = 0;
      children = domElement.children;
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
   * @param  {string|object} meta  meta can be either container id
   * or Json object (descriptor) representing the content of the container.
   *
   * If a container id is provided then the HTML markup is used to build
   * the content of the container...
   * If Json object is provided ( the following Json format is used:
   *                        { contId: "id",
   *                          controls: [
   *                                      {tag: "name",
   *                                       attribute-one: "value",
   *                                       attribute-two: "value",
   *                                       ...
 *                                         },
   *                                       ...,
   *                                       ]
   *                         } )
   * them the content is build base on the descriptor.
   *
   * @param  {object=} model Represents a model of the container controls.
   *
   * @param  {string=} state State of the control(s) it can be either edit
   * (by defaut) or 'static' non editable.
   */
  build(meta, model, state) {
    let id;
    let parent;
    let tag;
    let po;
    let i;

    // Resolve the meta data
    if (meta['ad-id']) {
      id = meta['ad-id'];
      tag = meta.c;
    } else {
      id = meta;
    }

    const con = document.querySelector(`[ad-id=${id}]`);

    // Hide container. It can not be done properly on the very first run
    // through the hide() method of the Control object. The Control object
    // needs to be fully rendered before you can call the method which
    // defeats the purpose of the action.
    ADControlManager.hideContainer_(con);

    if (!tag) {
      tag = con.tagName.toLowerCase();
    }

    // Purge the container (if the container already exists)
    // from the controls tree and get it's parent and it's position within it.
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

    // Hide the newly built control before injecting it into the
    // container.
    ControlObj.hide();

    // Replace the container with the new DOM tree
    parent = con.parentElement;
    // Get the DOM tree
    po = ControlObj.getDom();
    parent.replaceChild(po, con);

    // Show the control
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
   * hideContainer_ - hides entry point container domElement
   *
   * @param  {Elememt} domElement toot element of the container
   */
  hideContainer_(domElement) {
    domElement.style.display ='none';
  },

};

export default ADControlManager;
