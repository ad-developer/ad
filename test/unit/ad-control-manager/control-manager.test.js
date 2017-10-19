import {assert} from 'chai';
import bel from 'bel';

import {ADControlManager, ADControl, ADGeneralControl,
  ADDataSource, ADModule} from '../../../packages/ad-control-manager';

suite('ADControlMnager');

class FakeControl extends ADControl {};

class FakeGeneralControl extends ADGeneralControl {};

class FakeDataSource extends ADDataSource {};

class FakeModule extends ADModule {};

function setTestContainer() {
  let con = document.getElementById('ad-test');
  if (!con) {
    con = document.createElement('div');
    con.setAttribute('id', 'ad-test');
    document.body.appendChild(con);
  } else {
    // Remove all children
    while (con.firstChild) {
      con.removeChild(myNode.firstChild);
    }
  }
  return con;
};

function getFixture() {
  return bel`
    <div>
      <div id="con2">
        This is test
        <input type="text" id="name"/>
      </div>
      <input type="checkbox"/>
    </div>
  `;
};

function getContainerFixture() {
  return bel`
    <div id="con">
      <input type="checkbox"/>
    </div>
  `;
}

function getJSON() {
  return {
    'c': 'div',
    'id': 'ad2',
    'cs': [
      {
        'c': 'div',
        'id': 'con2',
        'ad_inner_text': 'This is test',
        'cs': [
          {
            'c': 'input',
            'id': 'name',
            'type': 'text',
          },
        ],
      },
      {
        'c': 'input',
        'id': 'ad3',
        'type': 'checkbox',
      },
    ],
  };
};

test('registerControl registers a control with a specified key', ()=>{
  ADControlManager.registerControl('fake-control', FakeControl);
  const fakeControl = ADControlManager.getControl('fake-control');
  assert.isOk(fakeControl, FakeControl);
});

test('getControl returns a control based on the key', ()=>{
  const fakeControl = ADControlManager.getControl('fake-control');
  assert.isOk(fakeControl, FakeControl);
});

test('registerDataSource registers a data source with a specified key', ()=>{
  ADControlManager.registerDataSource('fake-datasource', FakeDataSource);
  const fakeDataSource = ADControlManager.getDataSource('fake-datasource');
  assert.isOk(fakeDataSource, FakeDataSource);
});

test('getDataSource returns data source based on the key', ()=>{
  const fakeDataSource = ADControlManager.getDataSource('fake-datasource');
  assert.isOk(fakeDataSource, FakeDataSource);
});

test('registerModule registers a module with a specified key', ()=>{
  ADControlManager.registerModule('fake-module', FakeModule);
  const fakeModule = ADControlManager.getModule('fake-module');
  assert.isOk(fakeModule, FakeModule);
});

test('getModule returns module based on the key', ()=>{
  const fakeModule = ADControlManager.getModule('fake-module');
  assert.isOk(fakeModule, FakeModule);
});

test('guid method returns next guid id', ()=>{
  const guid = ADControlManager.guid();
  assert.equal(guid, 'ad1');
});

test('convertDomToJson converts dom element to Json object', ()=>{
  const dom = getFixture();
  const actualJSON = ADControlManager.convertDomToJson(dom);
  const testJSON = getJSON();
  assert.deepEqual(actualJSON, testJSON);
});

test('addContainer  adds container to the container collection', ()=>{
  // Without parent
  const root = getContainerFixture();
  const testContainer = setTestContainer();
  testContainer.appendChild(root);
  const fakeControlInstance = new FakeGeneralControl('con');
  ADControlManager.addContainer('con', fakeControlInstance);
  const savedContainerInstance = ADControlManager.getContainer('con');
  assert.isOk(savedContainerInstance, fakeControlInstance);

  // With parent
});
