
import {assert} from 'chai';
import domEvents from 'dom-events';
import td from 'testdouble';

import {ADComponent} from '../../../packages/ad-base';

class FakeComponent extends ADComponent {
  get root() {
    return this.root_;
  }

  get foundation() {
    return this.foundation_;
  }

  getDefaultFoundation() {
    const defaultFoundation = td.object({
      isDefaultFoundation: true,
      init: () => {},
    });
    defaultFoundation.rootElementAtTimeOfCall = this.root_;
    return defaultFoundation;
  }

  initialize(...args) {
    this.initializeArgs = args;
    this.initializeComesBeforeFoundation = !this.foundation_;
  }

  initialSyncWithDOM() {
    this.synced = true;
  }
}

suite('ADComponent');

test('provides a static attachTo() method that returns a basic instance with the specified root', () => {
  const root = document.createElement('div');
  const b = ADComponent.attachTo(root);
  assert.isOk(b instanceof ADComponent);
});

test('provides a static getInstance() method that returns a basic instance from the specified root', () => {
  const root = document.createElement('div');
  ADComponent.attachTo(root);
  const b = ADComponent.getInstance(root);
  assert.isOk(b instanceof ADComponent);
});

test('takes a root node constructor param and assigns it to the "root_" property', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  assert.equal(f.root, root);
});

test('takes an optional foundation constructor param and assigns it to the "foundation_" property', () => {
  const root = document.createElement('div');
  const foundation = {init: () => {}};
  const f = new FakeComponent(root, foundation);
  assert.equal(f.foundation, foundation);
});

test('assigns the result of "getDefaultFoundation()" to "foundation_" by default', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  assert.isOk(f.foundation.isDefaultFoundation);
});

test("calls the foundation's init() method within the constructor", () => {
  const root = document.createElement('div');
  const foundation = td.object({init: () => {}});
  // Testing side effects of constructor
  // eslint-disable-next-line no-new
  new FakeComponent(root, foundation);
  td.verify(foundation.init());
});

test('throws an error if getDefaultFoundation() is not overridden', () => {
  const root = document.createElement('div');
  assert.throws(() => new ADComponent(root));
});

test('calls initialSyncWithDOM() when initialized', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  assert.isOk(f.synced);
});

test('provides a default initialSyncWithDOM() no-op if none provided by subclass', () => {
  assert.doesNotThrow(ADComponent.prototype.initialSyncWithDOM.bind({}));
});

test("provides a default destroy() method which calls the foundation's destroy() method", () => {
  const root = document.createElement('div');
  const foundation = td.object({init: () => {}, destroy: () => {}});
  const f = new FakeComponent(root, foundation);
  f.destroy();
  td.verify(foundation.destroy());
});

test('#initialize is called within constructor and passed any additional positional component args', () => {
  const f = new FakeComponent(document.createElement('div'), /* foundation */ undefined, 'foo', 42);
  assert.deepEqual(f.initializeArgs, ['foo', 42]);
});

test('#initialize is called before getDefaultFoundation()', () => {
  const f = new FakeComponent(document.createElement('div'));
  assert.isOk(f.initializeComesBeforeFoundation);
});

test('#listen adds an event listener to the root element', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  const handler = td.func('eventHandler');
  f.listen('FakeComponent:customEvent', handler);
  domEvents.emit(root, 'FakeComponent:customEvent');
  td.verify(handler(td.matchers.anything()));
});

test('#unlisten removes an event listener from the root element', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  const handler = td.func('eventHandler');
  root.addEventListener('FakeComponent:customEvent', handler);
  f.unlisten('FakeComponent:customEvent', handler);
  domEvents.emit(root, 'FakeComponent:customEvent');
  td.verify(handler(td.matchers.anything()), {times: 0});
});

test('#emit dispatches a custom event with the supplied data', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  const handler = td.func('eventHandler');
  let evt = null;
  td.when(handler(td.matchers.isA(Object))).thenDo((evt_) => {
    evt = evt_;
  });
  const data = {evtData: true};
  const type = 'customeventtype';

  root.addEventListener(type, handler);
  f.emit(type, data);
  assert.isOk(evt !== null);
  assert.equal(evt.type, type);
  assert.deepEqual(evt.detail, data);
});

test('#emit dispatches a custom event with the supplied data where custom events aren\'t available', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  const handler = td.func('eventHandler');
  let evt = null;
  td.when(handler(td.matchers.isA(Object))).thenDo((evt_) => {
    evt = evt_;
  });
  const data = {evtData: true};
  const type = 'customeventtype';

  root.addEventListener(type, handler);

  const {CustomEvent} = window;
  window.CustomEvent = undefined;
  try {
    f.emit(type, data);
  } finally {
    window.CustomEvent = CustomEvent;
  }

  assert.isOk(evt !== null);
  assert.equal(evt.type, type);
  assert.deepEqual(evt.detail, data);
});

test('(regression) ensures that this.root_ is available for use within getDefaultFoundation()', () => {
  const root = document.createElement('div');
  const f = new FakeComponent(root);
  assert.equal(f.foundation.rootElementAtTimeOfCall, root);
});
