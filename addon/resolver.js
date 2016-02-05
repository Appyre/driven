/* jshint node: true */
/* global require, module */
"use strict";

const path = require('path');
const fs = require('fs');
const pluralize = require('./utils/pluralize');
const factorySettings = require('./config/-factories');

module.exports = class Resolver {

    constructor(appName, pathForApp, namespace) {
        this.factorySettings = factorySettings;
        this.namespace = namespace ? 'namespaces/' + namespace : '';
        this.appName = appName;
        this.pathForApp = pathForApp;
        this.logger = null;
        this.pathForProject = path.join(pathForApp, '../');
        this.pathForFramework = path.join(pathForApp, '../driven');
    }

    glob(name) {
        if (this.logger.config.LOG_RESOLVER) {
            this.logger.log(`Resolver.glob('${name}')`);
        }
        let globPath;
        if (name.indexOf('driven') === 0) {
            const nameParts = name.split('/');
            nameParts.shift();
            globPath = path.join(this.pathForFramework, '/' + nameParts.join('/'));
        } else {
            globPath = path.join(this.pathForApp, '/' + name);
        }
        return new Promise((resolve, reject) => {
            fs.readdir(globPath, (err, fileNames) => {
                if (err) {
                    reject(err);
                    return;
                }
                const moduleNames = fileNames.filter(function(item) {
                    return (item.indexOf('.js') !== -1);
                });
                const modules = moduleNames.map((name) => {
                    let reqPath = path.join(globPath, '/' + name);
                    return { name: name, module: require(reqPath)};
                });
                resolve(modules);
            });
        });
    }

    require(name) {
        if (this.logger.config.LOG_RESOLVER) {
            this.logger.log(`Resolver.require('${name}')`);
        }
        const paths = this.generateLookupPaths(name);
        return this.locateModule(name, paths, false);
    }

    requireSync(name) {
        if (this.logger.config.LOG_RESOLVER) {
            this.logger.log(`Resolver.requireSync('${name}')`);
        }
        const paths = this.generateLookupPaths(name);
        return this.locateModule(name, paths, true);
    }

    getFactoryPathInfo(name) {
        if (name.indexOf(':') === -1) {
            return {};
        }
        const parts = {
            pathForApp: this.pathForApp,
            pathForFramework: this.pathForFramework,
            moduleName: '',
            factoryName: '',
            namespace: this.namespace,
            modulePods: '',
            factoryPods: '',
            factorySubTree: '',
            isFromAddon: false,
            isDriven: false
        };

        let splitName = name.split(':');
        let factoryName = splitName[0];
        let moduleName = splitName[1];

        parts.modulePods = moduleName.split('/');
        parts.moduleName = parts.modulePods.pop();

        parts.isFromAddon = factoryName.indexOf('/') !== -1;
        parts.isDriven = factoryName.indexOf('driven') === 0;
        parts.factoryPods = factoryName.split('/');
        parts.factoryName = parts.factoryPods.pop();

        if (parts.isDriven) {
            parts.factoryPods[0] = this.pathForFramework;
        }

        if (this.factorySettings[parts.factoryName]) {
            parts.factorySubTree = this.factorySettings[parts.factoryName].subTree || parts.factoryName + 's';
        }

        parts.modulePods = parts.modulePods.join('/');
        parts.factoryPods = parts.factoryPods.join('/');
        return parts;
    }

    generateLookupPaths(name) {
        // –––––– factory type specific
        if (name.indexOf(':') !== -1) {
            const parts = this.getFactoryPathInfo(name);
            return Resolver.buildPaths(parts);
        }

        // –––––– relative
        if (name.indexOf('.') === 0 || name.indexOf('/') === 0) {
            name = path.join(this.pathForApp, name);
        }

        // –––––– driven
        if (name.indexOf('driven') === 0) {
            name = name.replace('driven', this.pathForFramework);
        }

        // –––––– and anything else
        return [`${name}.js`, name, path.join(this.pathForApp, `${name}.js`), path.join(this.pathForApp, name)];
    }


    // `adapter:foo` => /app/(<namespace>/)?(<sub-pod>/)?foo/adapter.js
    // `adapter:foo` => /app/(<namespace>/)?adapters/foo/adapter.js
    // `adapter:foo` => /app/(<namespace>/)?adapters/foo.js
    // `adapter:foo` => /app/(<sub-pod>/)?foo/adapter.js
    // `adapter:foo` => /app/adapters/foo.js
    // `adapter:foo/bar` => /app/(<namespace>/)?(<sub-pod>/)?foo/bar/adapter.js
    // `adapter:foo/bar` => /app/(<namespace>/)?adapters/foo/bar.js
    // `adapter:foo/bar` => /app/(<sub-pod>/)?foo/bar/adapter.js
    // `adapter:foo/bar` => /app/adapters/foo/bar.js
    // `driven/adapter:foo` => /driven/adapters/foo.js
    // `driven/adapter:foo/bar` => /driven/adapters/foo/bar.js
    static buildPaths(parts) {
        const paths = [];
        if (parts.isFromAddon) {
            const fullPath = Resolver.makePath([parts.factoryPods, parts.factoryName + 's', parts.modulePods, parts.moduleName]);
            paths.push(`${fullPath}.js`);
            paths.push(fullPath);
            return paths;
        }

        if (parts.namespace) {
            paths.push(Resolver.makePath([parts.pathForApp, parts.namespace, parts.factorySubTree, parts.modulePods, parts.moduleName, parts.factoryName + '.js']));
            paths.push(Resolver.makePath([parts.pathForApp, parts.namespace, parts.factorySubTree, parts.modulePods, parts.moduleName + '.js']));
            paths.push(Resolver.makePath([parts.pathForApp, parts.namespace, parts.factoryName + 's', parts.modulePods, parts.moduleName + '.js']));
            paths.push(Resolver.makePath([parts.pathForApp, parts.namespace, parts.factoryName + 's', parts.modulePods, parts.moduleName]));
        }

        paths.push(Resolver.makePath([parts.pathForApp, parts.factorySubTree, parts.modulePods, parts.moduleName, parts.factoryName + '.js']));
        paths.push(Resolver.makePath([parts.pathForApp, parts.factoryName + 's', parts.modulePods, parts.moduleName + '.js']));
        paths.push(Resolver.makePath([parts.pathForApp, parts.factoryName + 's', parts.modulePods, parts.moduleName]));

        // driven fallback
        paths.push(Resolver.makePath([parts.pathForFramework, parts.factoryName + 's', parts.modulePods, parts.moduleName + '.js']));
        paths.push(Resolver.makePath([parts.pathForFramework, parts.factoryName + 's', parts.modulePods, parts.moduleName]));

        return paths;
    }

    static makePath(parts) {
        const nonBlank = parts.filter(function(a) {
            return !!a;
        });

        return path.join.apply(null, nonBlank);
    }

    bundleModule(name, module) {
        const parts = this.getFactoryPathInfo(name);
        return {
            factoryName: parts.factoryName,
            moduleName: parts.moduleName,
            name: name,
            Module: module,
            options: this.factorySettings[parts.factoryName] || this.factorySettings.default
        };
    }


    locateModule(name, paths, sync) {
        if (sync) {
            let module;
            while(!module && paths.length) {
                module = locateAttemptSync(paths.shift(), this.logger);
            }
            return this.bundleModule(name, module);
        }

        return locateAttempt(paths.shift(), paths, this.logger)
            .then((module) => {
                return this.bundleModule(name, module);
            });
    }

};


function locateAttempt(reqPath, paths, logger) {
    const attempt = new Promise((resolve, reject) => {
        fs.exists(reqPath, (exists) => {
            if (exists) {
                if (logger.config.LOG_RESOLVER) {
                    logger.ok('Resolver#locateAttempt: (located)', reqPath);
                }
                resolve(require(reqPath));
            } else {
                if (logger.config.LOG_RESOLVER) {
                    logger.warn('Resolver#locateAttempt: (missing)', reqPath);
                }
                reject();
            }
        });
    });

    return attempt.catch((e) => {
        if (paths.length) {
            return locateAttempt(paths.shift(), paths, logger);
        }
        throw e;
    });

}

function locateAttemptSync(reqPath, logger) {
    if (fs.existsSync(reqPath)) {
        if (logger.config.LOG_RESOLVER) {
            logger.ok('Resolver#locateAttempt: (located)', reqPath);
        }
        return require(reqPath);
    }
    if (logger.config.LOG_RESOLVER) {
        logger.warn('Resolver#locateAttempt: (missing)', reqPath);
    }
    return false;
}
