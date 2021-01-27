(window.webpackJsonp = window.webpackJsonp || []).push([
  [0],
  {
    1093: function (module, exports, __webpack_require__) {
      "use strict";
      __webpack_require__(6),
        __webpack_require__(55),
        __webpack_require__(44),
        __webpack_require__(35),
        __webpack_require__(46),
        __webpack_require__(1094),
        __webpack_require__(1095),
        __webpack_require__(8),
        __webpack_require__(45);
      var _clientApi = __webpack_require__(53),
        _clientLogger = __webpack_require__(33),
        _configFilename = __webpack_require__(1114);
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          enumerableOnly &&
            (symbols = symbols.filter(function (sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            })),
            keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2
            ? ownKeys(Object(source), !0).forEach(function (key) {
                _defineProperty(target, key, source[key]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
              )
            : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(
                  target,
                  key,
                  Object.getOwnPropertyDescriptor(source, key)
                );
              });
        }
        return target;
      }
      function _defineProperty(obj, key, value) {
        return (
          key in obj
            ? Object.defineProperty(obj, key, {
                value: value,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (obj[key] = value),
          obj
        );
      }
      (_configFilename.args || _configFilename.argTypes) &&
        _clientLogger.logger.warn(
          "Invalid args/argTypes in config, ignoring.",
          JSON.stringify({
            args: _configFilename.args,
            argTypes: _configFilename.argTypes,
          })
        ),
        _configFilename.decorators &&
          _configFilename.decorators.forEach(function (decorator) {
            return (0, _clientApi.addDecorator)(decorator, !1);
          }),
        _configFilename.loaders &&
          _configFilename.loaders.forEach(function (loader) {
            return (0, _clientApi.addLoader)(loader, !1);
          }),
        (_configFilename.parameters ||
          _configFilename.globals ||
          _configFilename.globalTypes) &&
          (0, _clientApi.addParameters)(
            _objectSpread(
              _objectSpread({}, _configFilename.parameters),
              {},
              {
                globals: _configFilename.globals,
                globalTypes: _configFilename.globalTypes,
              }
            ),
            !1
          ),
        _configFilename.argTypesEnhancers &&
          _configFilename.argTypesEnhancers.forEach(function (enhancer) {
            return (0, _clientApi.addArgTypesEnhancer)(enhancer);
          });
    },
    1097: function (module, exports, __webpack_require__) {
      "use strict";
      (function (module) {
        (0, __webpack_require__(211).configure)(
          [__webpack_require__(1098), __webpack_require__(1105)],
          module,
          !1
        );
      }.call(this, __webpack_require__(81)(module)));
    },
    1098: function (module, exports, __webpack_require__) {
      var map = {
        "./documentation/Design System/DesignSystem.stories.mdx": 1099,
        "./documentation/Forms/FormDBSchema.stories.mdx": 1100,
        "./documentation/Forms/FormViewer.stories.mdx": 1101,
        "./documentation/Forms/FormsDesign.stories.mdx": 1102,
        "./documentation/Forms/FormsIntro.stories.mdx": 1103,
        "./documentation/Introduction.stories.mdx": 1104,
      };
      function webpackContext(req) {
        var id = webpackContextResolve(req);
        return __webpack_require__(id);
      }
      function webpackContextResolve(req) {
        if (!__webpack_require__.o(map, req)) {
          var e = new Error("Cannot find module '" + req + "'");
          throw ((e.code = "MODULE_NOT_FOUND"), e);
        }
        return map[req];
      }
      (webpackContext.keys = function webpackContextKeys() {
        return Object.keys(map);
      }),
        (webpackContext.resolve = webpackContextResolve),
        (module.exports = webpackContext),
        (webpackContext.id = 1098);
    },
    1099: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Design System/Docs: Intro to Design System",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "cds-design-system-documentation" },
            "CDS Design System Documentation"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "*",
              "Note: This is work-in-progress"
            )
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = {
          title: "Design System/Docs: Intro to Design System",
          includeStories: ["__page"],
        },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1100: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Forms/Docs: Form Builder Database Schema",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "form-builder-schema-specification" },
            "Form Builder Schema Specification"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "*",
              "Note: This is work-in-progress"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h2",
            { id: "data-model-in-json" },
            "Data model in JSON"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "Here's a data model JSON sample, which is used to create the DB schema for the Form Builder."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "teamNameEn": "",\n  "teamNameFr": "",\n  "teamBrand": "",\n  "teamUsers": [\n    {\n      "userId": "",\n      "userName": "",\n      "userEmail": "",\n      "userRole": "",\n      "active": true\n    }\n  ],\n  "programs": [],\n  "submissionSettings": {\n    "notifyAPI": "",\n    "notifyEmail": "",\n    "notifyTemplate": ""\n  },\n  "awsSettings": {\n    "databaseService": "",\n    "loginService": "",\n    "emailService": "",\n    "reliabilityService": ""\n  },\n  "teamForms": [\n    {\n      "formId": 1,\n      "program": "",\n      "internalTitleEn": "",\n      "internalTitleFr": "",\n      "publishingStatus": true,\n      "uniqueURLEn": "",\n      "uniqueURLFr": "",\n      "formVersion": [\n        {\n          "version": 1,\n          "titleEn": "",\n          "titleFr": "",\n\n          "questions": [\n            {\n              "sequence": 1,\n              "type": "textField",\n              "protected": false,\n              "object": {\n                "titleEn": "",\n                "titleFr": "",\n                "placeholderEn": "",\n                "placeholderFr": "",\n                "descriptionEn": "",\n                "descriptionFr": "",\n                "charLimit": 100,\n                "required": true\n              }\n            },\n            {\n              "sequence": 2,\n              "type": "textArea",\n              "protected": false,\n              "object": {\n                "titleEn": "",\n                "titleFr": "",\n                "placeholderEn": "",\n                "placeholderFr": "",\n                "descriptionEn": "",\n                "descriptionFr": "",\n                "charLimit": 100,\n                "required": true\n              }\n            },\n            {\n              "sequence": 3,\n              "type": "dropdown",\n              "protected": false,\n              "object": {\n                "titleEn": "",\n                "titleFr": "",\n                "options": [{ "key": "", "value": "", "selected": true }],\n                "required": true\n              }\n            },\n            {\n              "sequence": 4,\n              "type": "radio",\n              "protected": false,\n              "object": {\n                "titleEn": "",\n                "titleFr": "",\n                "options": [{ "key": "", "value": "", "selected": true }],\n                "descriptionEn": "",\n                "descriptionFr": "",\n                "required": true\n              }\n            },\n            {\n              "sequence": 5,\n              "type": "checkbox",\n              "protected": false,\n              "object": {\n                "titleEn": "",\n                "titleFr": "",\n                "options": [{ "key": "", "value": "", "selected": true }],\n                "descriptionEn": "",\n                "descriptionFr": "",\n                "charLimit": 100,\n                "required": true\n              }\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h2",
            { id: "database-schema" },
            "Database schema"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "Coming soon..."
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = {
          title: "Forms/Docs: Form Builder Database Schema",
          includeStories: ["__page"],
        },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1101: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Forms/Docs: Form Viewer JSON",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "form-viewer-json-specification" },
            "Form Viewer JSON Specification"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h2",
            { id: "object-model-skeleton" },
            "Object model skeleton"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "The form viewer expects a JSON with the following structure."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id":"1234",\n  "version": 1,\n  "titleEn": "",\n  "titleFr": "",\n  "submission": {\n    "email": ""\n  },\n  "layout": [ ... ],\n  "startPage": {},\n  "endPage": {},\n  "elements":[ ... ]\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "There are 2 main parts to the structure:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "ol",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ol" },
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "Form object in the context of Form Viewer"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "id"
                ),
                ": Unique identifier for the form (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "version"
                ),
                ": Defines the static version of the form (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "int"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "titleEn/Fr"
                ),
                ": The displayed title of the form to the user (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "layout"
                ),
                ": The order of the questions and/or page elements identified by id (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "array"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "elements"
                ),
                ": An array of question and page display objects (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "array"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "startPage"
                ),
                ": Defines what appears on the first, intro page"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "endPage"
                ),
                ": Defines what appears on the confirmation page, after the form was submitted"
              )
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ol" },
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "Form questions and page elements to be rendered"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "id"
                ),
                ": The unique id for the object (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "type"
                ),
                ": The object question or page element type (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "enum"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "properties"
                ),
                ": Object containing the question or page element properties (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "object"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ For example a question type could include the following properties:"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ ",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "titleEn / titleFr"
                ),
                ": Element title (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ ",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "placeholderEn / placeholderFr"
                ),
                ": Text that will appear in the text input field as a placeholder (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ ",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "description"
                ),
                ": Secondary paragraph of question or element that provides additional context beyond the title (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "string"
                ),
                ")"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ ",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "charLimit"
                ),
                ": The maximum number of characters that can be submitted through the input"
              ),
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "p",
                { parentName: "li" },
                "​ ",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "required"
                ),
                ": A boolean flag identifying if the question element is a mandatory for submission (",
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  "inlineCode",
                  { parentName: "p" },
                  "bool"
                ),
                ")"
              )
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "Example:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id": "1234",\n  "version": 1,\n  "titleEn": "CDS Intake Form",\n  "titleFr": "SNC Formulaire d\'admission",\n  "layout": ["1", "5", "6", "7"],\n  "endPage": {\n    "referrerUrlEn": "https://digital.canada.ca/",\n    "referrerUrlFr": "https://numerique.canada.ca/"\n  },\n  "elements": [\n    {\n      "id": "1",\n      "type": "textField",\n      "properties": {\n        "titleEn": "What is your full name?",\n        "titleFr": "Quel est votre nom complet?",\n        "placeholderEn": "",\n        "placeholderFr": "",\n        "description": "",\n        "charLimit": 100,\n        "required": true\n      }\n    },\n    {\n      "id": "5",\n      "type": "textArea",\n      "properties": {\n        "titleEn": "What is the problem you are facing",\n        "titleFr": "Quel est le problème auquel vous êtes confronté?",\n        "placeholderEn": "",\n        "placeholderFr": "",\n        "description": "",\n        "charLimit": 100,\n        "required": false\n      }\n    },\n    {\n      "id": "6",\n      "type": "textField",\n      "properties": {\n        "titleEn": "What is your timeline?",\n        "titleFr": "Quel est votre calendrier?",\n        "placeholderEn": "",\n        "placeholderFr": "",\n        "description": "",\n        "charLimit": 100,\n        "required": false\n      }\n    },\n    {\n      "id": "7",\n      "type": "textArea",\n      "properties": {\n        "titleEn": "How did you hear about us?",\n        "titleFr": "Comment avez-vous entendu parler de nous?",\n        "placeholderEn": "",\n        "placeholderFr": "",\n        "description": "",\n        "charLimit": 100,\n        "required": false\n      }\n    }\n  ]\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h2",
            { id: "question-types" },
            "Question Types"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "text-field" },
            "Text Field"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A simple text input where the ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "title"
            ),
            " property is used as the input's label."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here as an example"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id": "123456789",\n  "type": "textField",\n  "properties": {\n    "titleEn": "string",\n    "titleFr": "string",\n    "placehoderEn": "string",\n    "placeholderFr": "string",\n    "descriptionEn": "string",\n    "descriptionFr": "string",\n    "charLimit": 100,\n    "required": false\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "placeholderEn / placeholderFr"
            ),
            ": Text that will appear in the text input field as a placeholder (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "charLimit"
            ),
            ": The maximum number of characters that can be submitted through the input"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "text-area" },
            "Text Area"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A simple muli-line text input where the ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "title"
            ),
            " property is used as the input's label."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here as an example"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id": "123456789",\n  "type": "textArea",\n  "properties": {\n    "titleEn": "string",\n    "titleFr": "string",\n    "placehoderEn": "string",\n    "placeholderFr": "string",\n    "descriptionEn": "string",\n    "descriptionFr": "string",\n    "charLimit": 100,\n    "required": false\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "placeholderEn / placeholderFr"
            ),
            ": Text that will appear in the text input field as a placeholder (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "charLimit"
            ),
            ": The maximum number of characters that can be submitted through the input"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "dropdown--select-menu" },
            "Dropdown / Select Menu"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A dropdown / select menu element that allows for a single selection."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered componenet here"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id":"12345678",\n  "type":"dropdown",\n  "properties":{\n    "titleEn":"string",\n    "titleFr":"string",\n    "descriptionEn":"string",\n    "descriptionFr":"string",\n    "required": false,\n    "choices":[\n      {\n        "en":"string",\n        "fr":"string"\n      }, ...\n    ]\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "choices"
            ),
            ": An array of objects containing ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "en"
            ),
            " and ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "fr"
            ),
            " keys that represent the dropdown / select menu options to be displayed to users. (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "array"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "radio-buttons" },
            "Radio Buttons"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A radio button selection group that allows for a single selection"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id":"123456789",\n  "type":"radio",\n  "properties":{\n    "titleEn":"string",\n    "titleFr":"string",\n    "descriptionEn":"string",\n    "descriptionFr":"string",\n    "required":false,\n    "choices":[\n      {\n        "en":"string",\n        "fr":"string"\n      }, ...\n    ]\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "choices"
            ),
            ": An array of objects containing ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "en"
            ),
            " and ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "fr"
            ),
            " keys that represent the dropdown / select menu options to be displayed to users. (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "array"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "checkboxes" },
            "Checkboxes"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A checkbox selection group that allows for a single or multiple selection"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id":"123456789",\n  "type":"checkbox",\n  "properties":{\n    "titleEn":"string",\n    "titleFr":"string",\n    "descriptionEn":"string",\n    "descriptionFr":"string",\n    "required":false,\n    "choices":[\n      {\n        "en":"string",\n        "fr":"string"\n      }, ...\n    ]\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "choices"
            ),
            ": An array of objects containing ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "en"
            ),
            " and ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "fr"
            ),
            " keys that represent the dropdown / select menu options to be displayed to users. (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "array"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "file-upload" },
            "File upload"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "A browser-native file upload field"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here as an example"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id": 9,\n  "type": "fileInput",\n  "properties": {\n    "titleEn": "Upload a document",\n    "titleFr": "Télécharger le document",\n    "descriptionEn": "",\n    "descriptionFr": "",\n    "fileType": "image/*,.pdf",\n    "required": false\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "fileType"
            ),
            ": The type of file, e.g. ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              ".pdf"
            ),
            ". More info about this ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "a",
              _extends(
                { parentName: "p" },
                {
                  href:
                    "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file",
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                }
              ),
              "browser-native HTML type"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "plain-text" },
            "Plain text"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "An option to add plain text to the form"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "Add rendered component here as an example"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, { className: "language-json" }),
              '{\n  "id": 1,\n  "type": "plainText",\n  "properties": {\n    "titleEn": "Text Heading",\n    "titleFr": "",\n    "placeholderEn": "",\n    "placeholderFr": "",\n    "descriptionEn": "Plain text paragraph",\n    "descriptionFr": "",\n    "charLimit": 1000,\n    "required": false\n  }\n}\n'
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "id"
            ),
            ": The unique id for the object (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "titleEn / titleFr"
            ),
            ": Input label (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "descriptionEn / descriptionFr"
            ),
            ": Secondary paragraph/text of a question or element that provides additional context beyond the label ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "string"
            ),
            ")"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "charLimit"
            ),
            ": The maximum number of characters that can be submitted through the input"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "required"
            ),
            ": A boolean flag identifying if the question element is a mandatory for submission (",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "inlineCode",
              { parentName: "p" },
              "bool"
            ),
            ")"
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = {
          title: "Forms/Docs: Form Viewer JSON",
          includeStories: ["__page"],
        },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1102: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Forms/Docs: Design Documentation",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "design-documentation" },
            "Design Documentation"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "*",
              "Note: This is work-in-progress and will showcase Content guides etc"
            )
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = {
          title: "Forms/Docs: Design Documentation",
          includeStories: ["__page"],
        },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1103: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Forms/Docs: Intro to Forms",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "forms-documentation" },
            "Forms Documentation"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "*",
              "Note: This is work-in-progress"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)("hr", null),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "design-documentation" },
            "Design Documentation"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "ul",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "TBD"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)("hr", null),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "development-documentation" },
            "Development Documentation"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "ul",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Architecture"
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Tech stack"
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Data Models"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "creating-components" },
            "Creating components"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "We use a micro-generator tool called ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "a",
              _extends(
                { parentName: "p" },
                {
                  href: "https://plopjs.com/documentation/#your-first-plopfile",
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                }
              ),
              "plop"
            ),
            " to automatically generate React components for us."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "To generate a component with prompts:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, {}),
              "npm run create component\n"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "To generate a component when you know its name and html tag:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "pre",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "code",
              _extends({ parentName: "pre" }, {}),
              "npm run create component MyComponentTest div\n"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "Read more about WebAPI types, like ",
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "a",
              _extends(
                { parentName: "p" },
                {
                  href:
                    "https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement",
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                }
              ),
              "HTMLDivElement"
            )
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = {
          title: "Forms/Docs: Intro to Forms",
          includeStories: ["__page"],
        },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1104: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "__page", function () {
          return __page;
        });
      __webpack_require__(11),
        __webpack_require__(3),
        __webpack_require__(8),
        __webpack_require__(0);
      var _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1),
        _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
          36
        );
      function _extends() {
        return (_extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];
              for (var key in source)
                Object.prototype.hasOwnProperty.call(source, key) &&
                  (target[key] = source[key]);
            }
            return target;
          }).apply(this, arguments);
      }
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var layoutProps = {};
      function MDXContent(_ref) {
        var components = _ref.components,
          props = _objectWithoutProperties(_ref, ["components"]);
        return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
          "wrapper",
          _extends({}, layoutProps, props, {
            components: components,
            mdxType: "MDXLayout",
          }),
          Object(
            _mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx
          )(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.Meta, {
            title: "Introduction",
            mdxType: "Meta",
          }),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h1",
            { id: "welcome-to-cds-platform-storybook" },
            "Welcome to CDS Platform Storybook"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "blockquote",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "p",
              { parentName: "blockquote" },
              "*",
              "Note: This is work-in-progress"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "overview" },
            "Overview"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "This is an effort to identify the UI inventory used by CDS Platform products and showcase it in Storybook."
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "Some of the goals for this inventory are:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "ul",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Be a single source of truth for both Design and Development when it comes to best practices in UI."
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Serve as a testing tool, where designers can compare their Figma creations with what was built, and developers can check if their apps generate the correct HTML/CSS (no matter the tech-stack used)"
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "etc"
            )
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "h3",
            { id: "features" },
            "Features"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "p",
            null,
            "In addition to having an overview of the Design System, the inventory will show:"
          ),
          Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
            "ul",
            null,
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "The generated UI element in HTML/CSS"
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Preview of that element in Figma via an ",
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "a",
                _extends(
                  { parentName: "li" },
                  {
                    href: "https://github.com/pocka/storybook-addon-designs",
                    target: "_blank",
                    rel: "nofollow noopener noreferrer",
                  }
                ),
                "integrated addon"
              )
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Accessibility review via an ",
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "a",
                _extends(
                  { parentName: "li" },
                  {
                    href:
                      "https://github.com/storybookjs/storybook/tree/master/addons/a11y",
                    target: "_blank",
                    rel: "nofollow noopener noreferrer",
                  }
                ),
                "integrated addon"
              )
            ),
            Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
              "li",
              { parentName: "ul" },
              "Code source in HTML via ",
              Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                "a",
                _extends(
                  { parentName: "li" },
                  {
                    href:
                      "https://storybook.js.org/docs/react/writing-docs/introduction",
                    target: "_blank",
                    rel: "nofollow noopener noreferrer",
                  }
                ),
                "storybook docs essential addon"
              )
            )
          )
        );
      }
      (MDXContent.displayName = "MDXContent"), (MDXContent.isMDXComponent = !0);
      var __page = function __page() {
        throw new Error("Docs-only story");
      };
      __page.parameters = { docsOnly: !0 };
      var componentMeta = { title: "Introduction", includeStories: ["__page"] },
        mdxStoryNameToKey = {};
      (componentMeta.parameters = componentMeta.parameters || {}),
        (componentMeta.parameters.docs = Object.assign(
          {},
          componentMeta.parameters.docs || {},
          {
            page: function page() {
              return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                _storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_5__.AddContext,
                {
                  mdxStoryNameToKey: mdxStoryNameToKey,
                  mdxComponentMeta: componentMeta,
                },
                Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_4__.mdx)(
                  MDXContent,
                  null
                )
              );
            },
          }
        )),
        (__webpack_exports__.default = componentMeta);
    },
    1105: function (module, exports, __webpack_require__) {
      var map = {
        "./components/forms/Alert/Alert.stories.tsx": 1115,
        "./components/forms/Button/Button.stories.tsx": 1106,
        "./components/forms/Checkbox/Checkbox.stories.tsx": 1116,
        "./components/forms/Dropdown/Dropdown.stories.tsx": 1117,
        "./components/forms/ErrorMessage/ErrorMessage.stories.tsx": 1107,
        "./components/forms/Fieldset/Fieldset.stories.tsx": 1118,
        "./components/forms/FileInput/FileInput.stories.tsx": 1119,
        "./components/forms/FormGroup/FormGroup.stories.tsx": 1120,
        "./components/forms/Label/Label.stories.tsx": 1108,
        "./components/forms/Radio/Radio.stories.tsx": 1121,
        "./components/forms/TextArea/TextArea.stories.tsx": 1122,
        "./components/forms/TextInput/TextInput.stories.tsx": 1109,
      };
      function webpackContext(req) {
        var id = webpackContextResolve(req);
        return __webpack_require__(id);
      }
      function webpackContextResolve(req) {
        if (!__webpack_require__.o(map, req)) {
          var e = new Error("Cannot find module '" + req + "'");
          throw ((e.code = "MODULE_NOT_FOUND"), e);
        }
        return map[req];
      }
      (webpackContext.keys = function webpackContextKeys() {
        return Object.keys(map);
      }),
        (webpackContext.resolve = webpackContextResolve),
        (module.exports = webpackContext),
        (webpackContext.id = 1105);
    },
    1106: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultButton",
          function () {
            return defaultButton;
          }
        ),
        __webpack_require__.d(
          __webpack_exports__,
          "secondaryButton",
          function () {
            return secondaryButton;
          }
        );
      __webpack_require__(3);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          2
        ),
        _Button__WEBPACK_IMPORTED_MODULE_3__ =
          (__webpack_require__(0), __webpack_require__(131));
      __webpack_exports__.default = {
        title: "Forms/Button",
        component: _Button__WEBPACK_IMPORTED_MODULE_3__.a,
      };
      var defaultButton = function defaultButton() {
        return Object(
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx
        )(_Button__WEBPACK_IMPORTED_MODULE_3__.a, {
          type: "button",
          children: "Click Me",
        });
      };
      defaultButton.displayName = "defaultButton";
      var secondaryButton = function secondaryButton() {
        return Object(
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx
        )(_Button__WEBPACK_IMPORTED_MODULE_3__.a, {
          type: "button",
          secondary: !0,
          children: "Click Me",
        });
      };
      (secondaryButton.displayName = "secondaryButton"),
        (defaultButton.parameters = {
          docs: {
            source: {
              code:
                '<button type="button" class="gc-button button">Next</button>',
            },
          },
        }),
        (defaultButton.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Button type="button">Click Me</Button>\n)',
            },
          },
          defaultButton.parameters
        )),
        (secondaryButton.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Button type="button" secondary={true}>\n    Click Me\n  </Button>\n)',
            },
          },
          secondaryButton.parameters
        ));
    },
    1107: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultErrorMessage",
          function () {
            return defaultErrorMessage;
          }
        );
      __webpack_require__(3);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          2
        ),
        _ErrorMessage__WEBPACK_IMPORTED_MODULE_3__ =
          (__webpack_require__(0), __webpack_require__(163));
      __webpack_exports__.default = {
        title: "Forms/ErrorMessage",
        component: _ErrorMessage__WEBPACK_IMPORTED_MODULE_3__.a,
        parameters: { info: "ErrorMessage component" },
      };
      var defaultErrorMessage = function defaultErrorMessage() {
        return Object(
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx
        )(_ErrorMessage__WEBPACK_IMPORTED_MODULE_3__.a, {
          children: "Helpful error message",
        });
      };
      (defaultErrorMessage.displayName = "defaultErrorMessage"),
        (defaultErrorMessage.parameters = Object.assign(
          {
            storySource: {
              source:
                "(): React.ReactElement => (\n  <ErrorMessage>Helpful error message</ErrorMessage>\n)",
            },
          },
          defaultErrorMessage.parameters
        ));
    },
    1108: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "defaultLabel", function () {
          return defaultLabel;
        });
      __webpack_require__(3);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          2
        ),
        _Label__WEBPACK_IMPORTED_MODULE_3__ =
          (__webpack_require__(0), __webpack_require__(66));
      __webpack_exports__.default = {
        title: "Forms/Label",
        component: _Label__WEBPACK_IMPORTED_MODULE_3__.a,
        parameters: { info: "Label component" },
      };
      var defaultLabel = function defaultLabel() {
        return Object(
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx
        )(_Label__WEBPACK_IMPORTED_MODULE_3__.a, {
          htmlFor: "testInput",
          children: "Text input label",
        });
      };
      (defaultLabel.displayName = "defaultLabel"),
        (defaultLabel.parameters = {
          docs: {
            source: {
              code:
                '<label class="gc-input-label">Text Input<input type="text" name="" class="gc-input-text"></label>',
            },
          },
        }),
        (defaultLabel.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Label htmlFor="testInput">Text input label</Label>\n)',
            },
          },
          defaultLabel.parameters
        ));
    },
    1109: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultTextInput",
          function () {
            return defaultTextInput;
          }
        );
      __webpack_require__(3);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          2
        ),
        _TextInput__WEBPACK_IMPORTED_MODULE_3__ =
          (__webpack_require__(0), __webpack_require__(77));
      __webpack_exports__.default = {
        title: "Forms/TextInput",
        component: _TextInput__WEBPACK_IMPORTED_MODULE_3__.a,
        parameters: { info: "TextInput component" },
      };
      var defaultTextInput = function defaultTextInput() {
        return Object(
          react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx
        )(_TextInput__WEBPACK_IMPORTED_MODULE_3__.a, {
          id: "input-type-text",
          name: "input-type-text",
          type: "text",
        });
      };
      (defaultTextInput.displayName = "defaultTextInput"),
        (defaultTextInput.parameters = {
          docs: {
            source: {
              code:
                '<label class="gc-input-label">Text Input<input type="text" name="" class="gc-input-text"></label>',
            },
          },
        }),
        (defaultTextInput.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextInput id="input-type-text" name="input-type-text" type="text" />\n)',
            },
          },
          defaultTextInput.parameters
        ));
    },
    1114: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "parameters", function () {
          return parameters;
        });
      var jsx_runtime = __webpack_require__(2),
        react = __webpack_require__(0),
        react_default = __webpack_require__.n(react),
        client = __webpack_require__(211),
        injectStylesIntoStyleTag = __webpack_require__(482),
        injectStylesIntoStyleTag_default = __webpack_require__.n(
          injectStylesIntoStyleTag
        ),
        app = __webpack_require__(321),
        options = { insert: "head", singleton: !1 },
        Layout_Layout =
          (injectStylesIntoStyleTag_default()(app.a, options),
          app.a.locals,
          function Layout(_ref) {
            var children = _ref.children;
            return Object(jsx_runtime.jsx)(react_default.a.Fragment, {
              children: children,
            });
          });
      (Layout_Layout.displayName = "Layout"),
        (Layout_Layout.__docgenInfo = {
          description: "",
          methods: [],
          displayName: "Layout",
        });
      var _storybook_Layout = Layout_Layout;
      "undefined" != typeof STORYBOOK_REACT_CLASSES &&
        (STORYBOOK_REACT_CLASSES[".storybook/Layout.js"] = {
          name: "Layout",
          docgenInfo: Layout_Layout.__docgenInfo,
          path: ".storybook/Layout.js",
        });
      var parameters = { actions: { argTypesRegex: "^on[A-Z].*" } };
      Object(client.addDecorator)(function (storyFn) {
        return Object(jsx_runtime.jsx)(_storybook_Layout, {
          children: storyFn(),
        });
      });
    },
    1115: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "success", function () {
          return Alert_stories_success;
        }),
        __webpack_require__.d(__webpack_exports__, "warning", function () {
          return Alert_stories_warning;
        }),
        __webpack_require__.d(__webpack_exports__, "error", function () {
          return Alert_stories_error;
        }),
        __webpack_require__.d(__webpack_exports__, "info", function () {
          return Alert_stories_info;
        }),
        __webpack_require__.d(__webpack_exports__, "slim", function () {
          return Alert_stories_slim;
        }),
        __webpack_require__.d(__webpack_exports__, "noIcon", function () {
          return Alert_stories_noIcon;
        }),
        __webpack_require__.d(__webpack_exports__, "slimNoIcon", function () {
          return Alert_stories_slimNoIcon;
        }),
        __webpack_require__.d(__webpack_exports__, "withCTA", function () {
          return Alert_stories_withCTA;
        });
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(11),
          __webpack_require__(8),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames);
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var Alert_Alert = function Alert(_ref) {
        var type = _ref.type,
          heading = _ref.heading,
          cta = _ref.cta,
          children = _ref.children,
          slim = _ref.slim,
          noIcon = _ref.noIcon,
          className = _ref.className,
          validation = _ref.validation,
          props = _objectWithoutProperties(_ref, [
            "type",
            "heading",
            "cta",
            "children",
            "slim",
            "noIcon",
            "className",
            "validation",
          ]),
          classes = classnames_default()(
            "gc-alert",
            {
              "gc-alert--success": "success" === type,
              "gc-alert--warning": "warning" === type,
              "gc-alert--error": "error" === type,
              "gc-alert--info": "info" === type,
              "gc-alert--slim": slim,
              "gc-alert--no-icon": noIcon,
              "gc-alert--validation": validation,
            },
            className
          );
        return Object(jsx_runtime.jsxs)(
          "div",
          Object.assign({ className: classes, "data-testid": "alert" }, props, {
            children: [
              Object(jsx_runtime.jsxs)("div", {
                className: "gc-alert__body",
                children: [
                  heading &&
                    Object(jsx_runtime.jsx)("h3", {
                      className: "gc-alert__heading",
                      children: heading,
                    }),
                  children &&
                    (validation
                      ? children
                      : Object(jsx_runtime.jsx)("p", {
                          className: "gc-alert__text",
                          children: children,
                        })),
                ],
              }),
              cta && Object(jsx_runtime.jsx)("div", { children: cta }),
            ],
          })
        );
      };
      Alert_Alert.displayName = "Alert";
      try {
        (Alert_Alert.displayName = "Alert"),
          (Alert_Alert.__docgenInfo = {
            description: "",
            displayName: "Alert",
            props: {
              type: {
                defaultValue: null,
                description: "",
                name: "type",
                required: !0,
                type: {
                  name: "enum",
                  value: [
                    { value: '"success"' },
                    { value: '"warning"' },
                    { value: '"error"' },
                    { value: '"info"' },
                  ],
                },
              },
              heading: {
                defaultValue: null,
                description: "",
                name: "heading",
                required: !1,
                type: { name: "ReactNode" },
              },
              cta: {
                defaultValue: null,
                description: "",
                name: "cta",
                required: !1,
                type: { name: "ReactNode" },
              },
              slim: {
                defaultValue: null,
                description: "",
                name: "slim",
                required: !1,
                type: { name: "boolean" },
              },
              noIcon: {
                defaultValue: null,
                description: "",
                name: "noIcon",
                required: !1,
                type: { name: "boolean" },
              },
              validation: {
                defaultValue: null,
                description: "",
                name: "validation",
                required: !1,
                type: { name: "boolean" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Alert/Alert.tsx#Alert"
            ] = {
              docgenInfo: Alert_Alert.__docgenInfo,
              name: "Alert",
              path: "components/forms/Alert/Alert.tsx#Alert",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      var Button = __webpack_require__(131),
        testText =
          ((__webpack_exports__.default = {
            title: "Forms/Alert",
            component: Alert_Alert,
          }),
          Object(jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
              "Lorem ipsum dolor sit amet, ",
              Object(jsx_runtime.jsx)("a", {
                href: "#test",
                children: "consectetur adipiscing",
              }),
              " elit, sed do eiusmod.",
            ],
          })),
        Alert_stories_success = function success() {
          return Object(jsx_runtime.jsx)(Alert_Alert, {
            type: "success",
            heading: "Success status",
            children: testText,
          });
        };
      Alert_stories_success.displayName = "success";
      var Alert_stories_warning = function warning() {
        return Object(jsx_runtime.jsx)(Alert_Alert, {
          type: "warning",
          heading: "Warning status",
          children: testText,
        });
      };
      Alert_stories_warning.displayName = "warning";
      var Alert_stories_error = function error() {
        return Object(jsx_runtime.jsx)(Alert_Alert, {
          type: "error",
          heading: "Error status",
          children: testText,
        });
      };
      Alert_stories_error.displayName = "error";
      var Alert_stories_info = function info() {
        return Object(jsx_runtime.jsx)(Alert_Alert, {
          type: "info",
          heading: "Informative status",
          children: testText,
        });
      };
      Alert_stories_info.displayName = "info";
      var Alert_stories_slim = function slim() {
          return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "success",
                slim: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "warning",
                slim: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "error",
                slim: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "info",
                slim: !0,
                children: testText,
              }),
            ],
          });
        },
        Alert_stories_noIcon = function noIcon() {
          return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "success",
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "warning",
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "error",
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "info",
                noIcon: !0,
                children: testText,
              }),
            ],
          });
        },
        Alert_stories_slimNoIcon = function slimNoIcon() {
          return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "success",
                slim: !0,
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "warning",
                slim: !0,
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "error",
                slim: !0,
                noIcon: !0,
                children: testText,
              }),
              Object(jsx_runtime.jsx)(Alert_Alert, {
                type: "info",
                slim: !0,
                noIcon: !0,
                children: testText,
              }),
            ],
          });
        },
        Alert_stories_withCTA = function withCTA() {
          return Object(jsx_runtime.jsx)(Alert_Alert, {
            type: "warning",
            heading: "Warning status",
            cta: Object(jsx_runtime.jsx)(Button.a, {
              type: "button",
              children: "Click here",
            }),
            children: testText,
          });
        };
      (Alert_stories_withCTA.displayName = "withCTA"),
        (Alert_stories_success.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Alert type="success" heading="Success status">\n    {testText}\n  </Alert>\n)',
            },
          },
          Alert_stories_success.parameters
        )),
        (Alert_stories_warning.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Alert type="warning" heading="Warning status">\n    {testText}\n  </Alert>\n)',
            },
          },
          Alert_stories_warning.parameters
        )),
        (Alert_stories_error.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Alert type="error" heading="Error status">\n    {testText}\n  </Alert>\n)',
            },
          },
          Alert_stories_error.parameters
        )),
        (Alert_stories_info.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Alert type="info" heading="Informative status">\n    {testText}\n  </Alert>\n)',
            },
          },
          Alert_stories_info.parameters
        )),
        (Alert_stories_slim.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <>\n    <Alert type="success" slim>\n      {testText}\n    </Alert>\n    <Alert type="warning" slim>\n      {testText}\n    </Alert>\n    <Alert type="error" slim>\n      {testText}\n    </Alert>\n    <Alert type="info" slim>\n      {testText}\n    </Alert>\n  </>\n)',
            },
          },
          Alert_stories_slim.parameters
        )),
        (Alert_stories_noIcon.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <>\n    <Alert type="success" noIcon>\n      {testText}\n    </Alert>\n    <Alert type="warning" noIcon>\n      {testText}\n    </Alert>\n    <Alert type="error" noIcon>\n      {testText}\n    </Alert>\n    <Alert type="info" noIcon>\n      {testText}\n    </Alert>\n  </>\n)',
            },
          },
          Alert_stories_noIcon.parameters
        )),
        (Alert_stories_slimNoIcon.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <>\n    <Alert type="success" slim noIcon>\n      {testText}\n    </Alert>\n    <Alert type="warning" slim noIcon>\n      {testText}\n    </Alert>\n    <Alert type="error" slim noIcon>\n      {testText}\n    </Alert>\n    <Alert type="info" slim noIcon>\n      {testText}\n    </Alert>\n  </>\n)',
            },
          },
          Alert_stories_slimNoIcon.parameters
        )),
        (Alert_stories_withCTA.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Alert\n    type="warning"\n    heading="Warning status"\n    cta={<Button type="button">Click here</Button>}\n  >\n    {testText}\n  </Alert>\n)',
            },
          },
          Alert_stories_withCTA.parameters
        ));
    },
    1116: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultCheckbox",
          function () {
            return Checkbox_stories_defaultCheckbox;
          }
        );
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(11),
          __webpack_require__(7),
          __webpack_require__(8),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames);
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var Checkbox_Checkbox = function Checkbox(props) {
        var id = props.id,
          name = props.name,
          className = props.className,
          label = props.label,
          inputRef = props.inputRef,
          inputProps = _objectWithoutProperties(props, [
            "id",
            "name",
            "className",
            "label",
            "inputRef",
          ]),
          classes = classnames_default()("gc-checkbox", className);
        return Object(jsx_runtime.jsxs)("div", {
          "data-testid": "checkbox",
          className: classes,
          children: [
            Object(jsx_runtime.jsx)(
              "input",
              Object.assign(
                {
                  className: "gc-checkbox__input",
                  id: id,
                  type: "checkbox",
                  name: name,
                  ref: inputRef,
                },
                inputProps
              )
            ),
            Object(jsx_runtime.jsx)("label", {
              className: "gc-label",
              htmlFor: id,
              children: label,
            }),
          ],
        });
      };
      Checkbox_Checkbox.displayName = "Checkbox";
      try {
        (Checkbox_Checkbox.displayName = "Checkbox"),
          (Checkbox_Checkbox.__docgenInfo = {
            description: "",
            displayName: "Checkbox",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !1,
                type: { name: "string" },
              },
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !1,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              label: {
                defaultValue: null,
                description: "",
                name: "label",
                required: !0,
                type: { name: "ReactNode" },
              },
              inputRef: {
                defaultValue: null,
                description: "",
                name: "inputRef",
                required: !1,
                type: {
                  name:
                    "string | RefObject<HTMLInputElement> | ((instance: HTMLInputElement | null) => void) | null",
                },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Checkbox/Checkbox.tsx#Checkbox"
            ] = {
              docgenInfo: Checkbox_Checkbox.__docgenInfo,
              name: "Checkbox",
              path: "components/forms/Checkbox/Checkbox.tsx#Checkbox",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      __webpack_exports__.default = {
        title: "Forms/Checkbox",
        component: Checkbox_Checkbox,
      };
      var Checkbox_stories_defaultCheckbox = function defaultCheckbox() {
        return Object(jsx_runtime.jsx)(Checkbox_Checkbox, {
          id: "checkbox",
          name: "checkbox",
          label: "My Checkbox",
        });
      };
      (Checkbox_stories_defaultCheckbox.displayName = "defaultCheckbox"),
        (Checkbox_stories_defaultCheckbox.parameters = {
          docs: {
            source: {
              code:
                '<label class="gc-checkbox-label"><input type="checkbox" class="gc-checkbox" checked=""><span class="ml-4">Check this box</span></label>',
            },
          },
        }),
        (Checkbox_stories_defaultCheckbox.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Checkbox id="checkbox" name="checkbox" label="My Checkbox" />\n)',
            },
          },
          Checkbox_stories_defaultCheckbox.parameters
        ));
    },
    1117: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultDropdown",
          function () {
            return Dropdown_stories_defaultDropdown;
          }
        );
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(21),
          __webpack_require__(7),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames);
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var Dropdown_DropdownOption = function DropdownOption(props) {
        return Object(jsx_runtime.jsx)("option", {
          value: props.value,
          children: props.name,
        });
      };
      Dropdown_DropdownOption.displayName = "DropdownOption";
      var Dropdown_Dropdown = function Dropdown(props) {
        var id = props.id,
          name = props.name,
          className = props.className,
          inputRef = props.inputRef,
          choices = props.choices,
          inputProps = _objectWithoutProperties(props, [
            "id",
            "name",
            "className",
            "inputRef",
            "choices",
          ]),
          classes = classnames_default()("gc-dropdown", className),
          options = null;
        return (
          choices &&
            choices.length &&
            (options = choices.map(function (choice, i) {
              return Object(jsx_runtime.jsx)(
                Dropdown_DropdownOption,
                { value: choice, name: choice },
                "key-".concat(i)
              );
            })),
          Object(jsx_runtime.jsx)(
            "select",
            Object.assign(
              {
                "data-testid": "dropdown",
                className: classes,
                id: id,
                name: name,
                ref: inputRef,
              },
              inputProps,
              { children: options }
            )
          )
        );
      };
      Dropdown_Dropdown.displayName = "Dropdown";
      try {
        (Dropdown_Dropdown.displayName = "Dropdown"),
          (Dropdown_Dropdown.__docgenInfo = {
            description: "",
            displayName: "Dropdown",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !0,
                type: { name: "string" },
              },
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !0,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              choices: {
                defaultValue: null,
                description: "",
                name: "choices",
                required: !0,
                type: { name: "ReactText[]" },
              },
              inputRef: {
                defaultValue: null,
                description: "",
                name: "inputRef",
                required: !1,
                type: {
                  name:
                    "string | ((instance: HTMLSelectElement | null) => void) | RefObject<HTMLSelectElement> | null",
                },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Dropdown/Dropdown.tsx#Dropdown"
            ] = {
              docgenInfo: Dropdown_Dropdown.__docgenInfo,
              name: "Dropdown",
              path: "components/forms/Dropdown/Dropdown.tsx#Dropdown",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      var Label = __webpack_require__(66),
        Dropdown_stories_inputProps =
          ((__webpack_exports__.default = {
            title: "Forms/Dropdown",
            component: Dropdown_Dropdown,
            parameters: { info: "Dropdown component" },
          }),
          {
            key: "id",
            id: "id",
            name: "province",
            label: "Select a province",
            value: "",
            choices: [
              "",
              "Alberta",
              "British Columbia",
              "Manitoba",
              "New Brunswick",
              "Newfoundland",
              "Northwest Territories",
              "Nova Scotia",
              "Nunavut",
              "Ontario",
              "Prince Edward Island",
              "Quebec",
              "Saskatchewan",
              "Yukon",
            ],
          }),
        Dropdown_stories_defaultDropdown = function defaultDropdown() {
          return Object(jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
              Object(jsx_runtime.jsx)(Label.a, {
                htmlFor: "options",
                children: Dropdown_stories_inputProps.label,
              }),
              Object(jsx_runtime.jsx)(
                Dropdown_Dropdown,
                Object.assign({}, Dropdown_stories_inputProps)
              ),
            ],
          });
        };
      (Dropdown_stories_defaultDropdown.parameters = {
        docs: {
          source: {
            code:
              '<select class="gc-dropdown" name="support_type"><option value="GC Form - First option">GC Form - First option</option><option value="GC Form - Second option">GC Form - Second option</option></select>',
          },
        },
      }),
        (Dropdown_stories_defaultDropdown.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <>\n    <Label htmlFor="options">{inputProps.label}</Label>\n    <Dropdown {...inputProps} />\n  </>\n)',
            },
          },
          Dropdown_stories_defaultDropdown.parameters
        ));
    },
    1118: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "nameFieldset", function () {
          return Fieldset_stories_nameFieldset;
        });
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames = (__webpack_require__(0), __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames),
        Fieldset_Fieldset = function Fieldset(props) {
          var children = props.children,
            legend = props.legend,
            className = props.className,
            legendSrOnly = props.legendSrOnly,
            classes = classnames_default()("gc-fieldset", className),
            legendClasses = classnames_default()("gc-legend", {
              "gc-sr-only": legendSrOnly,
            });
          return Object(jsx_runtime.jsxs)("fieldset", {
            "data-testid": "fieldset",
            className: classes,
            children: [
              legend &&
                Object(jsx_runtime.jsx)("legend", {
                  className: legendClasses,
                  children: legend,
                }),
              children,
            ],
          });
        };
      Fieldset_Fieldset.displayName = "Fieldset";
      try {
        (Fieldset_Fieldset.displayName = "Fieldset"),
          (Fieldset_Fieldset.__docgenInfo = {
            description: "",
            displayName: "Fieldset",
            props: {
              legend: {
                defaultValue: null,
                description: "",
                name: "legend",
                required: !1,
                type: { name: "ReactNode" },
              },
              legendSrOnly: {
                defaultValue: null,
                description: "",
                name: "legendSrOnly",
                required: !1,
                type: { name: "boolean" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Fieldset/Fieldset.tsx#Fieldset"
            ] = {
              docgenInfo: Fieldset_Fieldset.__docgenInfo,
              name: "Fieldset",
              path: "components/forms/Fieldset/Fieldset.tsx#Fieldset",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      var Label = __webpack_require__(66),
        TextInput = __webpack_require__(77),
        Fieldset_stories_nameFieldset =
          ((__webpack_exports__.default = {
            title: "Forms/Fieldset",
            component: Fieldset_Fieldset,
            parameters: { info: "Fieldset component" },
          }),
          function nameFieldset() {
            return Object(jsx_runtime.jsxs)(Fieldset_Fieldset, {
              legend: "Name",
              children: [
                Object(jsx_runtime.jsx)(Label.a, {
                  htmlFor: "title",
                  hint: " (optional)",
                  children: "Title",
                }),
                Object(jsx_runtime.jsx)(TextInput.a, {
                  id: "title",
                  name: "title",
                  type: "text",
                  inputSize: "small",
                }),
                Object(jsx_runtime.jsx)(Label.a, {
                  htmlFor: "first-name",
                  children: "First name",
                }),
                Object(jsx_runtime.jsx)(TextInput.a, {
                  id: "first-name",
                  name: "first-name",
                  type: "text",
                }),
                Object(jsx_runtime.jsx)(Label.a, {
                  htmlFor: "middle-name",
                  hint: " (optional)",
                  children: "Middle name",
                }),
                Object(jsx_runtime.jsx)(TextInput.a, {
                  id: "middle-name",
                  name: "middle-name",
                  type: "text",
                }),
                Object(jsx_runtime.jsx)(Label.a, {
                  htmlFor: "last-name",
                  children: "Last name",
                }),
                Object(jsx_runtime.jsx)(TextInput.a, {
                  id: "last-name",
                  name: "last-name",
                  type: "text",
                }),
              ],
            });
          });
      (Fieldset_stories_nameFieldset.displayName = "nameFieldset"),
        (Fieldset_stories_nameFieldset.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Fieldset legend="Name">\n    <Label htmlFor="title" hint=" (optional)">\n      Title\n    </Label>\n    <TextInput id="title" name="title" type="text" inputSize="small" />\n    <Label htmlFor="first-name">First name</Label>\n    <TextInput id="first-name" name="first-name" type="text" />\n    <Label htmlFor="middle-name" hint=" (optional)">\n      Middle name\n    </Label>\n    <TextInput id="middle-name" name="middle-name" type="text" />\n    <Label htmlFor="last-name">Last name</Label>\n    <TextInput id="last-name" name="last-name" type="text" />\n  </Fieldset>\n)',
            },
          },
          Fieldset_stories_nameFieldset.parameters
        ));
    },
    1119: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultFileInput",
          function () {
            return FileInput_stories_defaultFileInput;
          }
        );
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames = (__webpack_require__(0), __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames),
        FileInput_FileInput = function FileInput(props) {
          var id = props.id,
            className = props.className,
            fileType = props.fileType,
            classes = classnames_default()("gc-file-input", className);
          return Object(jsx_runtime.jsx)("input", {
            type: "file",
            "data-testid": "file",
            className: classes,
            id: id,
            name: id,
            accept: fileType,
          });
        };
      FileInput_FileInput.displayName = "FileInput";
      try {
        (FileInput_FileInput.displayName = "FileInput"),
          (FileInput_FileInput.__docgenInfo = {
            description: "",
            displayName: "FileInput",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !0,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              error: {
                defaultValue: null,
                description: "",
                name: "error",
                required: !1,
                type: { name: "boolean" },
              },
              hint: {
                defaultValue: null,
                description: "",
                name: "hint",
                required: !1,
                type: { name: "ReactNode" },
              },
              fileType: {
                defaultValue: null,
                description: "",
                name: "fileType",
                required: !1,
                type: { name: "string" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/FileInput/FileInput.tsx#FileInput"
            ] = {
              docgenInfo: FileInput_FileInput.__docgenInfo,
              name: "FileInput",
              path: "components/forms/FileInput/FileInput.tsx#FileInput",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      __webpack_exports__.default = {
        title: "Forms/FileInput",
        component: FileInput_FileInput,
        parameters: { info: "FileInput component" },
      };
      var inputProps = {
          key: "id",
          id: "id",
          name: "pdf",
          label: "Upload a PDF",
          value: "",
          fileType: ".pdf",
        },
        FileInput_stories_defaultFileInput = function defaultFileInput() {
          return Object(jsx_runtime.jsx)(
            FileInput_FileInput,
            Object.assign({}, inputProps)
          );
        };
      (FileInput_stories_defaultFileInput.displayName = "defaultFileInput"),
        (FileInput_stories_defaultFileInput.parameters = Object.assign(
          {
            storySource: {
              source:
                "(): React.ReactElement => (\n  <FileInput {...inputProps} />\n)",
            },
          },
          FileInput_stories_defaultFileInput.parameters
        ));
    },
    1120: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "textInputFormGroup",
          function () {
            return FormGroup_stories_textInputFormGroup;
          }
        ),
        __webpack_require__.d(
          __webpack_exports__,
          "textInputErrorFormGroup",
          function () {
            return FormGroup_stories_textInputErrorFormGroup;
          }
        );
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(7),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames),
        FormGroup_FormGroup = function FormGroup(props) {
          var children = props.children,
            name = props.name,
            className = props.className,
            error = props.error,
            classes = classnames_default()(
              "gc-form-group",
              { "gc-form-group--error": error },
              className
            );
          return Object(jsx_runtime.jsx)("fieldset", {
            name: name,
            "data-testid": "formGroup",
            className: classes,
            children: children,
          });
        };
      FormGroup_FormGroup.displayName = "FormGroup";
      try {
        (FormGroup_FormGroup.displayName = "FormGroup"),
          (FormGroup_FormGroup.__docgenInfo = {
            description: "",
            displayName: "FormGroup",
            props: {
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !0,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              error: {
                defaultValue: null,
                description: "",
                name: "error",
                required: !1,
                type: { name: "boolean" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/FormGroup/FormGroup.tsx#FormGroup"
            ] = {
              docgenInfo: FormGroup_FormGroup.__docgenInfo,
              name: "FormGroup",
              path: "components/forms/FormGroup/FormGroup.tsx#FormGroup",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      var Label = __webpack_require__(66),
        TextInput = __webpack_require__(77),
        ErrorMessage = __webpack_require__(163),
        FormGroup_stories_textInputFormGroup =
          ((__webpack_exports__.default = {
            title: "Forms/FormGroup",
            component: FormGroup_FormGroup,
          }),
          function textInputFormGroup() {
            return Object(jsx_runtime.jsxs)(FormGroup_FormGroup, {
              name: "formGroup",
              children: [
                Object(jsx_runtime.jsx)(Label.a, {
                  htmlFor: "input-type-text",
                  children: "Text input label",
                }),
                Object(jsx_runtime.jsx)(TextInput.a, {
                  id: "input-type-text",
                  name: "input-type-text",
                  type: "text",
                }),
              ],
            });
          });
      FormGroup_stories_textInputFormGroup.displayName = "textInputFormGroup";
      var FormGroup_stories_textInputErrorFormGroup = function textInputErrorFormGroup() {
        return Object(jsx_runtime.jsxs)(FormGroup_FormGroup, {
          name: "formGroupError",
          error: !0,
          children: [
            Object(jsx_runtime.jsx)(Label.a, {
              htmlFor: "input-type-text",
              error: !0,
              children: "Text input label",
            }),
            Object(jsx_runtime.jsx)(ErrorMessage.a, {
              children: "Helpful error message",
            }),
            Object(jsx_runtime.jsx)(TextInput.a, {
              id: "input-type-text",
              name: "input-type-text",
              type: "text",
              validationStatus: "error",
            }),
          ],
        });
      };
      (FormGroup_stories_textInputErrorFormGroup.displayName =
        "textInputErrorFormGroup"),
        (FormGroup_stories_textInputFormGroup.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <FormGroup name="formGroup">\n    <Label htmlFor="input-type-text">Text input label</Label>\n    <TextInput id="input-type-text" name="input-type-text" type="text" />\n  </FormGroup>\n)',
            },
          },
          FormGroup_stories_textInputFormGroup.parameters
        )),
        (FormGroup_stories_textInputErrorFormGroup.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <FormGroup name="formGroupError" error>\n    <Label htmlFor="input-type-text" error>\n      Text input label\n    </Label>\n    <ErrorMessage>Helpful error message</ErrorMessage>\n    <TextInput\n      id="input-type-text"\n      name="input-type-text"\n      type="text"\n      validationStatus="error"\n    />\n  </FormGroup>\n)',
            },
          },
          FormGroup_stories_textInputErrorFormGroup.parameters
        ));
    },
    1121: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(__webpack_exports__, "defaultRadio", function () {
          return Radio_stories_defaultRadio;
        }),
        __webpack_require__.d(__webpack_exports__, "selected", function () {
          return Radio_stories_selected;
        }),
        __webpack_require__.d(__webpack_exports__, "disabled", function () {
          return Radio_stories_disabled;
        });
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(11),
          __webpack_require__(7),
          __webpack_require__(8),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames);
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var Radio_Radio = function Radio(props) {
        var id = props.id,
          name = props.name,
          className = props.className,
          label = props.label,
          inputRef = props.inputRef,
          inputProps = _objectWithoutProperties(props, [
            "id",
            "name",
            "className",
            "label",
            "inputRef",
          ]),
          classes = classnames_default()("gc-input-radio", className);
        return Object(jsx_runtime.jsxs)("div", {
          "data-testid": "radio",
          className: classes,
          children: [
            Object(jsx_runtime.jsx)(
              "input",
              Object.assign(
                {
                  className: "gc-radio__input",
                  id: id,
                  type: "radio",
                  name: name,
                  ref: inputRef,
                },
                inputProps
              )
            ),
            Object(jsx_runtime.jsx)("label", {
              className: "gc-label",
              htmlFor: id,
              children: label,
            }),
          ],
        });
      };
      Radio_Radio.displayName = "Radio";
      try {
        (Radio_Radio.displayName = "Radio"),
          (Radio_Radio.__docgenInfo = {
            description: "",
            displayName: "Radio",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !1,
                type: { name: "string" },
              },
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !1,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              label: {
                defaultValue: null,
                description: "",
                name: "label",
                required: !0,
                type: { name: "ReactNode" },
              },
              inputRef: {
                defaultValue: null,
                description: "",
                name: "inputRef",
                required: !1,
                type: {
                  name:
                    "string | RefObject<HTMLInputElement> | ((instance: HTMLInputElement | null) => void) | null",
                },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Radio/Radio.tsx#Radio"
            ] = {
              docgenInfo: Radio_Radio.__docgenInfo,
              name: "Radio",
              path: "components/forms/Radio/Radio.tsx#Radio",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      __webpack_exports__.default = {
        title: "Forms/Radio",
        component: Radio_Radio,
        parameters: { info: "Radio component" },
      };
      var Radio_stories_defaultRadio = function defaultRadio() {
        return Object(jsx_runtime.jsx)(Radio_Radio, {
          id: "input-radio",
          name: "input-radio",
          label: "My Radio Button",
        });
      };
      Radio_stories_defaultRadio.displayName = "defaultRadio";
      var Radio_stories_selected = function selected() {
        return Object(jsx_runtime.jsx)(Radio_Radio, {
          id: "input-radio",
          name: "input-radio",
          label: "My Radio Button",
          defaultChecked: !0,
        });
      };
      Radio_stories_selected.displayName = "selected";
      var Radio_stories_disabled = function disabled() {
        return Object(jsx_runtime.jsx)(Radio_Radio, {
          id: "input-radio",
          name: "input-radio",
          label: "My Radio Button",
          disabled: !0,
        });
      };
      (Radio_stories_disabled.displayName = "disabled"),
        (Radio_stories_defaultRadio.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Radio id="input-radio" name="input-radio" label="My Radio Button" />\n)',
            },
          },
          Radio_stories_defaultRadio.parameters
        )),
        (Radio_stories_selected.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Radio\n    id="input-radio"\n    name="input-radio"\n    label="My Radio Button"\n    defaultChecked\n  />\n)',
            },
          },
          Radio_stories_selected.parameters
        )),
        (Radio_stories_disabled.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <Radio id="input-radio" name="input-radio" label="My Radio Button" disabled />\n)',
            },
          },
          Radio_stories_disabled.parameters
        ));
    },
    1122: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__),
        __webpack_require__.d(
          __webpack_exports__,
          "defaultTextArea",
          function () {
            return TextArea_stories_defaultTextArea;
          }
        ),
        __webpack_require__.d(
          __webpack_exports__,
          "withDefaultValue",
          function () {
            return TextArea_stories_withDefaultValue;
          }
        ),
        __webpack_require__.d(
          __webpack_exports__,
          "withPlaceholder",
          function () {
            return TextArea_stories_withPlaceholder;
          }
        ),
        __webpack_require__.d(__webpack_exports__, "disabled", function () {
          return TextArea_stories_disabled;
        }),
        __webpack_require__.d(__webpack_exports__, "readonly", function () {
          return TextArea_stories_readonly;
        });
      __webpack_require__(3);
      var jsx_runtime = __webpack_require__(2),
        classnames =
          (__webpack_require__(0),
          __webpack_require__(11),
          __webpack_require__(7),
          __webpack_require__(8),
          __webpack_require__(34)),
        classnames_default = __webpack_require__.n(classnames);
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var TextArea_TextArea = function TextArea(props) {
        var id = props.id,
          name = props.name,
          className = props.className,
          error = props.error,
          success = props.success,
          children = props.children,
          inputRef = props.inputRef,
          inputProps = _objectWithoutProperties(props, [
            "id",
            "name",
            "className",
            "error",
            "success",
            "children",
            "inputRef",
          ]),
          classes = classnames_default()(
            "gc-textarea",
            { "gc-input--error": error, "gc-input--success": success },
            className
          );
        return Object(jsx_runtime.jsx)(
          "textarea",
          Object.assign(
            {
              "data-testid": "textarea",
              className: classes,
              id: id,
              name: name,
              ref: inputRef,
            },
            inputProps,
            { children: children }
          )
        );
      };
      TextArea_TextArea.displayName = "TextArea";
      try {
        (TextArea_TextArea.displayName = "TextArea"),
          (TextArea_TextArea.__docgenInfo = {
            description: "",
            displayName: "TextArea",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !1,
                type: { name: "string" },
              },
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !1,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              error: {
                defaultValue: null,
                description: "",
                name: "error",
                required: !1,
                type: { name: "boolean" },
              },
              success: {
                defaultValue: null,
                description: "",
                name: "success",
                required: !1,
                type: { name: "boolean" },
              },
              inputRef: {
                defaultValue: null,
                description: "",
                name: "inputRef",
                required: !1,
                type: { name: "TextAreaRef" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/TextArea/TextArea.tsx#TextArea"
            ] = {
              docgenInfo: TextArea_TextArea.__docgenInfo,
              name: "TextArea",
              path: "components/forms/TextArea/TextArea.tsx#TextArea",
            });
      } catch (__react_docgen_typescript_loader_error) {}
      __webpack_exports__.default = {
        title: "Forms/TextArea",
        component: TextArea_TextArea,
        parameters: { info: "TextArea component" },
      };
      var TextArea_stories_defaultTextArea = function defaultTextArea() {
        return Object(jsx_runtime.jsx)(TextArea_TextArea, {
          id: "input-type-text",
          name: "input-type-text",
        });
      };
      TextArea_stories_defaultTextArea.displayName = "defaultTextArea";
      var TextArea_stories_withDefaultValue = function withDefaultValue() {
        return Object(jsx_runtime.jsx)(TextArea_TextArea, {
          id: "input-value",
          name: "input-value",
          defaultValue: "Change me",
        });
      };
      TextArea_stories_withDefaultValue.displayName = "withDefaultValue";
      var TextArea_stories_withPlaceholder = function withPlaceholder() {
        return Object(jsx_runtime.jsx)(TextArea_TextArea, {
          id: "input-type-text",
          name: "input-type-text",
          placeholder: "Enter value",
        });
      };
      TextArea_stories_withPlaceholder.displayName = "withPlaceholder";
      var TextArea_stories_disabled = function disabled() {
        return Object(jsx_runtime.jsx)(TextArea_TextArea, {
          id: "input-disabled",
          name: "input-disabled",
          disabled: !0,
        });
      };
      TextArea_stories_disabled.displayName = "disabled";
      var TextArea_stories_readonly = function readonly() {
        return Object(jsx_runtime.jsx)(TextArea_TextArea, {
          id: "input-readonly",
          name: "input-readonly",
          readOnly: !0,
        });
      };
      (TextArea_stories_readonly.displayName = "readonly"),
        (TextArea_stories_defaultTextArea.parameters = {
          docs: {
            source: {
              code:
                '<label class="gc-textarea-label"><span class="ml-4">Enter text</span><textarea class="gc-textarea"></textarea></label>',
            },
          },
        }),
        (TextArea_stories_defaultTextArea.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextArea id="input-type-text" name="input-type-text" />\n)',
            },
          },
          TextArea_stories_defaultTextArea.parameters
        )),
        (TextArea_stories_withDefaultValue.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextArea id="input-value" name="input-value" defaultValue="Change me" />\n)',
            },
          },
          TextArea_stories_withDefaultValue.parameters
        )),
        (TextArea_stories_withPlaceholder.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextArea\n    id="input-type-text"\n    name="input-type-text"\n    placeholder="Enter value"\n  />\n)',
            },
          },
          TextArea_stories_withPlaceholder.parameters
        )),
        (TextArea_stories_disabled.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextArea id="input-disabled" name="input-disabled" disabled />\n)',
            },
          },
          TextArea_stories_disabled.parameters
        )),
        (TextArea_stories_readonly.parameters = Object.assign(
          {
            storySource: {
              source:
                '(): React.ReactElement => (\n  <TextArea id="input-readonly" name="input-readonly" readOnly />\n)',
            },
          },
          TextArea_stories_readonly.parameters
        ));
    },
    131: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.d(__webpack_exports__, "a", function () {
        return Button;
      });
      __webpack_require__(11), __webpack_require__(3), __webpack_require__(8);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
          2
        ),
        classnames__WEBPACK_IMPORTED_MODULE_5__ =
          (__webpack_require__(0), __webpack_require__(34)),
        classnames__WEBPACK_IMPORTED_MODULE_5___default = __webpack_require__.n(
          classnames__WEBPACK_IMPORTED_MODULE_5__
        );
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var Button = function Button(props) {
        var type = props.type,
          children = props.children,
          secondary = props.secondary,
          base = props.base,
          onClick = props.onClick,
          className = props.className,
          defaultProps = _objectWithoutProperties(props, [
            "type",
            "children",
            "secondary",
            "base",
            "onClick",
            "className",
          ]),
          classes = classnames__WEBPACK_IMPORTED_MODULE_5___default()(
            "gc-button",
            { "gc-button--secondary": secondary, "gc-button--base": base },
            className
          );
        return Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(
          "button",
          Object.assign(
            {
              type: type,
              className: classes,
              onClick: onClick,
              "data-testid": "button",
            },
            defaultProps,
            { children: children }
          )
        );
      };
      Button.displayName = "Button";
      try {
        (Button.displayName = "Button"),
          (Button.__docgenInfo = {
            description: "",
            displayName: "Button",
            props: {
              type: {
                defaultValue: null,
                description: "",
                name: "type",
                required: !1,
                type: {
                  name: "enum",
                  value: [
                    { value: '"button"' },
                    { value: '"submit"' },
                    { value: '"reset"' },
                  ],
                },
              },
              secondary: {
                defaultValue: null,
                description: "",
                name: "secondary",
                required: !1,
                type: { name: "boolean" },
              },
              base: {
                defaultValue: null,
                description: "",
                name: "base",
                required: !1,
                type: { name: "boolean" },
              },
              size: {
                defaultValue: null,
                description: "",
                name: "size",
                required: !1,
                type: { name: '"big"' },
              },
              unstyled: {
                defaultValue: null,
                description: "",
                name: "unstyled",
                required: !1,
                type: { name: "boolean" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Button/Button.tsx#Button"
            ] = {
              docgenInfo: Button.__docgenInfo,
              name: "Button",
              path: "components/forms/Button/Button.tsx#Button",
            });
      } catch (__react_docgen_typescript_loader_error) {}
    },
    163: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.d(__webpack_exports__, "a", function () {
        return ErrorMessage;
      });
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          2
        ),
        classnames__WEBPACK_IMPORTED_MODULE_2__ =
          (__webpack_require__(0), __webpack_require__(34)),
        classnames__WEBPACK_IMPORTED_MODULE_2___default = __webpack_require__.n(
          classnames__WEBPACK_IMPORTED_MODULE_2__
        ),
        ErrorMessage = function ErrorMessage(props) {
          var children = props.children,
            className = props.className,
            id = props.id,
            classes = classnames__WEBPACK_IMPORTED_MODULE_2___default()(
              "gc-error-message",
              className
            );
          return Object(
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx
          )("span", {
            "data-testid": "errorMessage",
            className: classes,
            id: id,
            role: "alert",
            children: children,
          });
        };
      ErrorMessage.displayName = "ErrorMessage";
      try {
        (ErrorMessage.displayName = "ErrorMessage"),
          (ErrorMessage.__docgenInfo = {
            description: "",
            displayName: "ErrorMessage",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !1,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/ErrorMessage/ErrorMessage.tsx#ErrorMessage"
            ] = {
              docgenInfo: ErrorMessage.__docgenInfo,
              name: "ErrorMessage",
              path:
                "components/forms/ErrorMessage/ErrorMessage.tsx#ErrorMessage",
            });
      } catch (__react_docgen_typescript_loader_error) {}
    },
    321: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          483
        ),
        _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(
          _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__
        ),
        _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
          484
        ),
        ___CSS_LOADER_EXPORT___ = __webpack_require__.n(
          _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__
        )()(
          _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default.a
        );
      ___CSS_LOADER_EXPORT___.push([
        module.i,
        "/*! modern-normalize v1.0.0 | MIT License | https://github.com/sindresorhus/modern-normalize */\n\n/*\nDocument\n========\n*/\n\n/**\nUse a better box model (opinionated).\n*/\n\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n/**\nUse a more readable tab size (opinionated).\n*/\n\n:root {\n  -moz-tab-size: 4;\n  -o-tab-size: 4;\n     tab-size: 4;\n}\n\n/**\n1. Correct the line height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n*/\n\nhtml {\n  line-height: 1.15; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/*\nSections\n========\n*/\n\n/**\nRemove the margin in all browsers.\n*/\n\nbody {\n  margin: 0;\n}\n\n/**\nImprove consistency of default fonts in all browsers. (https://github.com/sindresorhus/modern-normalize/issues/3)\n*/\n\nbody {\n  font-family:\n\t\tsystem-ui,\n\t\t-apple-system, /* Firefox supports this but not yet `system-ui` */\n\t\t'Segoe UI',\n\t\tRoboto,\n\t\tHelvetica,\n\t\tArial,\n\t\tsans-serif,\n\t\t'Apple Color Emoji',\n\t\t'Segoe UI Emoji';\n}\n\n/*\nGrouping content\n================\n*/\n\n/**\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n}\n\n/*\nText-level semantics\n====================\n*/\n\n/**\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr[title] {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/**\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n1. Improve consistency of default fonts in all browsers. (https://github.com/sindresorhus/modern-normalize/issues/3)\n2. Correct the odd 'em' font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family:\n\t\tui-monospace,\n\t\tSFMono-Regular,\n\t\tConsolas,\n\t\t'Liberation Mono',\n\t\tMenlo,\n\t\tmonospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/**\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/**\nPrevent 'sub' and 'sup' elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\nTabular data\n============\n*/\n\n/**\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n}\n\n/*\nForms\n=====\n*/\n\n/**\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  line-height: 1.15; /* 1 */\n  margin: 0; /* 2 */\n}\n\n/**\nRemove the inheritance of text transform in Edge and Firefox.\n1. Remove the inheritance of text transform in Firefox.\n*/\n\nbutton,\nselect { /* 1 */\n  text-transform: none;\n}\n\n/**\nCorrect the inability to style clickable types in iOS and Safari.\n*/\n\nbutton,\n[type='button'],\n[type='submit'] {\n  -webkit-appearance: button;\n}\n\n/**\nRemove the inner border and padding in Firefox.\n*/\n\n/**\nRestore the focus styles unset by the previous rule.\n*/\n\n/**\nRemove the additional ':invalid' styles in Firefox.\nSee: https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737\n*/\n\n/**\nRemove the padding so developers are not caught out when they zero out 'fieldset' elements in all browsers.\n*/\n\nlegend {\n  padding: 0;\n}\n\n/**\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n/**\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n/**\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n/**\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to 'inherit' in Safari.\n*/\n\n/*\nInteractive\n===========\n*/\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/**\n * Manually forked from SUIT CSS Base: https://github.com/suitcss/base\n * A thin layer on top of normalize.css that provides a starting point more\n * suitable for web applications.\n */\n\n/**\n * Removes the default spacing and border for appropriate elements.\n */\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nbutton {\n  background-color: transparent;\n  background-image: none;\n}\n\n/**\n * Work around a Firefox/IE bug where the transparent `button` background\n * results in a loss of the default `button` focus styles.\n */\n\nbutton:focus {\n  outline: 1px dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nol,\nul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/**\n * Tailwind custom reset styles\n */\n\n/**\n * 1. Use the user's configured `sans` font-family (with Tailwind's default\n *    sans-serif font stack as a fallback) as a sane default.\n * 2. Use Tailwind's default \"normal\" line-height so the user isn't forced\n *    to override it to ensure consistency even when using the default theme.\n */\n\nhtml {\n  font-family: lato; /* 1 */\n  line-height: 1.5; /* 2 */\n}\n\n/**\n * Inherit font-family and line-height from `html` so users can set them as\n * a class directly on the `html` element.\n */\n\nbody {\n  font-family: inherit;\n  line-height: inherit;\n}\n\n/**\n * 1. Prevent padding and border from affecting element width.\n *\n *    We used to set this in the html element and inherit from\n *    the parent element for everything else. This caused issues\n *    in shadow-dom-enhanced elements like <details> where the content\n *    is wrapped by a div with box-sizing set to `content-box`.\n *\n *    https://github.com/mozdevs/cssremedy/issues/4\n *\n *\n * 2. Allow adding a border to an element by just adding a border-width.\n *\n *    By default, the way the browser specifies that an element should have no\n *    border is by setting it's border-style to `none` in the user-agent\n *    stylesheet.\n *\n *    In order to easily add borders to elements by just setting the `border-width`\n *    property, we change the default border-style for all elements to `solid`, and\n *    use border-width to hide them instead. This way our `border` utilities only\n *    need to set the `border-width` property instead of the entire `border`\n *    shorthand, making our border utilities much more straightforward to compose.\n *\n *    https://github.com/tailwindcss/tailwindcss/pull/116\n */\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n/*\n * Ensure horizontal rules are visible by default\n */\n\nhr {\n  border-top-width: 1px;\n}\n\n/**\n * Undo the `border-style: none` reset that Normalize applies to images so that\n * our `border-{width}` utilities have the expected effect.\n *\n * The Normalize reset is unnecessary for us since we default the border-width\n * to 0 on all elements.\n *\n * https://github.com/tailwindcss/tailwindcss/issues/362\n */\n\nimg {\n  border-style: solid;\n}\n\ntextarea {\n  resize: vertical;\n}\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  color: #9ca3af;\n}\n\ninput:-ms-input-placeholder, textarea:-ms-input-placeholder {\n  color: #9ca3af;\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  color: #9ca3af;\n}\n\nbutton {\n  cursor: pointer;\n}\n\ntable {\n  border-collapse: collapse;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/**\n * Reset links to optimize for opt-in styling instead of\n * opt-out.\n */\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/**\n * Reset form element properties that are easy to forget to\n * style explicitly so you don't inadvertently introduce\n * styles that deviate from your design system. These styles\n * supplement a partial reset that is already applied by\n * normalize.css.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  padding: 0;\n  line-height: inherit;\n  color: inherit;\n}\n\n/**\n * Use the configured 'mono' font family for elements that\n * are expected to be rendered with a monospace font, falling\n * back to the system monospace stack if there is no configured\n * 'mono' font family.\n */\n\npre,\ncode,\nkbd,\nsamp {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n\n/**\n * Make replaced elements `display: block` by default as that's\n * the behavior you want almost all of the time. Inspired by\n * CSS Remedy, with `svg` added as well.\n *\n * https://github.com/mozdevs/cssremedy/issues/14\n */\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block;\n  vertical-align: middle;\n}\n\n/**\n * Constrain images and videos to the parent width and preserve\n * their instrinsic aspect ratio.\n *\n * https://github.com/mozdevs/cssremedy/issues/14\n */\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgba(243, 244, 246, var(--tw-bg-opacity));\n}\n\n.border-0 {\n  border-width: 0;\n}\n\n.flex {\n  display: flex;\n}\n\n.table {\n  display: table;\n}\n\n.flex-row {\n  flex-direction: row;\n}\n\n.justify-between {\n  justify-content: space-between;\n}\n\n.font-normal {\n  font-weight: 400;\n}\n\n.h-12 {\n  height: 3rem;\n}\n\n.text-base {\n  font-size: 1.25rem;\n}\n\n.text-3xl {\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n}\n\n.list-inside {\n  list-style-position: inside;\n}\n\n.mb-5 {\n  margin-bottom: 1.25rem;\n}\n\n.mt-20 {\n  margin-top: 5rem;\n}\n\n.mb-20 {\n  margin-bottom: 5rem;\n}\n\n.p-0 {\n  padding: 0px;\n}\n\n.pt-2 {\n  padding-top: 0.5rem;\n}\n\n.pt-4 {\n  padding-top: 1rem;\n}\n\n.pr-4 {\n  padding-right: 1rem;\n}\n\n.pb-6 {\n  padding-bottom: 1.5rem;\n}\n\n* {\n  --tw-shadow: 0 0 #0000;\n}\n\n* {\n  --tw-ring-inset: var(--tw-empty,/*!*/ /*!*/);\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgba(117, 185, 224, 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n}\n\n.no-underline {\n  text-decoration: none;\n}\n\n.hover\\:underline:hover {\n  text-decoration: underline;\n}\n\n@-webkit-keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@-webkit-keyframes ping {\n  75%, 100% {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n\n@keyframes ping {\n  75%, 100% {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n\n@-webkit-keyframes pulse {\n  50% {\n    opacity: .5;\n  }\n}\n\n@keyframes pulse {\n  50% {\n    opacity: .5;\n  }\n}\n\n@-webkit-keyframes bounce {\n  0%, 100% {\n    transform: translateY(-25%);\n    -webkit-animation-timing-function: cubic-bezier(0.8,0,1,1);\n            animation-timing-function: cubic-bezier(0.8,0,1,1);\n  }\n\n  50% {\n    transform: none;\n    -webkit-animation-timing-function: cubic-bezier(0,0,0.2,1);\n            animation-timing-function: cubic-bezier(0,0,0.2,1);\n  }\n}\n\n@keyframes bounce {\n  0%, 100% {\n    transform: translateY(-25%);\n    -webkit-animation-timing-function: cubic-bezier(0.8,0,1,1);\n            animation-timing-function: cubic-bezier(0.8,0,1,1);\n  }\n\n  50% {\n    transform: none;\n    -webkit-animation-timing-function: cubic-bezier(0,0,0.2,1);\n            animation-timing-function: cubic-bezier(0,0,0.2,1);\n  }\n}\n\nh1{\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n  margin-bottom: 1rem;\n  margin-top: 1rem\n}\n\nol{\n  list-style-type: decimal\n}\n\nul{\n  list-style-type: disc\n}\n\na{\n  text-decoration: underline\n}\n\n.canada-wordmark img{\n  display: inline\n}\n\n*{\n  box-sizing:border-box\n}\n\na[href]:not([disabled]):focus:not(.autocomplete__option),area[href]:not([disabled]):focus:not(.autocomplete__option),input:not([disabled]):focus:not(.autocomplete__option),select textarea:not([disabled]):focus:not(.autocomplete__option),button:not([disabled]):focus:not(.autocomplete__option),iframe:not([disabled]):focus:not(.autocomplete__option),[tabindex]:not([disabled]):focus:not(.autocomplete__option),[contentEditable=true]:not([disabled]):focus:not(.autocomplete__option){\n  outline:3px solid #c78100;\n  outline-offset:0\n}\n\nbody{\n  margin:0;\n  font-size:1.25em;\n  font-family:\"Noto Sans\",sans-serif;\n  line-height:1.65\n}\n\np,.multiple-choice__item p,ol,ul{\n  margin-top:0;\n  margin-bottom:10px\n}\n\n@media screen and (min-width: 23em){\n  p,.multiple-choice__item p,ol,ul{\n    margin-bottom:15px\n  }\n}\n\np+ul{\n  margin-top:-10px\n}\n\n@media screen and (min-width: 23em){\n  p+ul{\n    margin-top:-15px\n  }\n}\n\nol,ul{\n  padding-left:30px\n}\n\n@media screen and (min-width: 36.5em){\n  ol,ul{\n    padding-left:40px\n  }\n}\n\na,a:visited{\n  color:#284162\n}\n\nh1,h2,h3,h4,h5,h6{\n  font-family:\"Lato\",sans-serif;\n  line-height:1.33;\n  font-weight:600\n}\n\n.phase-banner div,.page--container,main{\n  max-width:960px;\n  margin:0 auto;\n  padding-left:20px;\n  padding-right:20px\n}\n\n@media screen and (min-width: 75em){\n  .phase-banner div,.page--container,main{\n    max-width:1024px\n  }\n}\n\nmain{\n  padding:0 20px\n}\n\nmain h1{\n  border-bottom:1px solid #af3c43;\n  margin:5rem 0;\n  font-size:2.25rem\n}\n\nli:not(:last-of-type){\n  padding-bottom:5px\n}\n\n@media screen and (min-width: 36.5em){\n  li:not(:last-of-type){\n    padding-bottom:0\n  }\n}\n\n.outer-container{\n  position:relative;\n  min-height:100vh\n}\n\n.hide--mobile{\n  display:none\n}\n\n@media screen and (min-width: 36.5em){\n  .hide--mobile{\n    display:inherit\n  }\n}\n\n.gc-button{\n  --tw-bg-opacity: 1;\n  background-color: rgba(38, 55, 74, var(--tw-bg-opacity));\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-bottom-width: 4px;\n  cursor: pointer;\n  font-weight: 700;\n  font-size: 1.25rem;\n  margin-top: 2.5rem;\n  margin-bottom: 2.5rem;\n  margin-right: 0.5rem;\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  padding-left: 1.25rem;\n  padding-right: 1.25rem;\n  --tw-text-opacity: 1;\n  color: rgba(249, 250, 251, var(--tw-text-opacity));\n  text-decoration: none;\n  width: 15rem\n}\n\n.gc-button:hover{\n  --tw-bg-opacity: 1;\n  background-color: rgba(51, 80, 117, var(--tw-bg-opacity))\n}\n\n.gc-button--secondary{\n  background-color: transparent;\n  --tw-border-opacity: 1;\n  border-color: rgba(4, 120, 87, var(--tw-border-opacity));\n  border-width: 2px;\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  padding-left: 4rem;\n  padding-right: 4rem;\n  --tw-text-opacity: 1;\n  color: rgba(4, 120, 87, var(--tw-text-opacity))\n}\n\n.gc-button--secondary:hover{\n  --tw-bg-opacity: 1;\n  background-color: rgba(4, 120, 87, var(--tw-bg-opacity));\n  --tw-text-opacity: 1;\n  color: rgba(249, 250, 251, var(--tw-text-opacity))\n}\n\n.gc-label{\n  display: block;\n  font-weight: 700;\n  line-height: 1.25rem;\n  margin-bottom: 1rem;\n  margin-top: 2.5rem;\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem\n}\n\n.gc-textarea{\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-style: solid;\n  border-width: 2px;\n  height: 10rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  width: 66.666667%\n}\n\n.gc-input-text{\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-style: solid;\n  border-width: 2px;\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n  margin-bottom: 0.5rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  width: 50%\n}\n\n.gc-plain-text{\n  margin-top: 1.25rem;\n  margin-bottom: 1.25rem;\n  width: 100%\n}\n\n.gc-heading-2{\n  font-size: 2rem;\n  margin-bottom: 2.5rem;\n  margin-top: 5rem\n}\n\n.gc-dropdown{\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-style: solid;\n  border-width: 2px;\n  margin-bottom: 0.5rem;\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  width: 100%\n}\n\n@media (min-width: 768px) {\n  .gc-dropdown {\n    width: 50%;\n  }\n}\n\n.gc-checkbox .gc-checkbox__input, .gc-checkbox form input.gc-checkbox__input {\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-radius: 0.25rem;\n  border-width: 2px;\n  height: 2.5rem;\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n  margin-right: 0.5rem;\n  --tw-text-opacity: 1;\n  color: rgba(249, 250, 251, var(--tw-text-opacity));\n  vertical-align: middle;\n  width: 2.5rem;\n}\n\n.gc-checkbox:checked{\n  --tw-bg-opacity: 1;\n  background-color: rgba(38, 55, 74, var(--tw-bg-opacity));\n  --tw-text-opacity: 1;\n  color: rgba(249, 250, 251, var(--tw-text-opacity))\n}\n\n.gc-input-radio{\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem\n}\n\n.gc-input-radio .gc-radio__input{\n  --tw-border-opacity: 1;\n  border-color: rgba(17, 24, 39, var(--tw-border-opacity));\n  border-width: 2px;\n  height: 2.5rem;\n  margin-right: 0.5rem;\n  vertical-align: middle;\n  width: 2.5rem\n}\n\n.gc-checkbox .gc-label, .gc-input-radio .gc-label {\n  display: inline;\n  font-weight: 400;\n  margin-top: 0px;\n  margin-bottom: 0px;\n  padding: 0.5rem;\n}\n\n.error-list{\n  --tw-bg-opacity: 1;\n  background-color: rgba(254, 242, 242, var(--tw-bg-opacity));\n  --tw-border-opacity: 1;\n  border-color: rgba(239, 68, 68, var(--tw-border-opacity));\n  border-left-width: 4px;\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n  padding-left: 1.25rem;\n  padding-right: 1.25rem\n}\n\n.error-list__header{\n  margin-top:10px;\n  margin-bottom:20px\n}\n\n.validation-message{\n  --tw-text-opacity: 1;\n  color: rgba(239, 68, 68, var(--tw-text-opacity))\n}\n\nheader{\n  padding:0 0 0 0;\n  margin-bottom:40px\n}\n\nheader button{\n  padding:0\n}\n\n@media screen and (min-width: 36.5em){\n  header{\n    margin-bottom:calc(40px + 40px);\n    text-align:right\n  }\n}\n\nheader .fip-container{\n  flex-direction:row;\n  justify-content:space-between;\n  display:flex\n}\n\nheader .language-link{\n  text-align:left;\n  margin-bottom:15px;\n  font-size:.85em\n}\n\nheader .language-link h2{\n  position:absolute !important;\n  width:1px !important;\n  height:1px !important;\n  margin:0 !important;\n  padding:0 !important;\n  overflow:hidden !important;\n  clip:rect(0 0 0 0) !important;\n  -webkit-clip-path:inset(50%) !important;\n  clip-path:inset(50%) !important;\n  border:0 !important;\n  white-space:nowrap !important\n}\n\nheader .language-link form,header .language-link button{\n  margin:0;\n  max-width:unset;\n  width:auto\n}\n\nheader .language-link button{\n  background:none;\n  color:#284162;\n  text-decoration:underline;\n  border:0;\n  box-shadow:none;\n  font-size:.9em\n}\n\nheader .language-link button:focus{\n  outline:3px solid #c78100;\n  outline-offset:3px\n}\n\n@media screen and (min-width: 23em){\n  header .language-link{\n    font-size:.9em\n  }\n}\n\n@media screen and (min-width: 36.5em){\n  header .language-link{\n    margin-bottom:0;\n    font-size:1em\n  }\n}\n\nheader .canada-flag{\n  height:auto;\n  max-height:40px;\n  width:272px;\n  margin-bottom:15px;\n  margin-right:15px\n}\n\n@media screen and (min-width: 36.5em){\n  header .canada-flag{\n    width:360px;\n    margin-bottom:0\n  }\n}\n\n.visually-hidden{\n  position:absolute !important;\n  width:1px !important;\n  height:1px !important;\n  margin:0 !important;\n  padding:0 !important;\n  overflow:hidden !important;\n  clip:rect(0 0 0 0) !important;\n  -webkit-clip-path:inset(50%) !important;\n  clip-path:inset(50%) !important;\n  border:0 !important;\n  white-space:nowrap !important\n}\n\n.phase-banner{\n  background:#f4f4f4;\n  line-height:1.33\n}\n\n.phase-banner div{\n  display:flex;\n  align-items:flex-start;\n  padding-top:15px;\n  padding-bottom:15px;\n  margin-bottom:20px\n}\n\n@media screen and (min-width: 36.5em){\n  .phase-banner div{\n    align-items:center;\n    margin-bottom:40px\n  }\n}\n\n.phase-banner span{\n  font-size:.7em\n}\n\n.phase-banner span:first-of-type{\n  border:2px #000 solid;\n  padding:1px 5px;\n  letter-spacing:1px;\n  margin-right:1.7em\n}\n\n@media screen and (min-width: 36.5em){\n  .phase-banner span:first-of-type{\n    padding:1px 7px\n  }\n}\n\n.phase-banner span:last-of-type{\n  margin-top:3px\n}\n\n@media screen and (min-width: 36.5em){\n  .phase-banner span:last-of-type{\n    margin-top:0px\n  }\n}\n\n#skip-link-container{\n  width:100%;\n  position:absolute;\n  z-index:5;\n  text-align:center;\n  top:10px\n}\n\n#skip-link-container #skip-link{\n  position:absolute;\n  width:1px;\n  height:1px;\n  overflow:hidden;\n  white-space:nowrap\n}\n\n#skip-link-container #skip-link:focus{\n  position:static;\n  padding:5px;\n  width:auto;\n  height:auto;\n  overflow:auto;\n  background-color:#fff;\n  text-align:center\n}\n\n@media (min-width: 280px) {\n}\n\n@media (min-width: 325px) {\n}\n\n@media (min-width: 450px) {\n}\n\n@media (min-width: 550px) {\n  .md\\:inline-block {\n    display: inline-block;\n  }\n\n  .md\\:items-baseline {\n    align-items: baseline;\n  }\n\n  .md\\:pt-10 {\n    padding-top: 2.5rem;\n  }\n\n  .md\\:pb-10 {\n    padding-bottom: 2.5rem;\n  }\n\n  .md\\:absolute {\n    position: absolute;\n  }\n\n  .md\\:relative {\n    position: relative;\n  }\n\n  .md\\:right-0 {\n    right: 0px;\n  }\n\n  .md\\:bottom-0 {\n    bottom: 0px;\n  }\n\n  .md\\:w-1\\/5 {\n    width: 20%;\n  }\n\n  .md\\:w-4\\/5 {\n    width: 80%;\n  }\n}\n\n@media (min-width: 768px) {\n}\n\n@media (min-width: 1024px) {\n}",
        "",
        {
          version: 3,
          sources: [
            "webpack://./node_modules/tailwindcss/base.css",
            "webpack://./styles/_tailwind.scss",
            "webpack://./styles/_base.scss",
            "webpack://./styles/_mixins.scss",
            "webpack://./styles/_variables.scss",
            "webpack://./styles/_forms.scss",
            "<no source>",
            "webpack://./styles/_header.scss",
          ],
          names: [],
          mappings:
            "AAAA,8FAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;;;EAAA,sBAAA;AAAA;;AAAA;;CAAA;;AAAA;EAAA,gBAAA;EAAA,cAAA;KAAA,WAAA;AAAA;;AAAA;;;CAAA;;AAAA;EAAA,iBAAA,EAAA,MAAA;EAAA,8BAAA,EAAA,MAAA;AAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;EAAA,SAAA;AAAA;;AAAA;;CAAA;;AAAA;EAAA;;;;;;;;;kBAAA;AAAA;;AAAA;;;CAAA;;AAAA;;;CAAA;;AAAA;EAAA,SAAA,EAAA,MAAA;EAAA,cAAA,EAAA,MAAA;AAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;EAAA,yCAAA;UAAA,iCAAA;AAAA;;AAAA;;CAAA;;AAAA;;EAAA,mBAAA;AAAA;;AAAA;;;CAAA;;AAAA;;;;EAAA;;;;;;WAAA,EAAA,MAAA;EAAA,cAAA,EAAA,MAAA;AAAA;;AAAA;;CAAA;;AAAA;EAAA,cAAA;AAAA;;AAAA;;CAAA;;AAAA;;EAAA,cAAA;EAAA,cAAA;EAAA,kBAAA;EAAA,wBAAA;AAAA;;AAAA;EAAA,eAAA;AAAA;;AAAA;EAAA,WAAA;AAAA;;AAAA;;;CAAA;;AAAA;;;CAAA;;AAAA;EAAA,cAAA,EAAA,MAAA;EAAA,qBAAA,EAAA,MAAA;AAAA;;AAAA;;;CAAA;;AAAA;;;CAAA;;AAAA;;;;;EAAA,oBAAA,EAAA,MAAA;EAAA,eAAA,EAAA,MAAA;EAAA,iBAAA,EAAA,MAAA;EAAA,SAAA,EAAA,MAAA;AAAA;;AAAA;;;CAAA;;AAAA;SAAA,MAAA;EAAA,oBAAA;AAAA;;AAAA;;CAAA;;AAAA;;;EAAA,0BAAA;AAAA;;AAAA;;CAAA;;AAAA;;CAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;EAAA,UAAA;AAAA;;AAAA;;CAAA;;AAAA;EAAA,wBAAA;AAAA;;AAAA;;CAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;;;CAAA;;AAAA;;;CAAA;;AAAA;;CAAA;;AAAA;EAAA,kBAAA;AAAA;;AAAA;;;;EAAA;;AAAA;;EAAA;;AAAA;;;;;;;;;;;;;EAAA,SAAA;AAAA;;AAAA;EAAA,6BAAA;EAAA,sBAAA;AAAA;;AAAA;;;EAAA;;AAAA;EAAA,mBAAA;EAAA,0CAAA;AAAA;;AAAA;EAAA,SAAA;EAAA,UAAA;AAAA;;AAAA;;EAAA,gBAAA;EAAA,SAAA;EAAA,UAAA;AAAA;;AAAA;;EAAA;;AAAA;;;;;EAAA;;AAAA;EAAA,iBAAA,EAAA,MAAA;EAAA,gBAAA,EAAA,MAAA;AAAA;;AAAA;;;EAAA;;AAAA;EAAA,oBAAA;EAAA,oBAAA;AAAA;;AAAA;;;;;;;;;;;;;;;;;;;;;;;;EAAA;;AAAA;;;EAAA,sBAAA,EAAA,MAAA;EAAA,eAAA,EAAA,MAAA;EAAA,mBAAA,EAAA,MAAA;EAAA,qBAAA,EAAA,MAAA;AAAA;;AAAA;;EAAA;;AAAA;EAAA,qBAAA;AAAA;;AAAA;;;;;;;;EAAA;;AAAA;EAAA,mBAAA;AAAA;;AAAA;EAAA,gBAAA;AAAA;;AAAA;EAAA,cAAA;AAAA;;AAAA;EAAA,cAAA;AAAA;;AAAA;;EAAA,cAAA;AAAA;;AAAA;EAAA,eAAA;AAAA;;AAAA;EAAA,yBAAA;AAAA;;AAAA;;;;;;EAAA,kBAAA;EAAA,oBAAA;AAAA;;AAAA;;;EAAA;;AAAA;EAAA,cAAA;EAAA,wBAAA;AAAA;;AAAA;;;;;;EAAA;;AAAA;;;;;EAAA,UAAA;EAAA,oBAAA;EAAA,cAAA;AAAA;;AAAA;;;;;EAAA;;AAAA;;;;EAAA,+GAAA;AAAA;;AAAA;;;;;;EAAA;;AAAA;;;;;;;;EAAA,cAAA;EAAA,sBAAA;AAAA;;AAAA;;;;;EAAA;;AAAA;;EAAA,eAAA;EAAA,YAAA;AAAA;;AAAA;EAAA,kBAAA;EAAA,UAAA;EAAA,WAAA;EAAA,UAAA;EAAA,YAAA;EAAA,gBAAA;EAAA,sBAAA;EAAA,mBAAA;EAAA;AAAA;;AAAA;EAAA,kBAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA,mBAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA,4CAAA;EAAA,2BAAA;EAAA,4BAAA;EAAA,yCAAA;EAAA,kCAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;AAAA;;AAAA;EAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA,mBAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA,mBAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA;EAAA;AAAA;;AAAA;EAAA;IAAA,2BAAA;IAAA,0DAAA;YAAA;EAAA;;EAAA;IAAA,eAAA;IAAA,0DAAA;YAAA;EAAA;AAAA;;AAAA;EAAA;IAAA,2BAAA;IAAA,0DAAA;YAAA;EAAA;;EAAA;IAAA,eAAA;IAAA,0DAAA;YAAA;EAAA;AAAA;;ACEA;EDFA,kBAAA;EAAA,mBAAA;EAAA,mBAAA;EAAA;ACKE;;AAGF;EDRA;ACSE;;AAGF;EDZA;ACaE;;AAGF;EDhBA;ACiBE;;AAGF;EDpBA;ACqBE;;ACrBF;EACE;AAAA;;AAWA;ECXA,yBAAA;EACA;AAF0C;;ADiB5C;EACE,QAAA;EACA,gBAAA;EACA,kCAAA;EACA;AAAA;;AAGF;EAIE,YAAA;EACA;AERS;;ADUT;EDPF;IAQI;EEVO;AAAA;;AFcX;EACE;AAAA;;ACNA;EDKF;IAII;EAAA;AAAA;;AAIJ;EAEE;AEtBS;;ADaT;EDOF;IAKI;EExBO;AAAA;;AF4BX;EAEE;AErDgB;;AFwDlB;EAME,6BAAA;EACA,gBAAA;EACA;AAAA;;AAGF;EACE,eAAA;EACA,aAAA;EACA,iBEjDS;EFkDT;AElDS;;ADgCT;EDcF;IAOI;EAAA;AAAA;;AAIJ;EAEE;AAAA;;AAEA;EACE,+BAAA;EACA,aAAA;EACA;AAAA;;AAIJ;EACE;AExEU;;ADiBV;EDsDF;IAII;EAAA;AAAA;;AAIJ;EACE,iBAAA;EACA;AAAA;;AAOF;EACE;AAAA;;ACxEA;EDuEF;IAII;EAAA;AAAA;;AGhHJ;ELAA,kBAAA;EAAA,wDAAA;EAAA,sBAAA;EAAA,wDAAA;EAAA,wBAAA;EAAA,eAAA;EAAA,gBAAA;EAAA,kBAAA;EAAA,kBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,8BAAA;EAAA,mBAAA;EAAA,oBAAA;EAAA,uBAAA;EAAA,qBAAA;EAAA,sBAAA;EAAA,oBAAA;EAAA,kDAAA;EAAA,qBAAA;EAAA;AKCE;;AACA;ELFF,kBAAA;EAAA;AKGI;;AAIJ;ELPA,6BAAA;EAAA,sBAAA;EAAA,wDAAA;EAAA,iBAAA;EAAA,mBAAA;EAAA,sBAAA;EAAA,kBAAA;EAAA,mBAAA;EAAA,oBAAA;EAAA;AKQE;;AACA;ELTF,kBAAA;EAAA,wDAAA;EAAA,oBAAA;EAAA;AKUI;;AAIJ;ELdA,cAAA;EAAA,gBAAA;EAAA,oBAAA;EAAA,mBAAA;EAAA,kBAAA;EAAA,mBAAA;EAAA;AKeE;;AAGF;ELlBA,sBAAA;EAAA,wDAAA;EAAA,mBAAA;EAAA,iBAAA;EAAA,aAAA;EAAA,oBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,uBAAA;EAAA;AKmBE;;AAGF;ELtBA,sBAAA;EAAA,wDAAA;EAAA,mBAAA;EAAA,iBAAA;EAAA,kBAAA;EAAA,qBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,uBAAA;EAAA;AKuBE;;AAGF;EL1BA,mBAAA;EAAA,sBAAA;EAAA;AK2BE;;AAGF;EL9BA,eAAA;EAAA,qBAAA;EAAA;AK+BE;;AAGF;ELlCA,sBAAA;EAAA,wDAAA;EAAA,mBAAA;EAAA,iBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,uBAAA;EAAA;AKmCE;;ACnCF;ENAA;IAAA;EAAA;CMAA;;ANAA;EAAA,sBAAA;EAAA,wDAAA;EAAA,sBAAA;EAAA,iBAAA;EAAA,cAAA;EAAA,kBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA,oBAAA;EAAA,kDAAA;EAAA,sBAAA;EAAA;AAAA;;AK4CE;EL5CF,kBAAA;EAAA,wDAAA;EAAA,oBAAA;EAAA;AK6CI;;AAIJ;ELjDA,oBAAA;EAAA,qBAAA;EAAA,oBAAA;EAAA;AKkDE;;AAEA;ELpDF,sBAAA;EAAA,wDAAA;EAAA,iBAAA;EAAA,cAAA;EAAA,oBAAA;EAAA,sBAAA;EAAA;AKqDI;;ALrDJ;EAAA,eAAA;EAAA,gBAAA;EAAA,eAAA;EAAA,kBAAA;EAAA;AAAA;;AKgEA;ELhEA,kBAAA;EAAA,2DAAA;EAAA,sBAAA;EAAA,yDAAA;EAAA,sBAAA;EAAA,kBAAA;EAAA,qBAAA;EAAA,qBAAA;EAAA;AKiEE;;AAEA;EACE,eD/CO;ECgDP;AD9CO;;ACkDX;ELzEA,oBAAA;EAAA;AK0EE;;AE1EF;EACE,eAAA;EACA;AHuBS;;AGrBT;EACE;AAAA;;AJgCF;EIrCF;IASI,+BAAA;IACA;EAAA;AAAA;;AAGF;EACE,kBAAA;EACA,6BAAA;EACA;AAAA;;AAGF;EACE,eAAA;EACA,kBHCO;EAAA;AAAA;;AGEP;EJlBF,4BAAA;EACA,oBAAA;EACA,qBAAA;EACA,mBAAA;EACA,oBAAA;EACA,0BAAA;EACA,6BAAA;EACA,uCAAA;EACA,+BAAA;EACA,mBAAA;EACA;AAAA;;AIYE;EAEE,QAAA;EACA,eAAA;EACA;AAAA;;AAGF;EACE,eAAA;EACA,aHnCY;EGoCZ,yBAAA;EACA,QAAA;EAEA,eAAA;EACA;AAAA;;AAEA;EJ3CJ,yBAAA;EACA;AI2C0B;;AJd1B;EIZA;IA+BI;EAAA;AAAA;;AJbJ;EIlBA;IAmCI,eAAA;IACA;EAAA;AAAA;;AAIJ;EACE,WAAA;EACA,eAAA;EACA,WAAA;EACA,kBHzCO;EG0CP;AH1CO;;ADeT;EIsBA;IAQI,WAAA;IACA;EAAA;AAAA;;AAKN;EJnEE,4BAAA;EACA,oBAAA;EACA,qBAAA;EACA,mBAAA;EACA,oBAAA;EACA,0BAAA;EACA,6BAAA;EACA,uCAAA;EACA,+BAAA;EACA,mBAAA;EACA;AAAA;;AI6DF;EACE,kBAAA;EACA;AAAA;;AAIA;EAEE,YAAA;EACA,sBAAA;EACA,gBHjEO;EGkEP,mBHlEO;EGmEP;AHlEO;;ADcT;EI8CA;IASI,kBAAA;IACA;EHpEK;AAAA;;AGwET;EACE;AAAA;;AAGF;EACE,qBAAA;EACA,eAAA;EACA,kBAAA;EACA;AAAA;;AJpEF;EIgEA;IAOI;EAAA;AAAA;;AAIJ;EACE;AAAA;;AJ5EF;EI2EA;IAII;EAAA;AAAA;;AAKN;EACE,UAAA;EACA,iBAAA;EACA,SAAA;EACA,iBAAA;EACA;AAAA;;AAEA;EACE,iBAAA;EACA,SAAA;EACA,UAAA;EACA,eAAA;EACA;AAAA;;AAEA;EACE,eAAA;EACA,WAAA;EACA,UAAA;EACA,WAAA;EACA,aAAA;EACA,qBAAA;EACA;AAAA;;AD9IN;CAAA;;AAAA;CAAA;;AAAA;CAAA;;AAAA;ENAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;;EAAA;IAAA;EAAA;CMAA;;AAAA;CAAA;;AAAA;CAAA",
          sourcesContent: [
            "@tailwind base;\n",
            "/* Adjustments for tailwind defaults that conflict with the node-starter-app defaults */\n\nh1 {\n  @apply text-4xl;\n  @apply mb-4;\n  @apply mt-4;\n}\n\nol {\n  @apply list-decimal;\n}\n\nul {\n  @apply list-disc;\n}\n\na {\n  @apply underline;\n}\n\n.canada-wordmark img {\n  @apply inline;\n}\n",
            '* {\n  box-sizing: border-box;\n}\n\na[href],\narea[href],\ninput,\nselect textarea,\nbutton,\niframe,\n[tabindex],\n[contentEditable="true"] {\n  &:not([disabled]):focus:not(.autocomplete__option) {\n    @include focus();\n  }\n}\n\nbody {\n  margin: 0;\n  font-size: 1.25em;\n  font-family: "Noto Sans", sans-serif;\n  line-height: 1.65;\n}\n\np,\n.multiple-choice__item p,\nol,\nul {\n  margin-top: 0;\n  margin-bottom: $space-xs;\n\n  @include xs {\n    margin-bottom: $space-sm;\n  }\n}\n\np + ul {\n  margin-top: -$space-xs;\n\n  @include xs {\n    margin-top: -$space-sm;\n  }\n}\n\nol,\nul {\n  padding-left: $space-lg;\n\n  @include sm {\n    padding-left: $space-xl;\n  }\n}\n\na,\na:visited {\n  color: $color-blue-dark;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-family: "Lato", sans-serif;\n  line-height: 1.33;\n  font-weight: 600;\n}\n\n%page-container {\n  max-width: 960px;\n  margin: 0 auto;\n  padding-left: $space-md;\n  padding-right: $space-md;\n\n  @include xl {\n    max-width: 1024px;\n  }\n}\n\nmain {\n  @extend %page-container;\n  padding: 0 $space-md;\n\n  h1 {\n    border-bottom: 1px solid $color-red;\n    margin: 5rem 0;\n    font-size: 2.25rem;\n  }\n}\n\nli:not(:last-of-type) {\n  padding-bottom: $space-xxs;\n\n  @include sm {\n    padding-bottom: 0;\n  }\n}\n\n.outer-container {\n  position: relative;\n  min-height: 100vh;\n}\n\n.page--container {\n  @extend %page-container;\n}\n\n.hide--mobile {\n  display: none;\n\n  @include sm {\n    display: inherit;\n  }\n}\n',
            "@mixin focus($outline: 3px, $outlineOffset: 0) {\n  outline: $outline solid $color-yellow;\n  outline-offset: $outlineOffset;\n}\n\n@mixin visuallyHidden() {\n  position: absolute !important;\n  width: 1px !important;\n  height: 1px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n  clip: rect(0 0 0 0) !important;\n  -webkit-clip-path: inset(50%) !important;\n  clip-path: inset(50%) !important;\n  border: 0 !important;\n  white-space: nowrap !important;\n}\n\n/*\n    media queries based on Pure CSS's breakpoints: https://purecss.io/grids/\n\n    usage example:\n\n    @include sm {\n      width: 100%;\n    }\n*/\n\n/* ≥ 332px */\n@mixin xs {\n  @media screen and (min-width: 23em) {\n    @content;\n  }\n}\n/* ≥ 526px */\n@mixin sm {\n  @media screen and (min-width: 36.5em) {\n    @content;\n  }\n}\n/* ≥ 768px */\n@mixin md {\n  @media screen and (min-width: 48em) {\n    @content;\n  }\n}\n/* ≥ 1024px */\n@mixin lg {\n  @media screen and (min-width: 64em) {\n    @content;\n  }\n}\n/* ≥ 1200px */\n@mixin xl {\n  @media screen and (min-width: 75em) {\n    @content;\n  }\n}\n",
            "// colours (using 'color' because of CSS conventions)\n\n$color-blue-dark: #284162;\n$color-blue-light: #335075;\n$color-banner-blue: #4b98b2;\n$color-banner-blue-light: #dff8fd;\n$color-yellow: #c78100;\n$color-white: #ffffff;\n$color-black: #000000;\n$color-red: #af3c43;\n$color-red-light: #f3e9e8;\n$color-purple: #7834bc;\n$color-grey-light: #cbcbcb;\n$color-grey-medium: #909090;\n$color-grey-dark: #666666;\n$color-green: #138a00;\n$color-green-dark: #0b4e00;\n\n// spacing units\n\n$space-xxs: 5px;\n$space-xs: 10px;\n$space-sm: 15px;\n$space-md: 20px;\n$space-lg: 30px;\n$space-xl: 40px;\n$space-xxl: 60px;\n\n// other vars\n$height-footer: 80px;\n$multiple-choice-padding-left: 40px;\n",
            ".gc-button {\n  @apply cursor-pointer border-b-4 border-gray-900 py-3 px-5 mr-2 my-10 font-bold text-base no-underline text-gray-50 bg-blue-800 outline-none w-60;\n  &:hover {\n    @apply bg-blue-700;\n  }\n}\n\n.gc-button--secondary {\n  @apply bg-transparent px-16 py-2 border-2 border-green-700 text-green-700;\n  &:hover {\n    @apply text-gray-50 bg-green-700;\n  }\n}\n\n.gc-label {\n  @apply block py-2 mt-10 mb-4 font-bold leading-5;\n}\n\n.gc-textarea {\n  @apply border-solid border-2 py-3 px-2 border-gray-900 w-4/6 h-40;\n}\n\n.gc-input-text {\n  @apply border-solid border-2 py-3 px-2 my-2 border-gray-900 mb-2 w-3/6;\n}\n\n.gc-plain-text {\n  @apply w-full my-5;\n}\n\n.gc-heading-2 {\n  @apply mt-20 mb-10 text-lg;\n}\n\n.gc-dropdown {\n  @apply w-full lg:w-3/6 border-solid border-2 py-3 px-2 border-gray-900 mb-2;\n}\n\n.gc-checkbox {\n  .gc-checkbox__input,\n  form input.gc-checkbox__input {\n    @apply text-gray-50 h-10 w-10 border-2 border-gray-900 rounded mr-2 align-middle my-2;\n  }\n\n  &:checked {\n    @apply text-gray-50 bg-blue-800;\n  }\n}\n\n.gc-input-radio {\n  @apply py-3 px-2;\n\n  .gc-radio__input {\n    @apply h-10 w-10 border-2 border-gray-900 mr-2 align-middle;\n  }\n}\n\n.gc-checkbox,\n.gc-input-radio {\n  .gc-label {\n    @apply inline font-normal my-0 p-2;\n  }\n}\n\n.error-list {\n  @apply px-5 bg-red-50 border-l-4 border-red-500 my-2;\n\n  &__header {\n    margin-top: $space-xs;\n    margin-bottom: $space-md;\n  }\n}\n\n.validation-message {\n  @apply text-red-500;\n}\n",
            null,
            "header {\n  padding: 0 0 0 0;\n  margin-bottom: $space-xl;\n\n  button {\n    padding: 0;\n  }\n\n  @include sm {\n    margin-bottom: calc(#{$space-xl} + #{$space-xl});\n    text-align: right;\n  }\n\n  .fip-container {\n    flex-direction: row;\n    justify-content: space-between;\n    display: flex;\n  }\n\n  .language-link {\n    text-align: left;\n    margin-bottom: $space-sm;\n    font-size: 0.85em;\n\n    h2 {\n      @include visuallyHidden();\n    }\n\n    form,\n    button {\n      margin: 0;\n      max-width: unset;\n      width: auto;\n    }\n\n    button {\n      background: none;\n      color: $color-blue-dark;\n      text-decoration: underline;\n      border: 0;\n\n      box-shadow: none;\n      font-size: 0.9em;\n\n      &:focus {\n        @include focus(3px, 3px);\n      }\n    }\n\n    @include xs {\n      font-size: 0.9em;\n    }\n\n    @include sm {\n      margin-bottom: 0;\n      font-size: 1em;\n    }\n  }\n\n  .canada-flag {\n    height: auto;\n    max-height: 40px;\n    width: 272px;\n    margin-bottom: $space-sm;\n    margin-right: $space-sm;\n\n    @include sm {\n      width: 360px;\n      margin-bottom: 0;\n    }\n  }\n}\n\n.visually-hidden {\n  @include visuallyHidden();\n}\n\n.phase-banner {\n  background: #f4f4f4;\n  line-height: 1.33;\n}\n\n.phase-banner {\n  div {\n    @extend %page-container;\n    display: flex;\n    align-items: flex-start;\n    padding-top: $space-sm;\n    padding-bottom: $space-sm;\n    margin-bottom: $space-md;\n\n    @include sm {\n      align-items: center;\n      margin-bottom: $space-xl;\n    }\n  }\n\n  span {\n    font-size: 0.7em;\n  }\n\n  span:first-of-type {\n    border: 2px $color-black solid;\n    padding: 1px 5px;\n    letter-spacing: 1px;\n    margin-right: 1.7em;\n\n    @include sm {\n      padding: 1px 7px;\n    }\n  }\n\n  span:last-of-type {\n    margin-top: 3px;\n\n    @include sm {\n      margin-top: 0px;\n    }\n  }\n}\n\n#skip-link-container {\n  width: 100%;\n  position: absolute;\n  z-index: 5;\n  text-align: center;\n  top: 10px;\n\n  #skip-link {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    overflow: hidden;\n    white-space: nowrap;\n\n    &:focus {\n      position: static;\n      padding: 5px;\n      width: auto;\n      height: auto;\n      overflow: auto;\n      background-color: white;\n      text-align: center;\n    }\n  }\n}\n",
          ],
          sourceRoot: "",
        },
      ]),
        (__webpack_exports__.a = ___CSS_LOADER_EXPORT___);
    },
    487: function (module, exports, __webpack_require__) {
      __webpack_require__(488),
        __webpack_require__(652),
        __webpack_require__(653),
        __webpack_require__(810),
        __webpack_require__(1028),
        __webpack_require__(1061),
        __webpack_require__(1066),
        __webpack_require__(1078),
        __webpack_require__(1080),
        __webpack_require__(1085),
        __webpack_require__(1087),
        __webpack_require__(1090),
        __webpack_require__(1093),
        (module.exports = __webpack_require__(1097));
    },
    561: function (module, exports) {},
    653: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__(211);
    },
    66: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.d(__webpack_exports__, "a", function () {
        return Label;
      });
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          2
        ),
        classnames__WEBPACK_IMPORTED_MODULE_2__ =
          (__webpack_require__(0), __webpack_require__(34)),
        classnames__WEBPACK_IMPORTED_MODULE_2___default = __webpack_require__.n(
          classnames__WEBPACK_IMPORTED_MODULE_2__
        ),
        Label = function Label(props) {
          var children = props.children,
            htmlFor = props.htmlFor,
            className = props.className,
            error = props.error,
            hint = props.hint,
            srOnly = props.srOnly,
            classes = classnames__WEBPACK_IMPORTED_MODULE_2___default()(
              {
                "gc-label": !srOnly,
                "gc-sr-only": srOnly,
                "gc-label--error": error,
              },
              className
            );
          return Object(
            react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs
          )("label", {
            "data-testid": "label",
            className: classes,
            htmlFor: htmlFor,
            children: [
              children,
              hint &&
                Object(
                  react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx
                )("span", { className: "gc-hint", children: hint }),
            ],
          });
        };
      Label.displayName = "Label";
      try {
        (Label.displayName = "Label"),
          (Label.__docgenInfo = {
            description: "",
            displayName: "Label",
            props: {
              htmlFor: {
                defaultValue: null,
                description: "",
                name: "htmlFor",
                required: !0,
                type: { name: "string" },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              error: {
                defaultValue: null,
                description: "",
                name: "error",
                required: !1,
                type: { name: "boolean" },
              },
              hint: {
                defaultValue: null,
                description: "",
                name: "hint",
                required: !1,
                type: { name: "ReactNode" },
              },
              srOnly: {
                defaultValue: null,
                description: "",
                name: "srOnly",
                required: !1,
                type: { name: "boolean" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/Label/Label.tsx#Label"
            ] = {
              docgenInfo: Label.__docgenInfo,
              name: "Label",
              path: "components/forms/Label/Label.tsx#Label",
            });
      } catch (__react_docgen_typescript_loader_error) {}
    },
    77: function (module, __webpack_exports__, __webpack_require__) {
      "use strict";
      __webpack_require__.d(__webpack_exports__, "a", function () {
        return TextInput;
      });
      __webpack_require__(11),
        __webpack_require__(7),
        __webpack_require__(3),
        __webpack_require__(8);
      var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
          2
        ),
        classnames__WEBPACK_IMPORTED_MODULE_6__ =
          (__webpack_require__(0), __webpack_require__(34)),
        classnames__WEBPACK_IMPORTED_MODULE_6___default = __webpack_require__.n(
          classnames__WEBPACK_IMPORTED_MODULE_6__
        );
      function _objectWithoutProperties(source, excluded) {
        if (null == source) return {};
        var key,
          i,
          target = (function _objectWithoutPropertiesLoose(source, excluded) {
            if (null == source) return {};
            var key,
              i,
              target = {},
              sourceKeys = Object.keys(source);
            for (i = 0; i < sourceKeys.length; i++)
              (key = sourceKeys[i]),
                excluded.indexOf(key) >= 0 || (target[key] = source[key]);
            return target;
          })(source, excluded);
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++)
            (key = sourceSymbolKeys[i]),
              excluded.indexOf(key) >= 0 ||
                (Object.prototype.propertyIsEnumerable.call(source, key) &&
                  (target[key] = source[key]));
        }
        return target;
      }
      var TextInput = function TextInput(props) {
        var id = props.id,
          name = props.name,
          type = props.type,
          className = props.className,
          inputRef = props.inputRef,
          inputProps = _objectWithoutProperties(props, [
            "id",
            "name",
            "type",
            "className",
            "inputRef",
          ]),
          classes = classnames__WEBPACK_IMPORTED_MODULE_6___default()(
            "gc-input-text",
            className
          );
        return Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(
          "input",
          Object.assign(
            {
              "data-testid": "textInput",
              className: classes,
              id: id,
              name: name,
              type: type,
              ref: inputRef,
            },
            inputProps
          )
        );
      };
      TextInput.displayName = "TextInput";
      try {
        (TextInput.displayName = "TextInput"),
          (TextInput.__docgenInfo = {
            description: "",
            displayName: "TextInput",
            props: {
              id: {
                defaultValue: null,
                description: "",
                name: "id",
                required: !1,
                type: { name: "string" },
              },
              name: {
                defaultValue: null,
                description: "",
                name: "name",
                required: !1,
                type: { name: "string" },
              },
              type: {
                defaultValue: null,
                description: "",
                name: "type",
                required: !1,
                type: {
                  name: "enum",
                  value: [
                    { value: '"number"' },
                    { value: '"text"' },
                    { value: '"email"' },
                    { value: '"password"' },
                    { value: '"search"' },
                    { value: '"tel"' },
                    { value: '"url"' },
                  ],
                },
              },
              className: {
                defaultValue: null,
                description: "",
                name: "className",
                required: !1,
                type: { name: "string" },
              },
              validationStatus: {
                defaultValue: null,
                description: "",
                name: "validationStatus",
                required: !1,
                type: { name: '"success" | "error"' },
              },
              success: {
                defaultValue: null,
                description: "",
                name: "success",
                required: !1,
                type: { name: "boolean" },
              },
              inputSize: {
                defaultValue: null,
                description: "",
                name: "inputSize",
                required: !1,
                type: { name: '"small" | "medium"' },
              },
              inputRef: {
                defaultValue: null,
                description: "",
                name: "inputRef",
                required: !1,
                type: { name: "TextInputRef" },
              },
            },
          }),
          "undefined" != typeof STORYBOOK_REACT_CLASSES &&
            (STORYBOOK_REACT_CLASSES[
              "components/forms/TextInput/TextInput.tsx#TextInput"
            ] = {
              docgenInfo: TextInput.__docgenInfo,
              name: "TextInput",
              path: "components/forms/TextInput/TextInput.tsx#TextInput",
            });
      } catch (__react_docgen_typescript_loader_error) {}
    },
  },
  [[487, 1, 2]],
]);
//# sourceMappingURL=main.14797a2181611a14c9b9.bundle.js.map
