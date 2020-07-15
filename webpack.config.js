const path = require('path');
const WrapperPlugin = require('wrapper-webpack-plugin');

module.exports = env => {
  console.log(env.NODE_ENV);
  return {
    devtool: 'hidden-source-map',
    entry: './src/coffeebot.js',
    mode: env.NODE_ENV === 'development' ? 'development' : 'production',
    output: {
      filename: 'main.js',
      library: 'coffeebot',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      // strict mode for the whole bundle
      new WrapperPlugin({
        test: /\.js$/, // only wrap output of bundle files with '.js' extension 
        header: '',
        footer: `
function generateNextPairings() {
  coffeebot.generateNextPairings();
}

function sendEmails() {
  coffeebot.sendEmails();
}
        `,
      }),
    ],
    target: "node",
  };
};