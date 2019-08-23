module.exports =  {
    presets: [
        "@babel/preset-env"
    ],
    plugins: [
        ["@babel/plugin-transform-runtime", {
            "absoluteRuntime": false,
            "corejs": 2,
            "helpers": false,
            "regenerator": true,
            "useESModules": false
        }]
    ]
}
