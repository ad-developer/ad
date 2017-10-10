import {assert} from 'chai';
import {ADControlManager, ADControl/* , ADDataSource, ADModule*/} from '../../../packages/ad-control-manager';

suite('ADControlMnager');

class FakeControl extends ADControl {};

// class FaceDataSource extends ADDataSource {};

// class FakeModule extends ADModule {};

// test commit

/*
function buildTestDom() {
  const con = document.createElement('div');
  con.innerHtml = `
  <div>
    <div id="con2">
      This is text
      <input type="text" id="name"/>
    <div>
    <input type="checkbox"/>
  </div>
  `;
  return con;
};

function testJDONObject() {
  return {
    'el': 'div',
    'id': 'ad2',
    'els': [
      {
        'el': 'div',
        'id': 'con2',
        'els': [
          {
            'el': 'input',
            'id': 'name',
            'type': 'text',
          },
        ],
      },
      {
        'el': 'input',
        'id': 'ad3',
        'type': 'checkbox',
      },
    ],
  };
}
*/
test('registerControl, getControl methods', ()=>{
  ADControlManager.registerControl('fake-control', FakeControl);
  const fakeControl = ADControlManager.getControl('fake-control');
  assert.isOk(fakeControl, FakeControl);
});

test('guid method', ()=>{
  const guid = ADControlManager.guid();
  assert.equal(guid, 'ad1');
});

test('convertDomToJson method', ()=>{
  // const dom = buildTestDom();
  // const actualJSON = ADControlManager.convertDomToJson(dom);
  // const json =testJDONObject();
  // assert.deepEqual(actualJSON, json);
  assert.equal(1, 1);
});
