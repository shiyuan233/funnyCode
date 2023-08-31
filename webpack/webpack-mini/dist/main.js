(function(moduleInfo){
      let exports = {};
      function require(modulePath){
        function newRequire(path){
          return require(moduleInfo[modulePath]["dependence"][path])
        }
        (function(require,code){
          eval(code)
        })(newRequire,moduleInfo[modulePath].code)
        return exports
      }
      require('./src/index.js')
      
    })({"./src/index.js":{"modulePath":"./src/index.js","dependence":{"./other.js":"./src\\other.js"},"code":"\"use strict\";\n\nvar _other = _interopRequireDefault(require(\"./other.js\"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nconsole.log(_other[\"default\"]);"},"./src\\other.js":{"modulePath":"./src\\other.js","dependence":{"./a.js":"./src\\a.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _a = _interopRequireDefault(require(\"./a.js\"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nvar str = 'hello webpack' + _a[\"default\"];\nvar _default = str;\nexports[\"default\"] = _default;"},"./src\\a.js":{"modulePath":"./src\\a.js","dependence":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _default = ' 但这只是个简易版本';\nexports[\"default\"] = _default;"}})