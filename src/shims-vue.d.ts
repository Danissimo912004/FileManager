/// <reference types="@vue/runtime-core" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module 'vue' {
  import { createApp } from '@vue/runtime-dom'
  export { createApp }
  export * from '@vue/runtime-core'
}

declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router'
} 