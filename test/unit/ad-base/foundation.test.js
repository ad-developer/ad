

import {assert} from 'chai';
import {ADFoundation} from '../../../packages/ad-base';

class FakeFoundation extends ADFoundation {
  get adapter() {
    return this.adapter_;
  }
}

suite('ADFoundation');

test('cssClasses getter returns an empty object', () => {
  assert.deepEqual(ADFoundation.cssClasses, {});
});

test('strings getter returns an empty object', () => {
  assert.deepEqual(ADFoundation.strings, {});
});

test('numbers getter returns an empty object', () => {
  assert.deepEqual(ADFoundation.numbers, {});
});

test('defaultAdapter getter returns an empty object', () => {
  assert.deepEqual(ADFoundation.defaultAdapter, {});
});

test('takes an adapter object in its constructor, assigns it to "adapter_"', () => {
  const adapter = {adapter: true};
  const f = new FakeFoundation(adapter);
  assert.deepEqual(f.adapter, adapter);
});

test('assigns adapter to an empty object when none given', () => {
  const f = new FakeFoundation();
  assert.deepEqual(f.adapter, {});
});

test('provides an init() lifecycle method, which defaults to a no-op', () => {
  const f = new FakeFoundation();
  assert.doesNotThrow(() => f.init());
});

test('provides a destroy() lifecycle method, which defaults to a no-op', () => {
  const f = new FakeFoundation();
  assert.doesNotThrow(() => f.destroy());
});
