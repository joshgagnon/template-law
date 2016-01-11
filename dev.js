
import webpack from 'webpack';
import config from './webpack.config.js'

const compiler = webpack(config);

compiler.watch({ // watch options:
    aggregateTimeout: 300, // wait so long for more changes
    poll: true // use polling instead of native watchers
    // pass a number to set the polling interval
}, (err, stats) => {
    console.log(stats.toString({colors: true}))
});