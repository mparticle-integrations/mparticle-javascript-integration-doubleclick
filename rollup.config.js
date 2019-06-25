import base from './node_modules/@mparticle/web-kit-wrapper/rollup.base';

export default [
    {
        input: base.input,
        output: {
            ...base.output,
            file: 'dist/DoubleClick-Kit.js',
            name: 'mp-doubleclick-kit'
        },
        plugins: [...base.plugins]
    }
];
