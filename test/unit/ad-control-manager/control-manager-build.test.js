
import {assert} from 'chai';
import bel from 'bel';

import {ADControlManager, ADControl, ADGeneralControl,
  ADDataSource, ADModule} from '../../../packages/ad-control-manager';

suite('ADControlMnager.build');

function resetADControlManager() {
  // ADControlManager.controls_ = {};
  ADControlManager.dataSources_ = {};
  ADControlManager.modules_ = {};
  ADControlManager.containers_ = {};
  ADControlManager.gid_ = 1;
}


test('build builds the dom structure', ()=>{
  // The build method resolves the meta information.
  // - In case of dom it resolves the name of the root's container
  // and retrieves the appropreate Control class.
  // - In case of the Json the root control id and tag name is passed to the
  // appropreate Control class.
  // It hides the root container and then sequentially shoes it after the dom
  // is built.
  // It replaces the root container with the new dom stracture.
  // In case of injection it 
  resetADControlManager();
  const root = getContainerWithParentFixture();
  const testContainer = setTestContainer();
  testContainer.appendChild(root);

  // meta - meta data
  // mode - the container content model JSON
  // state - view state -- edit | static (view) --
  // build(meta, model, state)
  // 1 - base(dom) with model
  // 2 - base(dom) with state
  // 3 - base (Json)
  // 4 - substitute (Json)

  ADControlManager.build('parent');
  const container = ADControlManager.getContainer('parent');
  const actualDom = container.getDom();

  const testJSON = getJSON();
  // assert.deepEqual(actualJSON, testJSON);
});
