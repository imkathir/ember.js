import { ApplicationTestCase, moduleFor } from 'internal-test-helpers';

import { ENV } from '@ember/-internals/environment';
import { WeakRefSet } from '@ember/-internals/glimmer';

moduleFor(
  'Application test: debug render tree',
  class extends ApplicationTestCase {
    constructor() {
      super(...arguments);
      this._DEBUG_RENDER_TREE = ENV._DEBUG_RENDER_TREE;
      ENV._DEBUG_RENDER_TREE = true;

      this._TEMPLATE_ONLY_GLIMMER_COMPONENTS = ENV._TEMPLATE_ONLY_GLIMMER_COMPONENTS;
      ENV._TEMPLATE_ONLY_GLIMMER_COMPONENTS = true;
    }

    teardown() {
      super.teardown();
      ENV._DEBUG_RENDER_TREE = this._DEBUG_RENDER_TREE;
      ENV._TEMPLATE_ONLY_GLIMMER_COMPONENTS = this._TEMPLATE_ONLY_GLIMMER_COMPONENTS;
    }

    async '@test it returns a render tree'(assert: any) {
      this.addTemplate('application', '<HelloWorld /> <HelloWorld />');

      this.addComponent('hello-world', {
        ComponentClass: null,
        template: 'Hello World',
      });

      // Component -> [CurlyComponentManager, { capabilities: ..., component: ... }]

      await this.visit('/');

      let tree = WeakRefSet.for(this.owner, 'render-tree');

      assert.deepEqual(
        [...tree],
        [
          {
            type: 'component',
            name: 'my-app/templates/components/hello-world.hbs',
          },
          {
            type: 'component',
            name: 'my-app/templates/components/hello-world.hbs',
          },
        ]
      );
    }

    get owner() {
      return this.applicationInstance;
    }
  }
);
