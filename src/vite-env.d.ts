/// <reference types="vite/client" />

// oxlint's type-aware checker resolves modules with plain tsc semantics and
// doesn't understand Vue SFCs the way vue-tsc/Volar does, so without this
// shim it reports every `./Foo.vue` import as an unresolved module. vue-tsc
// itself ignores this declaration and type-checks .vue files properly on
// its own.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
