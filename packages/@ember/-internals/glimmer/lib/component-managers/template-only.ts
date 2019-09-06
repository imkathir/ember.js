import { OwnedTemplateMeta } from '@ember/-internals/views';
import { ComponentCapabilities, Template, Option } from '@glimmer/interfaces';
import { CONSTANT_TAG } from '@glimmer/reference';
import {
  ComponentDefinition,
  Invocation,
  NULL_REFERENCE,
  WithStaticLayout,
} from '@glimmer/runtime';
import RuntimeResolver from '../resolver';
import { OwnedTemplate } from '../template';
import AbstractManager from './abstract';
import Environment from '../environment';
import { ENV } from '@ember/-internals/environment';

const CAPABILITIES: ComponentCapabilities = {
  dynamicLayout: false,
  dynamicTag: false,
  prepareArgs: false,
  createArgs: false,
  attributeHook: false,
  elementHook: false,
  createCaller: false,
  dynamicScope: false,
  updateHook: false,
  createInstance: true,
};

export interface DebugStateBucket {
  environment: Environment;
}

export default class TemplateOnlyComponentManager
  extends AbstractManager<Option<DebugStateBucket>, OwnedTemplate>
  implements
    WithStaticLayout<Option<DebugStateBucket>, OwnedTemplate, OwnedTemplateMeta, RuntimeResolver> {
  getLayout(template: OwnedTemplate): Invocation {
    const layout = template.asLayout();
    return {
      handle: layout.compile(),
      symbolTable: layout.symbolTable,
    };
  }

  getCapabilities(): ComponentCapabilities {
    return CAPABILITIES;
  }

  create(
    environment: Environment,
    template: Template<OwnedTemplateMeta>
  ): Option<DebugStateBucket> {
    if (ENV._DEBUG_RENDER_TREE) {
      let bucket = { environment };
      environment.debugRenderTree.push(bucket, {
        type: 'component',
        name: template.referrer.moduleName,
      });
      return bucket;
    } else {
      return null;
    }
  }

  getSelf() {
    return NULL_REFERENCE;
  }

  getTag() {
    return CONSTANT_TAG;
  }

  getDestructor() {
    return null;
  }

  didRenderLayout(bucket: Option<DebugStateBucket>): void {
    if (ENV._DEBUG_RENDER_TREE) {
      bucket!.environment.debugRenderTree.pop();
    }
  }
}

const MANAGER = new TemplateOnlyComponentManager();

export class TemplateOnlyComponentDefinition
  implements ComponentDefinition<OwnedTemplate, TemplateOnlyComponentManager> {
  manager = MANAGER;
  constructor(public state: OwnedTemplate) {}
}
