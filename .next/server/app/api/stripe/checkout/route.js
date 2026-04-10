"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/stripe/checkout/route";
exports.ids = ["app/api/stripe/checkout/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcheckout%2Froute&page=%2Fapi%2Fstripe%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcheckout%2Froute&page=%2Fapi%2Fstripe%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_larsneeft_Downloads_ideabox_app_api_stripe_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/stripe/checkout/route.ts */ \"(rsc)/./app/api/stripe/checkout/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/stripe/checkout/route\",\n        pathname: \"/api/stripe/checkout\",\n        filename: \"route\",\n        bundlePath: \"app/api/stripe/checkout/route\"\n    },\n    resolvedPagePath: \"/Users/larsneeft/Downloads/ideabox/app/api/stripe/checkout/route.ts\",\n    nextConfigOutput,\n    userland: _Users_larsneeft_Downloads_ideabox_app_api_stripe_checkout_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/stripe/checkout/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdHJpcGUlMkZjaGVja291dCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGc3RyaXBlJTJGY2hlY2tvdXQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZzdHJpcGUlMkZjaGVja291dCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmxhcnNuZWVmdCUyRkRvd25sb2FkcyUyRmlkZWFib3glMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGbGFyc25lZWZ0JTJGRG93bmxvYWRzJTJGaWRlYWJveCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDbUI7QUFDaEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9pZGVhZmxvdy8/YzFlYyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbGFyc25lZWZ0L0Rvd25sb2Fkcy9pZGVhYm94L2FwcC9hcGkvc3RyaXBlL2NoZWNrb3V0L3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9zdHJpcGUvY2hlY2tvdXQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9zdHJpcGUvY2hlY2tvdXRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3N0cmlwZS9jaGVja291dC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9sYXJzbmVlZnQvRG93bmxvYWRzL2lkZWFib3gvYXBwL2FwaS9zdHJpcGUvY2hlY2tvdXQvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3N0cmlwZS9jaGVja291dC9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcheckout%2Froute&page=%2Fapi%2Fstripe%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/stripe/checkout/route.ts":
/*!******************************************!*\
  !*** ./app/api/stripe/checkout/route.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var stripe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stripe */ \"(rsc)/./node_modules/stripe/esm/stripe.esm.node.js\");\n/* harmony import */ var _lib_supabase_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/supabase/server */ \"(rsc)/./lib/supabase/server.ts\");\n\n\n\nconst stripe = new stripe__WEBPACK_IMPORTED_MODULE_1__[\"default\"](process.env.STRIPE_SECRET_KEY, {\n    apiVersion: \"2024-06-20\"\n});\nasync function POST() {\n    try {\n        const supabase = (0,_lib_supabase_server__WEBPACK_IMPORTED_MODULE_2__.createClient)();\n        const { data: { user }, error: userError } = await supabase.auth.getUser();\n        if (userError || !user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        const { data: profile, error: profileError } = await supabase.from(\"profiles\").select(\"company_id\").eq(\"id\", user.id).single();\n        if (profileError || !profile?.company_id) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"No company found\"\n            }, {\n                status: 400\n            });\n        }\n        if (!process.env.STRIPE_SECRET_KEY) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Missing STRIPE_SECRET_KEY\"\n            }, {\n                status: 500\n            });\n        }\n        if (false) {}\n        const session = await stripe.checkout.sessions.create({\n            mode: \"subscription\",\n            payment_method_types: [\n                \"card\"\n            ],\n            customer_email: user.email ?? undefined,\n            line_items: [\n                {\n                    price_data: {\n                        currency: \"eur\",\n                        unit_amount: 1200,\n                        recurring: {\n                            interval: \"month\"\n                        },\n                        product_data: {\n                            name: \"IdeaFlow Pro\"\n                        }\n                    },\n                    quantity: 1\n                }\n            ],\n            success_url: `${\"http://localhost:3000\"}/dashboard?upgraded=true`,\n            cancel_url: `${\"http://localhost:3000\"}/dashboard`,\n            metadata: {\n                company_id: profile.company_id\n            }\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            url: session.url\n        });\n    } catch (error) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: error instanceof Error ? error.message : \"Something went wrong\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3N0cmlwZS9jaGVja291dC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTBDO0FBQ2Y7QUFDeUI7QUFFcEQsTUFBTUcsU0FBUyxJQUFJRiw4Q0FBTUEsQ0FBQ0csUUFBUUMsR0FBRyxDQUFDQyxpQkFBaUIsRUFBRztJQUN4REMsWUFBWTtBQUNkO0FBRU8sZUFBZUM7SUFDcEIsSUFBSTtRQUNGLE1BQU1DLFdBQVdQLGtFQUFZQTtRQUU3QixNQUFNLEVBQ0pRLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEVBQ2RDLE9BQU9DLFNBQVMsRUFDakIsR0FBRyxNQUFNSixTQUFTSyxJQUFJLENBQUNDLE9BQU87UUFFL0IsSUFBSUYsYUFBYSxDQUFDRixNQUFNO1lBQ3RCLE9BQU9YLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO2dCQUFFSixPQUFPO1lBQWUsR0FBRztnQkFBRUssUUFBUTtZQUFJO1FBQ3BFO1FBRUEsTUFBTSxFQUFFUCxNQUFNUSxPQUFPLEVBQUVOLE9BQU9PLFlBQVksRUFBRSxHQUFHLE1BQU1WLFNBQ2xEVyxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLGNBQ1BDLEVBQUUsQ0FBQyxNQUFNWCxLQUFLWSxFQUFFLEVBQ2hCQyxNQUFNO1FBS1QsSUFBSUwsZ0JBQWdCLENBQUNELFNBQVNPLFlBQVk7WUFDeEMsT0FBT3pCLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO2dCQUFFSixPQUFPO1lBQW1CLEdBQUc7Z0JBQUVLLFFBQVE7WUFBSTtRQUN4RTtRQUVBLElBQUksQ0FBQ2IsUUFBUUMsR0FBRyxDQUFDQyxpQkFBaUIsRUFBRTtZQUNsQyxPQUFPTixxREFBWUEsQ0FBQ2dCLElBQUksQ0FDdEI7Z0JBQUVKLE9BQU87WUFBNEIsR0FDckM7Z0JBQUVLLFFBQVE7WUFBSTtRQUVsQjtRQUVBLElBQUksS0FBZ0MsRUFBRSxFQUtyQztRQUVELE1BQU1VLFVBQVUsTUFBTXhCLE9BQU95QixRQUFRLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDO1lBQ3BEQyxNQUFNO1lBQ05DLHNCQUFzQjtnQkFBQzthQUFPO1lBQzlCQyxnQkFBZ0J0QixLQUFLdUIsS0FBSyxJQUFJQztZQUM5QkMsWUFBWTtnQkFDVjtvQkFDRUMsWUFBWTt3QkFDVkMsVUFBVTt3QkFDVkMsYUFBYTt3QkFDYkMsV0FBVzs0QkFBRUMsVUFBVTt3QkFBUTt3QkFDL0JDLGNBQWM7NEJBQ1pDLE1BQU07d0JBQ1I7b0JBQ0Y7b0JBQ0FDLFVBQVU7Z0JBQ1o7YUFDRDtZQUNEQyxhQUFhLENBQUMsRUFBRXpDLHVCQUErQixDQUFDLHdCQUF3QixDQUFDO1lBQ3pFMEMsWUFBWSxDQUFDLEVBQUUxQyx1QkFBK0IsQ0FBQyxVQUFVLENBQUM7WUFDMUQyQyxVQUFVO2dCQUNSdEIsWUFBWVAsUUFBUU8sVUFBVTtZQUNoQztRQUNGO1FBRUEsT0FBT3pCLHFEQUFZQSxDQUFDZ0IsSUFBSSxDQUFDO1lBQUVnQyxLQUFLckIsUUFBUXFCLEdBQUc7UUFBQztJQUM5QyxFQUFFLE9BQU9wQyxPQUFPO1FBQ2QsT0FBT1oscURBQVlBLENBQUNnQixJQUFJLENBQ3RCO1lBQ0VKLE9BQU9BLGlCQUFpQnFDLFFBQVFyQyxNQUFNc0MsT0FBTyxHQUFHO1FBQ2xELEdBQ0E7WUFBRWpDLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaWRlYWZsb3cvLi9hcHAvYXBpL3N0cmlwZS9jaGVja291dC9yb3V0ZS50cz80OTY3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IFN0cmlwZSBmcm9tICdzdHJpcGUnXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAL2xpYi9zdXBhYmFzZS9zZXJ2ZXInXG5cbmNvbnN0IHN0cmlwZSA9IG5ldyBTdHJpcGUocHJvY2Vzcy5lbnYuU1RSSVBFX1NFQ1JFVF9LRVkhLCB7XG4gIGFwaVZlcnNpb246ICcyMDI0LTA2LTIwJyxcbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KClcblxuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHsgdXNlciB9LFxuICAgICAgZXJyb3I6IHVzZXJFcnJvcixcbiAgICB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKClcblxuICAgIGlmICh1c2VyRXJyb3IgfHwgIXVzZXIpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pXG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcbiAgICAgIC5zZWxlY3QoJ2NvbXBhbnlfaWQnKVxuICAgICAgLmVxKCdpZCcsIHVzZXIuaWQpXG4gICAgICAuc2luZ2xlKCkgYXMgdW5rbm93biBhcyB7XG4gICAgICAgIGRhdGE6IHsgY29tcGFueV9pZDogc3RyaW5nIHwgbnVsbCB9IHwgbnVsbFxuICAgICAgICBlcnJvcjogRXJyb3IgfCBudWxsXG4gICAgICB9XG5cbiAgICBpZiAocHJvZmlsZUVycm9yIHx8ICFwcm9maWxlPy5jb21wYW55X2lkKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ05vIGNvbXBhbnkgZm91bmQnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICBpZiAoIXByb2Nlc3MuZW52LlNUUklQRV9TRUNSRVRfS0VZKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdNaXNzaW5nIFNUUklQRV9TRUNSRVRfS0VZJyB9LFxuICAgICAgICB7IHN0YXR1czogNTAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoIXByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0FQUF9VUkwpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogJ01pc3NpbmcgTkVYVF9QVUJMSUNfQVBQX1VSTCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHN0cmlwZS5jaGVja291dC5zZXNzaW9ucy5jcmVhdGUoe1xuICAgICAgbW9kZTogJ3N1YnNjcmlwdGlvbicsXG4gICAgICBwYXltZW50X21ldGhvZF90eXBlczogWydjYXJkJ10sXG4gICAgICBjdXN0b21lcl9lbWFpbDogdXNlci5lbWFpbCA/PyB1bmRlZmluZWQsXG4gICAgICBsaW5lX2l0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcmljZV9kYXRhOiB7XG4gICAgICAgICAgICBjdXJyZW5jeTogJ2V1cicsXG4gICAgICAgICAgICB1bml0X2Ftb3VudDogMTIwMCxcbiAgICAgICAgICAgIHJlY3VycmluZzogeyBpbnRlcnZhbDogJ21vbnRoJyB9LFxuICAgICAgICAgICAgcHJvZHVjdF9kYXRhOiB7XG4gICAgICAgICAgICAgIG5hbWU6ICdJZGVhRmxvdyBQcm8nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHN1Y2Nlc3NfdXJsOiBgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUFBfVVJMfS9kYXNoYm9hcmQ/dXBncmFkZWQ9dHJ1ZWAsXG4gICAgICBjYW5jZWxfdXJsOiBgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUFBfVVJMfS9kYXNoYm9hcmRgLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgY29tcGFueV9pZDogcHJvZmlsZS5jb21wYW55X2lkLFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgdXJsOiBzZXNzaW9uLnVybCB9KVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHtcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1NvbWV0aGluZyB3ZW50IHdyb25nJyxcbiAgICAgIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiU3RyaXBlIiwiY3JlYXRlQ2xpZW50Iiwic3RyaXBlIiwicHJvY2VzcyIsImVudiIsIlNUUklQRV9TRUNSRVRfS0VZIiwiYXBpVmVyc2lvbiIsIlBPU1QiLCJzdXBhYmFzZSIsImRhdGEiLCJ1c2VyIiwiZXJyb3IiLCJ1c2VyRXJyb3IiLCJhdXRoIiwiZ2V0VXNlciIsImpzb24iLCJzdGF0dXMiLCJwcm9maWxlIiwicHJvZmlsZUVycm9yIiwiZnJvbSIsInNlbGVjdCIsImVxIiwiaWQiLCJzaW5nbGUiLCJjb21wYW55X2lkIiwiTkVYVF9QVUJMSUNfQVBQX1VSTCIsInNlc3Npb24iLCJjaGVja291dCIsInNlc3Npb25zIiwiY3JlYXRlIiwibW9kZSIsInBheW1lbnRfbWV0aG9kX3R5cGVzIiwiY3VzdG9tZXJfZW1haWwiLCJlbWFpbCIsInVuZGVmaW5lZCIsImxpbmVfaXRlbXMiLCJwcmljZV9kYXRhIiwiY3VycmVuY3kiLCJ1bml0X2Ftb3VudCIsInJlY3VycmluZyIsImludGVydmFsIiwicHJvZHVjdF9kYXRhIiwibmFtZSIsInF1YW50aXR5Iiwic3VjY2Vzc191cmwiLCJjYW5jZWxfdXJsIiwibWV0YWRhdGEiLCJ1cmwiLCJFcnJvciIsIm1lc3NhZ2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/stripe/checkout/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase/server.ts":
/*!********************************!*\
  !*** ./lib/supabase/server.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createClient: () => (/* binding */ createClient)\n/* harmony export */ });\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/ssr */ \"(rsc)/./node_modules/@supabase/ssr/dist/module/index.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nfunction createClient() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_1__.cookies)();\n    return (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_0__.createServerClient)(\"https://btlpwdyiohwzohebgrwv.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bHB3ZHlpb2h3em9oZWJncnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzAwNTksImV4cCI6MjA5MDM0NjA1OX0.oeFQLZDgk4ob4eoPoGYhMuEuoLQ1Cxw27vU2HvRh_hs\", {\n        cookies: {\n            getAll () {\n                return cookieStore.getAll();\n            },\n            setAll (cookiesToSet) {\n                try {\n                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));\n                } catch  {\n                // Server component — can be ignored if using middleware\n                }\n            }\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFrRDtBQUNaO0FBSy9CLFNBQVNFO0lBQ2QsTUFBTUMsY0FBY0YscURBQU9BO0lBQzNCLE9BQU9ELGlFQUFrQkEsQ0FDdkJJLDBDQUFvQyxFQUNwQ0Esa05BQXlDLEVBQ3pDO1FBQ0VILFNBQVM7WUFDUE87Z0JBQ0UsT0FBT0wsWUFBWUssTUFBTTtZQUMzQjtZQUNBQyxRQUFPQyxZQUEyQjtnQkFDaEMsSUFBSTtvQkFDRkEsYUFBYUMsT0FBTyxDQUFDLENBQUMsRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRSxHQUM1Q1gsWUFBWVksR0FBRyxDQUFDSCxNQUFNQyxPQUFPQztnQkFFakMsRUFBRSxPQUFNO2dCQUNOLHdEQUF3RDtnQkFDMUQ7WUFDRjtRQUNGO0lBQ0Y7QUFFSiIsInNvdXJjZXMiOlsid2VicGFjazovL2lkZWFmbG93Ly4vbGliL3N1cGFiYXNlL3NlcnZlci50cz82NjI1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZVNlcnZlckNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zc3InXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSAnbmV4dC9oZWFkZXJzJ1xuaW1wb3J0IHR5cGUgeyBEYXRhYmFzZSB9IGZyb20gJ0AvdHlwZXMvZGF0YWJhc2UnXG5cbnR5cGUgQ29va2llRW50cnkgPSB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IHN0cmluZzsgb3B0aW9ucz86IG9iamVjdCB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDbGllbnQoKSB7XG4gIGNvbnN0IGNvb2tpZVN0b3JlID0gY29va2llcygpXG4gIHJldHVybiBjcmVhdGVTZXJ2ZXJDbGllbnQ8RGF0YWJhc2U+KFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhLFxuICAgIHtcbiAgICAgIGNvb2tpZXM6IHtcbiAgICAgICAgZ2V0QWxsKCkge1xuICAgICAgICAgIHJldHVybiBjb29raWVTdG9yZS5nZXRBbGwoKVxuICAgICAgICB9LFxuICAgICAgICBzZXRBbGwoY29va2llc1RvU2V0OiBDb29raWVFbnRyeVtdKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvb2tpZXNUb1NldC5mb3JFYWNoKCh7IG5hbWUsIHZhbHVlLCBvcHRpb25zIH0pID0+XG4gICAgICAgICAgICAgIGNvb2tpZVN0b3JlLnNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucylcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIFNlcnZlciBjb21wb25lbnQg4oCUIGNhbiBiZSBpZ25vcmVkIGlmIHVzaW5nIG1pZGRsZXdhcmVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgKVxufVxuIl0sIm5hbWVzIjpbImNyZWF0ZVNlcnZlckNsaWVudCIsImNvb2tpZXMiLCJjcmVhdGVDbGllbnQiLCJjb29raWVTdG9yZSIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImdldEFsbCIsInNldEFsbCIsImNvb2tpZXNUb1NldCIsImZvckVhY2giLCJuYW1lIiwidmFsdWUiLCJvcHRpb25zIiwic2V0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@supabase","vendor-chunks/next","vendor-chunks/tslib","vendor-chunks/iceberg-js","vendor-chunks/cookie","vendor-chunks/stripe"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstripe%2Fcheckout%2Froute&page=%2Fapi%2Fstripe%2Fcheckout%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstripe%2Fcheckout%2Froute.ts&appDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Flarsneeft%2FDownloads%2Fideabox&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();