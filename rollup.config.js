import base from './node_modules/@mparticle/web-kit-wrapper/rollup.base';

export default [
    {
        input: base.input,
        output: {
            ...base.output,
            format: 'iife',
            file: 'build/DoubleClick-Kit.js',
            name: 'mpDoubleClickKit',
        },
        plugins: [...base.plugins]
    },
    {
        input: base.input,
        output: {
            ...base.output,
            format: 'iife',
            file: 'dist/DoubleClick-Kit.iife.js',
            name: 'mpDoubleClickKit',
        },
        plugins: [...base.plugins]
    },
    {
        input: base.input,
        output: {
            ...base.output,
            format: 'cjs',
            file: 'dist/DoubleClick-Kit.common.js',
            name: 'mpDoubleClickKit',
        },
        plugins: [...base.plugins]
    }
];
