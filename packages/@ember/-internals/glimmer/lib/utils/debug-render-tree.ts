import { Owner } from '@ember/-internals/owner';
import { Stack, expect } from '@glimmer/util';
import { WeakRefSet } from './weak';
import { assert } from '@ember/debug';

export interface RenderNode {
  type: 'route' | 'component';
  name: string;
}

export default class DebugRenderTree {
  private stack = new Stack<object>();

  constructor(owner: Owner) {
    this.stack.push(owner);
  }

  push(bucket: object, node: RenderNode): void {
    let parent = expect(this.stack.current, 'BUG: Unexpected empty stack');
    WeakRefSet.for(parent, 'render-tree').add(node);
    this.stack.push(bucket);
  }

  pop(): void {
    assert('Cannot pop the root node off the debug render tree', this.stack.size !== 1);
    this.stack.pop();
  }
}
