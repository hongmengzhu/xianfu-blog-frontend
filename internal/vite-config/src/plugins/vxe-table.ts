import type { PluginOption } from 'vite';

import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';

/**
 * vxe-table 4.x 的 es 目录是按组件拆分的，但有两个 API 名找不到对应的组件目录：
 * - `VXETable`：es/v-x-e-table 只有默认导出，并且该目录没有 style.css（v4 起它只是 VxeUI 的别名）
 * - `VxeUI`：es/vxe-ui 没有同名的具名导出，只有默认导出
 * 两者都只由包入口（es/components.js）导出，所以保持从包入口导入（复用已被预打包的依赖），
 * 并把样式指向 ui 目录下的空样式文件，避免为 API 对象额外引入整张表格的 CSS。
 */
const tableApiImports = new Map<string, { jsPath: string; stylePath: string }>([
  ['VXETable', { jsPath: 'vxe-table', stylePath: 'vxe-table/es/ui/style.css' }],
  ['VxeUI', { jsPath: 'vxe-table', stylePath: 'vxe-table/es/ui/style.css' }],
]);

async function viteVxeTableImportsPlugin(): Promise<PluginOption> {
  const tableResolver = VxeResolver({ libraryName: 'vxe-table' });
  const resolveTableImport = tableResolver.resolve;

  return [
    lazyImport({
      resolvers: [
        {
          ...tableResolver,
          resolve(params) {
            const apiImport = tableApiImports.get(params.name);
            if (apiImport) {
              return { from: apiImport };
            }
            return resolveTableImport?.(params) ?? null;
          },
        },
        VxeResolver({
          libraryName: 'vxe-pc-ui',
        }),
      ],
    }),
  ];
}

export { viteVxeTableImportsPlugin };
