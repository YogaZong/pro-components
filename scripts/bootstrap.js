/**
 * scripts/bootstrap.js
 * @description 生成所有 Pro 组件的 package.json
 * @author Yoga
 */
const { readdirSync, existsSync, writeFileSync } = require('fs');
const { join } = require('path');
const { yParser } = require('@umijs/utils');

(async () => {
  // @description process.argv 属性会返回一个数组，其中包含当 Node.js 进程被启动时传入的命令行参数。
  // @url http://nodejs.cn/api/process.html#process_process_argv
  const args = yParser(process.argv);
  const version = '1.0.0-beta.1';

  const pkgs = readdirSync(join(__dirname, '../packages')).filter((pkg) => pkg.charAt(0) !== '.');

  pkgs.forEach((shortName) => {
    console.log(shortName);
    const name = `@antdv/pro-${shortName}`;

    // 每个 Pro 组件的 package/${shortName}/package.json
    const pkgJSONPath = join(__dirname, '..', 'packages', shortName, 'package.json');
    /**
     * fs.existsSync(path: string | Buffer | url): boolean
     * 以同步的方法检测目录是否存在。
     */
    const pkgJSONExists = existsSync(pkgJSONPath);

    let json;
    // if !package.json
    if (args.force || !pkgJSONExists) {
      json = {
        name,
        version,
        description: name,
        module: 'lib.index.js',
        types: 'lib/index.d.ts',
        files: ['lib', 'src', 'dist', 'es'],
        repository: {
          type: 'git',
          url: 'https://github.com/yogazong/pro-components',
        },
        browserslist: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
        keywords: ['antdv', 'admin', 'ant-design-vue', 'ant-design-vue-pro'],
        authors: [
          'yogazong <zongyujia@me.com> (https://github.com/yogazong)',
        ],
        license: 'MIT',
        // bugs: 'http://github.com/umijs/plugins/issues',
        homepage: `https://github.com/yogazong/pro-components/tree/master/packages/${shortName}#readme`,
        peerDependencies: {
          'ant-design-vue': '2.x',
          vue: '^3.x',
        },
        publishConfig: {
          access: 'public',
        },
      };

      if (pkgJSONExists) {
        const pkg = require(pkgJSONPath);
        [
          'dependencies',
          'devDependencies',
          'peerDependencies',
          'bin',
          'version',
          'files',
          'authors',
          'types',
          'sideEffects',
          'main',
          'module',
          'description',
        ].forEach((key) => {
          if (pkg[key]) json[key] = pkg[key];
        });
      }
      writeFileSync(pkgJSONPath, `${JSON.stringify(json, null, 2)}\n`);
    }

    const readmePath = join(__dirname, '..', 'packages', shortName, 'README.md');
    // if !readme.md
    if (args.force || !existsSync(readmePath)) {
      const readmeContent = `
# ${name}
> ${name}.

See our website [${name}](https://umijs.org/plugins/${shortName}) for more information.

## Install

Using npm:

\`\`\`bash
$ npm install --save ${name}
\`\`\`

or using yarn:

\`\`\`bash
$ yarn add ${name}
\`\`\` 
`;
      writeFileSync(readmePath, readmeContent);
    }
  });
})();
