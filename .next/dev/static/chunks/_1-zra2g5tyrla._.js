(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    useLinkStatus: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    /**
 * A React component that extends the HTML `<a>` element to provide
 * [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
 * and client-side navigation. This is the primary way to navigate between routes in Next.js.
 *
 * @remarks
 * - Prefetching is only enabled in production.
 *
 * @see https://nextjs.org/docs/app/api-reference/components/link
 */ default: function() {
        return LinkComponent;
    },
    useLinkStatus: function() {
        return useLinkStatus;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"));
const _formaturl = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/format-url.js [app-client] (ecmascript)");
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
const _usemergedref = __turbopack_context__.r("[project]/node_modules/next/dist/client/use-merged-ref.js [app-client] (ecmascript)");
const _utils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)");
const _addbasepath = __turbopack_context__.r("[project]/node_modules/next/dist/client/add-base-path.js [app-client] (ecmascript)");
const _routerreducertypes = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/router-reducer/router-reducer-types.js [app-client] (ecmascript)");
const _links = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/links.js [app-client] (ecmascript)");
const _islocalurl = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/is-local-url.js [app-client] (ecmascript)");
const _types = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/segment-cache/types.js [app-client] (ecmascript)");
function isModifiedEvent(event) {
    const eventTarget = event.currentTarget;
    const target = eventTarget.getAttribute('target');
    return target && target !== '_self' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || // triggers resource download
    event.nativeEvent && event.nativeEvent.which === 2;
}
function linkClicked(e, href, linkInstanceRef, replace, scroll, onNavigate, transitionTypes, prefetchIntent = 'none') {
    if (typeof window !== 'undefined') {
        const { nodeName } = e.currentTarget;
        // anchors inside an svg have a lowercase nodeName
        const isAnchorNodeName = nodeName.toUpperCase() === 'A';
        if (isAnchorNodeName && isModifiedEvent(e) || e.currentTarget.hasAttribute('download')) {
            // ignore click for browser’s default behavior
            return;
        }
        if (!(0, _islocalurl.isLocalURL)(href)) {
            if (replace) {
                // browser default behavior does not replace the history state
                // so we need to do it manually
                e.preventDefault();
                location.replace(href);
            }
            // ignore click for browser’s default behavior
            return;
        }
        e.preventDefault();
        if (onNavigate) {
            let isDefaultPrevented = false;
            onNavigate({
                preventDefault: ()=>{
                    isDefaultPrevented = true;
                }
            });
            if (isDefaultPrevented) {
                return;
            }
        }
        const { navigate } = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigator.js [app-client] (ecmascript)");
        navigate(href, replace ? 'replace' : 'push', scroll === false ? _routerreducertypes.ScrollBehavior.NoScroll : _routerreducertypes.ScrollBehavior.Default, linkInstanceRef.current, transitionTypes, prefetchIntent);
    }
}
function formatStringOrUrl(urlObjOrString) {
    if (typeof urlObjOrString === 'string') {
        return urlObjOrString;
    }
    return (0, _formaturl.formatUrl)(urlObjOrString);
}
function LinkComponent(props) {
    const [linkStatus, setOptimisticLinkStatus] = (0, _react.useOptimistic)(_links.IDLE_LINK_STATUS);
    let children;
    const linkInstanceRef = (0, _react.useRef)(null);
    const { href: hrefProp, as: asProp, children: childrenProp, prefetch: prefetchProp = null, passHref, replace, shallow, scroll, onClick, onMouseEnter: onMouseEnterProp, onTouchStart: onTouchStartProp, legacyBehavior = false, onNavigate, transitionTypes, ref: forwardedRef, unstable_dynamicOnHover, ...restProps } = props;
    children = childrenProp;
    if (legacyBehavior && (typeof children === 'string' || typeof children === 'number')) {
        children = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            children: children
        });
    }
    const router = _react.default.useContext(_approutercontextsharedruntime.AppRouterContext);
    const prefetchEnabled = prefetchProp !== false;
    const prefetchIntent = prefetchProp === false ? 'none' : prefetchProp === true ? 'full' : 'auto';
    const fetchStrategy = prefetchIntent !== 'none' ? getFetchStrategyFromPrefetchIntent(prefetchIntent) : _types.FetchStrategy.PPR;
    if ("TURBOPACK compile-time truthy", 1) {
        function createPropError(args) {
            return new Error(`Failed prop type: The prop \`${args.key}\` expects a ${args.expected} in \`<Link>\`, but got \`${args.actual}\` instead.` + (typeof window !== 'undefined' ? "\nOpen your browser's console to view the Component stack trace." : ''));
        }
        // TypeScript trick for type-guarding:
        const requiredPropsGuard = {
            href: true
        };
        const requiredProps = Object.keys(requiredPropsGuard);
        requiredProps.forEach((key)=>{
            if (key === 'href') {
                if (props[key] == null || typeof props[key] !== 'string' && typeof props[key] !== 'object') {
                    throw createPropError({
                        key,
                        expected: '`string` or `object`',
                        actual: props[key] === null ? 'null' : typeof props[key]
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                const _ = key;
            }
        });
        // TypeScript trick for type-guarding:
        const optionalPropsGuard = {
            as: true,
            replace: true,
            scroll: true,
            shallow: true,
            passHref: true,
            prefetch: true,
            unstable_dynamicOnHover: true,
            onClick: true,
            onMouseEnter: true,
            onTouchStart: true,
            legacyBehavior: true,
            onNavigate: true,
            transitionTypes: true
        };
        const optionalProps = Object.keys(optionalPropsGuard);
        optionalProps.forEach((key)=>{
            const valType = typeof props[key];
            if (key === 'as') {
                if (props[key] && valType !== 'string' && valType !== 'object') {
                    throw createPropError({
                        key,
                        expected: '`string` or `object`',
                        actual: valType
                    });
                }
            } else if (key === 'onClick' || key === 'onMouseEnter' || key === 'onTouchStart' || key === 'onNavigate') {
                if (props[key] && valType !== 'function') {
                    throw createPropError({
                        key,
                        expected: '`function`',
                        actual: valType
                    });
                }
            } else if (key === 'replace' || key === 'scroll' || key === 'shallow' || key === 'passHref' || key === 'legacyBehavior' || key === 'unstable_dynamicOnHover') {
                if (props[key] != null && valType !== 'boolean') {
                    throw createPropError({
                        key,
                        expected: '`boolean`',
                        actual: valType
                    });
                }
            } else if (key === 'prefetch') {
                if (props[key] != null && valType !== 'boolean' && props[key] !== 'auto') {
                    throw createPropError({
                        key,
                        expected: '`boolean | "auto"`',
                        actual: valType
                    });
                }
            } else if (key === 'transitionTypes') {
                if (props[key] != null && !Array.isArray(props[key])) {
                    throw createPropError({
                        key,
                        expected: '`string[]`',
                        actual: valType
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                const _ = key;
            }
        });
    }
    const resolvedHref = asProp || hrefProp;
    const formattedHref = formatStringOrUrl(resolvedHref);
    if ("TURBOPACK compile-time truthy", 1) {
        const { warnOnce } = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/warn-once.js [app-client] (ecmascript)");
        if (props.locale) {
            warnOnce('The `locale` prop is not supported in `next/link` while using the `app` router. Read more about app router internalization: https://nextjs.org/docs/app/building-your-application/routing/internationalization');
        }
        if (!asProp) {
            let href;
            if (typeof resolvedHref === 'string') {
                href = resolvedHref;
            } else if (typeof resolvedHref === 'object' && typeof resolvedHref.pathname === 'string') {
                href = resolvedHref.pathname;
            }
            if (href) {
                const hasDynamicSegment = href.split('/').some((segment)=>segment.startsWith('[') && segment.endsWith(']'));
                if (hasDynamicSegment) {
                    throw new Error(`Dynamic href \`${href}\` found in <Link> while using the \`/app\` router, this is not supported. Read more: https://nextjs.org/docs/messages/app-dir-dynamic-href`);
                }
            }
        }
    }
    // This will return the first child, if multiple are provided it will throw an error
    let child;
    if (legacyBehavior) {
        if (children?.$$typeof === Symbol.for('react.lazy')) {
            throw new Error(`\`<Link legacyBehavior>\` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's \`<a>\` tag.`);
        }
        if ("TURBOPACK compile-time truthy", 1) {
            if (onClick) {
                console.warn(`"onClick" was passed to <Link> with \`href\` of \`${formattedHref}\` but "legacyBehavior" was set. The legacy behavior requires onClick be set on the child of next/link`);
            }
            if (onMouseEnterProp) {
                console.warn(`"onMouseEnter" was passed to <Link> with \`href\` of \`${formattedHref}\` but "legacyBehavior" was set. The legacy behavior requires onMouseEnter be set on the child of next/link`);
            }
            try {
                child = _react.default.Children.only(children);
            } catch (err) {
                if (!children) {
                    throw new Error(`No children were passed to <Link> with \`href\` of \`${formattedHref}\` but one child is required https://nextjs.org/docs/messages/link-no-children`);
                }
                throw new Error(`Multiple children were passed to <Link> with \`href\` of \`${formattedHref}\` but only one child is supported https://nextjs.org/docs/messages/link-multiple-children` + (typeof window !== 'undefined' ? " \nOpen your browser's console to view the Component stack trace." : ''));
            }
        } else //TURBOPACK unreachable
        ;
    } else {
        if ("TURBOPACK compile-time truthy", 1) {
            if (children?.type === 'a') {
                throw new Error('Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.\nLearn more: https://nextjs.org/docs/messages/invalid-new-link-with-extra-anchor');
            }
        }
    }
    const childRef = legacyBehavior ? child && typeof child === 'object' && child.ref : forwardedRef;
    // Capture the Owner Stack during render so dev-only warnings emitted later
    // at navigation time can be associated with the JSX that created
    // this <Link>.
    const ownerStack = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined;
    // Use a callback ref to attach an IntersectionObserver to the anchor tag on
    // mount. In the future we will also use this to keep track of all the
    // currently mounted <Link> instances, e.g. so we can re-prefetch them after
    // a revalidation or refresh.
    const observeLinkVisibilityOnMount = _react.default.useCallback({
        "LinkComponent.useCallback[observeLinkVisibilityOnMount]": (element)=>{
            if (router !== null) {
                linkInstanceRef.current = (0, _links.mountLinkInstance)(element, formattedHref, router, fetchStrategy, prefetchEnabled, setOptimisticLinkStatus, ownerStack);
            }
            return ({
                "LinkComponent.useCallback[observeLinkVisibilityOnMount]": ()=>{
                    if (linkInstanceRef.current) {
                        (0, _links.unmountLinkForCurrentNavigation)(linkInstanceRef.current);
                        linkInstanceRef.current = null;
                    }
                    (0, _links.unmountPrefetchableInstance)(element);
                }
            })["LinkComponent.useCallback[observeLinkVisibilityOnMount]"];
        }
    }["LinkComponent.useCallback[observeLinkVisibilityOnMount]"], [
        prefetchEnabled,
        formattedHref,
        router,
        fetchStrategy,
        setOptimisticLinkStatus,
        ownerStack
    ]);
    const mergedRef = (0, _usemergedref.useMergedRef)(observeLinkVisibilityOnMount, childRef);
    const childProps = {
        ref: mergedRef,
        onClick (e) {
            if ("TURBOPACK compile-time truthy", 1) {
                if (!e) {
                    throw new Error(`Component rendered inside next/link has to pass click event to "onClick" prop.`);
                }
            }
            if (!legacyBehavior && typeof onClick === 'function') {
                onClick(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onClick === 'function') {
                child.props.onClick(e);
            }
            if (!router) {
                return;
            }
            if (e.defaultPrevented) {
                return;
            }
            linkClicked(e, formattedHref, linkInstanceRef, replace, scroll, onNavigate, transitionTypes, prefetchIntent);
        },
        onMouseEnter (e) {
            if (!legacyBehavior && typeof onMouseEnterProp === 'function') {
                onMouseEnterProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onMouseEnter === 'function') {
                child.props.onMouseEnter(e);
            }
            if (!router) {
                return;
            }
            if ("TURBOPACK compile-time truthy", 1) {
                return;
            }
            //TURBOPACK unreachable
            ;
            const upgradeToDynamicPrefetch = undefined;
        },
        onTouchStart: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : function onTouchStart(e) {
            if (!legacyBehavior && typeof onTouchStartProp === 'function') {
                onTouchStartProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onTouchStart === 'function') {
                child.props.onTouchStart(e);
            }
            if (!router) {
                return;
            }
            if (!prefetchEnabled) {
                return;
            }
            const upgradeToDynamicPrefetch = unstable_dynamicOnHover === true;
            (0, _links.onNavigationIntent)(e.currentTarget, upgradeToDynamicPrefetch);
        }
    };
    // If the url is absolute, we can bypass the logic to prepend the basePath.
    if ((0, _utils.isAbsoluteUrl)(formattedHref)) {
        childProps.href = formattedHref;
    } else if (!legacyBehavior || passHref || child.type === 'a' && !('href' in child.props)) {
        childProps.href = (0, _addbasepath.addBasePath)(formattedHref);
    }
    let link;
    if (legacyBehavior) {
        if ("TURBOPACK compile-time truthy", 1) {
            const { errorOnce } = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/error-once.js [app-client] (ecmascript)");
            errorOnce('`legacyBehavior` is deprecated and will be removed in a future ' + 'release. A codemod is available to upgrade your components:\n\n' + 'npx @next/codemod@latest new-link .\n\n' + 'Learn more: https://nextjs.org/docs/app/building-your-application/upgrading/codemods#remove-a-tags-from-link-components');
        }
        link = /*#__PURE__*/ _react.default.cloneElement(child, childProps);
    } else {
        link = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            ...restProps,
            ...childProps,
            children: children
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(LinkStatusContext.Provider, {
        value: linkStatus,
        children: link
    });
}
const LinkStatusContext = /*#__PURE__*/ (0, _react.createContext)(_links.IDLE_LINK_STATUS);
const useLinkStatus = ()=>{
    return (0, _react.useContext)(LinkStatusContext);
};
function getFetchStrategyFromPrefetchIntent(prefetchIntent) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        return prefetchIntent === 'auto' ? _types.FetchStrategy.PPR : _types.FetchStrategy.Full;
    }
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/use-merged-ref.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useMergedRef", {
    enumerable: true,
    get: function() {
        return useMergedRef;
    }
});
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
function useMergedRef(refA, refB) {
    const cleanupA = (0, _react.useRef)(null);
    const cleanupB = (0, _react.useRef)(null);
    // NOTE: In theory, we could skip the wrapping if only one of the refs is non-null.
    // (this happens often if the user doesn't pass a ref to Link/Form/Image)
    // But this can cause us to leak a cleanup-ref into user code (previously via `<Link legacyBehavior>`),
    // and the user might pass that ref into ref-merging library that doesn't support cleanup refs
    // (because it hasn't been updated for React 19)
    // which can then cause things to blow up, because a cleanup-returning ref gets called with `null`.
    // So in practice, it's safer to be defensive and always wrap the ref, even on React 19.
    return (0, _react.useCallback)((current)=>{
        if (current === null) {
            const cleanupFnA = cleanupA.current;
            if (cleanupFnA) {
                cleanupA.current = null;
                cleanupFnA();
            }
            const cleanupFnB = cleanupB.current;
            if (cleanupFnB) {
                cleanupB.current = null;
                cleanupFnB();
            }
        } else {
            if (refA) {
                cleanupA.current = applyRef(refA, current);
            }
            if (refB) {
                cleanupB.current = applyRef(refB, current);
            }
        }
    }, [
        refA,
        refB
    ]);
}
function applyRef(refA, current) {
    if (typeof refA === 'function') {
        const cleanup = refA(current);
        if (typeof cleanup === 'function') {
            return cleanup;
        } else {
            return ()=>refA(null);
        }
    } else {
        refA.current = current;
        return ()=>{
            refA.current = null;
        };
    }
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/shared/lib/router/utils/format-url.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// Format function modified from nodejs
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    formatUrl: null,
    formatWithValidation: null,
    urlObjectKeys: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    formatUrl: function() {
        return formatUrl;
    },
    formatWithValidation: function() {
        return formatWithValidation;
    },
    urlObjectKeys: function() {
        return urlObjectKeys;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _querystring = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/querystring.js [app-client] (ecmascript)"));
const slashedProtocols = /https?|ftp|gopher|file/;
function formatUrl(urlObj) {
    let { auth, hostname } = urlObj;
    let protocol = urlObj.protocol || '';
    let pathname = urlObj.pathname || '';
    let hash = urlObj.hash || '';
    let query = urlObj.query || '';
    let host = false;
    auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ':') + '@' : '';
    if (urlObj.host) {
        host = auth + urlObj.host;
    } else if (hostname) {
        host = auth + (~hostname.indexOf(':') ? `[${hostname}]` : hostname);
        if (urlObj.port) {
            host += ':' + urlObj.port;
        }
    }
    if (query && typeof query === 'object') {
        query = String(_querystring.urlQueryToSearchParams(query));
    }
    let search = urlObj.search || query && `?${query}` || '';
    if (protocol && !protocol.endsWith(':')) protocol += ':';
    if (urlObj.slashes || (!protocol || slashedProtocols.test(protocol)) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname[0] !== '/') pathname = '/' + pathname;
    } else if (!host) {
        host = '';
    }
    if (hash && hash[0] !== '#') hash = '#' + hash;
    if (search && search[0] !== '?') search = '?' + search;
    pathname = pathname.replace(/[?#]/g, encodeURIComponent);
    search = search.replace('#', '%23');
    return `${protocol}${host}${pathname}${search}${hash}`;
}
const urlObjectKeys = [
    'auth',
    'hash',
    'host',
    'hostname',
    'href',
    'path',
    'pathname',
    'port',
    'protocol',
    'query',
    'search',
    'slashes'
];
function formatWithValidation(url) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (url !== null && typeof url === 'object') {
            Object.keys(url).forEach((key)=>{
                if (!urlObjectKeys.includes(key)) {
                    console.warn(`Unknown key passed via urlObject into url.format: ${key}`);
                }
            });
        }
    }
    return formatUrl(url);
}
}),
"[project]/node_modules/next/dist/shared/lib/router/utils/is-local-url.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isLocalURL", {
    enumerable: true,
    get: function() {
        return isLocalURL;
    }
});
const _utils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)");
const _hasbasepath = __turbopack_context__.r("[project]/node_modules/next/dist/client/has-base-path.js [app-client] (ecmascript)");
function isLocalURL(url) {
    // prevent a hydration mismatch on href for url with anchor refs
    if (!(0, _utils.isAbsoluteUrl)(url)) return true;
    try {
        // absolute urls can be local if they are on the same origin
        const locationOrigin = (0, _utils.getLocationOrigin)();
        const resolved = new URL(url, locationOrigin);
        return resolved.origin === locationOrigin && (0, _hasbasepath.hasBasePath)(resolved.pathname);
    } catch (_) {
        return false;
    }
}
}),
"[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DecodeError: null,
    MiddlewareNotFoundError: null,
    MissingStaticPage: null,
    NormalizeError: null,
    PageNotFoundError: null,
    SP: null,
    ST: null,
    WEB_VITALS: null,
    execOnce: null,
    getDisplayName: null,
    getLocationOrigin: null,
    getURL: null,
    isAbsoluteUrl: null,
    isResSent: null,
    loadGetInitialProps: null,
    normalizeRepeatedSlashes: null,
    stringifyError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DecodeError: function() {
        return DecodeError;
    },
    MiddlewareNotFoundError: function() {
        return MiddlewareNotFoundError;
    },
    MissingStaticPage: function() {
        return MissingStaticPage;
    },
    NormalizeError: function() {
        return NormalizeError;
    },
    PageNotFoundError: function() {
        return PageNotFoundError;
    },
    SP: function() {
        return SP;
    },
    ST: function() {
        return ST;
    },
    WEB_VITALS: function() {
        return WEB_VITALS;
    },
    execOnce: function() {
        return execOnce;
    },
    getDisplayName: function() {
        return getDisplayName;
    },
    getLocationOrigin: function() {
        return getLocationOrigin;
    },
    getURL: function() {
        return getURL;
    },
    isAbsoluteUrl: function() {
        return isAbsoluteUrl;
    },
    isResSent: function() {
        return isResSent;
    },
    loadGetInitialProps: function() {
        return loadGetInitialProps;
    },
    normalizeRepeatedSlashes: function() {
        return normalizeRepeatedSlashes;
    },
    stringifyError: function() {
        return stringifyError;
    }
});
const WEB_VITALS = [
    'CLS',
    'FCP',
    'INP',
    'LCP',
    'TTFB'
];
function execOnce(fn) {
    let used = false;
    let result;
    return (...args)=>{
        if (!used) {
            used = true;
            result = fn(...args);
        }
        return result;
    };
}
// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const isAbsoluteUrl = (url)=>{
    // Fast path: an absolute URL must start with a letter (the scheme).
    // Check for a-z and A-Z without the cost of the regex.
    const c = url.charCodeAt(0);
    const isLetter = c >= 65 /* A */  && c <= 90 || c >= 97 /* a */  && c <= 122;
    /* z */ if (!isLetter) {
        return false;
    }
    return ABSOLUTE_URL_REGEX.test(url);
};
function getLocationOrigin() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}
function getURL() {
    const { href } = window.location;
    const origin = getLocationOrigin();
    return href.substring(origin.length);
}
function getDisplayName(Component) {
    return typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Unknown';
}
function isResSent(res) {
    return res.finished || res.headersSent;
}
function normalizeRepeatedSlashes(url) {
    const urlParts = url.split('?');
    const urlNoQuery = urlParts[0];
    return urlNoQuery // first we replace any non-encoded backslashes with forward
    // then normalize repeated forward slashes
    .replace(/\\/g, '/').replace(/\/\/+/g, '/') + (urlParts[1] ? `?${urlParts.slice(1).join('?')}` : '');
}
async function loadGetInitialProps(App, ctx) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (App.prototype?.getInitialProps) {
            const message = `"${getDisplayName(App)}.getInitialProps()" is defined as an instance method - visit https://nextjs.org/docs/messages/get-initial-props-as-an-instance-method for more information.`;
            throw new Error(message);
        }
    }
    // when called from _app `ctx` is nested in `ctx`
    const res = ctx.res || ctx.ctx && ctx.ctx.res;
    if (!App.getInitialProps) {
        if (ctx.ctx && ctx.Component) {
            // @ts-ignore pageProps default
            return {
                pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
            };
        }
        return {};
    }
    const props = await App.getInitialProps(ctx);
    if (res && isResSent(res)) {
        return props;
    }
    if (!props) {
        const message = `"${getDisplayName(App)}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
        throw new Error(message);
    }
    if ("TURBOPACK compile-time truthy", 1) {
        if (Object.keys(props).length === 0 && !ctx.ctx) {
            console.warn(`${getDisplayName(App)} returned an empty object from \`getInitialProps\`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProps`);
        }
    }
    return props;
}
const SP = typeof performance !== 'undefined';
const ST = SP && [
    'mark',
    'measure',
    'getEntriesByName'
].every((method)=>typeof performance[method] === 'function');
class DecodeError extends Error {
}
class NormalizeError extends Error {
}
class PageNotFoundError extends Error {
    constructor(page){
        super();
        this.code = 'ENOENT';
        this.name = 'PageNotFoundError';
        this.message = `Cannot find module for page: ${page}`;
    }
}
class MissingStaticPage extends Error {
    constructor(page, message){
        super();
        this.message = `Failed to load static file for page: ${page} ${message}`;
    }
}
class MiddlewareNotFoundError extends Error {
    constructor(){
        super();
        this.code = 'ENOENT';
        this.message = `Cannot find the middleware module`;
    }
}
function stringifyError(error) {
    return JSON.stringify({
        message: error.message,
        stack: error.stack
    });
}
}),
"[project]/node_modules/next/dist/shared/lib/utils/error-once.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "errorOnce", {
    enumerable: true,
    get: function() {
        return errorOnce;
    }
});
let errorOnce = (_)=>{};
if ("TURBOPACK compile-time truthy", 1) {
    const errors = new Set();
    errorOnce = (msg)=>{
        if (!errors.has(msg)) {
            console.error(msg);
        }
        errors.add(msg);
    };
}
}),
"[project]/src/components/forms/RecordForm.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecordForm,
    "labels",
    ()=>labels,
    "recordFields",
    ()=>recordFields
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const labels = {
    donor_id: "Donor ID",
    patient_id: "Patient ID",
    organ_id: "Organ ID",
    centre_id: "Transplant centre",
    full_name: "Full name",
    date_of_birth: "Date of birth",
    blood_group: "Blood group",
    donor_type: "Donor type",
    contact_phone: "Contact phone",
    sex: "Sex",
    city: "City",
    organ_type_id: "Organ type",
    organ_status: "Organ status",
    retrieved_at: "Retrieved at (UTC)",
    donor_name: "Donor",
    organ_name: "Organ type",
    centre_name: "Centre",
    registered_at: "Registered at",
    created_at: "Created at"
};
function recordFields(entity) {
    return entity === "organ" ? [
        "donor_id",
        "organ_type_id",
        "centre_id",
        "retrieved_at"
    ] : [
        "full_name",
        "centre_id",
        "date_of_birth",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex",
        "contact_phone",
        ...entity === "patient" ? [
            "city"
        ] : []
    ];
}
function DonorPicker({ value, onChange, disabled, currentName }) {
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [options, setOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonorPicker.useEffect": ()=>{
            const controller = new AbortController();
            const timer = setTimeout({
                "DonorPicker.useEffect.timer": async ()=>{
                    try {
                        const response = await fetch(`/api/donors?${new URLSearchParams({
                            search,
                            pageSize: "20"
                        })}`, {
                            signal: controller.signal
                        });
                        const body = await response.json();
                        if (!response.ok) throw new Error(body.error?.message || "Could not load donors.");
                        setOptions(body.data);
                        setError("");
                    } catch (e) {
                        if (!controller.signal.aborted) setError(e.message);
                    }
                }
            }["DonorPicker.useEffect.timer"], 250);
            return ({
                "DonorPicker.useEffect": ()=>{
                    clearTimeout(timer);
                    controller.abort();
                }
            })["DonorPicker.useEffect"];
        }
    }["DonorPicker.useEffect"], [
        search
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "donor-picker",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "donor-search",
                children: [
                    "Find a donor by name",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "donor-search",
                        value: search,
                        disabled: disabled,
                        onChange: (e)=>setSearch(e.target.value),
                        placeholder: "Search donors…"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 31,
                        columnNumber: 90
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 40
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "record-donor_id",
                children: [
                    "Donor",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        id: "record-donor_id",
                        required: true,
                        disabled: disabled,
                        value: value,
                        onChange: (e)=>onChange(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "Select a donor"
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 31,
                                columnNumber: 382
                            }, this),
                            value && !options.some((row)=>String(row.donor_id) === String(value)) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: value,
                                children: [
                                    currentName || "Selected donor",
                                    " (#",
                                    value,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 31,
                                columnNumber: 496
                            }, this),
                            options.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: row.donor_id,
                                    children: [
                                        row.full_name,
                                        " (#",
                                        row.donor_id,
                                        ")"
                                    ]
                                }, row.donor_id, true, {
                                    fileName: "[project]/src/components/forms/RecordForm.jsx",
                                    lineNumber: 31,
                                    columnNumber: 592
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 31,
                        columnNumber: 269
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 231
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                children: "Search narrows the first 20 results."
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 701
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 31,
                columnNumber: 762
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/RecordForm.jsx",
        lineNumber: 31,
        columnNumber: 10
    }, this);
}
_s(DonorPicker, "wAgKXEFXujgCujNIttP7pva2bFU=");
_c = DonorPicker;
function RecordForm({ entity, record, references, disabled, busy, onSave, onCancel }) {
    _s1();
    const keys = recordFields(entity);
    const [values, setValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "RecordForm.useState": ()=>Object.fromEntries(keys.map({
                "RecordForm.useState": (key)=>[
                        key,
                        key === "retrieved_at" ? (record?.[key] || "").slice(0, 19) : record?.[key] ?? ""
                    ]
            }["RecordForm.useState"]))
    }["RecordForm.useState"]);
    const set = (key, value)=>setValues((previous)=>({
                ...previous,
                [key]: value
            }));
    function submit(event) {
        event.preventDefault();
        const data = Object.fromEntries(keys.map((key)=>[
                key,
                values[key] === "" && [
                    "contact_phone",
                    "city",
                    "retrieved_at"
                ].includes(key) ? null : values[key]
            ]));
        // PATCH sends changed fields only, preserving untouched dates and references.
        if (record) {
            for (const key of keys){
                const old = key === "retrieved_at" ? (record[key] || "").slice(0, 19) : record[key] ?? "";
                if (String(values[key]) === String(old)) delete data[key];
            }
        }
        onSave(data);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "record-form",
        onSubmit: submit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "form-grid",
                children: keys.map((key)=>{
                    if (key === "donor_id") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DonorPicker, {
                        value: values[key],
                        onChange: (value)=>set(key, value),
                        disabled: disabled || busy,
                        currentName: record?.donor_name
                    }, key, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 52,
                        columnNumber: 38
                    }, this);
                    let options;
                    if (key === "centre_id") options = references.centres.map((row)=>[
                            row.centre_id,
                            `${row.centre_name}${row.is_active ? "" : " (inactive)"}`
                        ]);
                    if (key === "organ_type_id") options = references.organTypes.map((row)=>[
                            row.organ_type_id,
                            `${row.organ_name}${row.is_active ? "" : " (inactive)"}`
                        ]);
                    if (key === "blood_group") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLOOD_GROUPS"].map((value)=>[
                            value,
                            value
                        ]);
                    if (key === "donor_type") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DONOR_TYPES"].map((value)=>[
                            value,
                            value
                        ]);
                    if (key === "sex") options = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEXES"].map((value)=>[
                            value,
                            value
                        ]);
                    const optional = [
                        "city",
                        "contact_phone",
                        "retrieved_at"
                    ].includes(key);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: `record-${key}`,
                        children: [
                            labels[key],
                            optional ? " (optional)" : " *",
                            options ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: `record-${key}`,
                                value: values[key],
                                required: true,
                                disabled: disabled || busy,
                                onChange: (e)=>set(key, e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Select…"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                                        lineNumber: 60,
                                        columnNumber: 241
                                    }, this),
                                    options.map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: value,
                                            children: label
                                        }, value, false, {
                                            fileName: "[project]/src/components/forms/RecordForm.jsx",
                                            lineNumber: 60,
                                            columnNumber: 307
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 60,
                                columnNumber: 114
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: `record-${key}`,
                                type: key === "date_of_birth" ? "date" : key === "retrieved_at" ? "datetime-local" : key === "contact_phone" ? "tel" : "text",
                                step: key === "retrieved_at" ? "1" : undefined,
                                min: key === "date_of_birth" ? "1900-01-01" : undefined,
                                max: key === "date_of_birth" ? new Date().toISOString().slice(0, 10) : undefined,
                                maxLength: key === "full_name" ? 120 : key === "city" ? 100 : key === "contact_phone" ? 20 : undefined,
                                required: !optional,
                                value: values[key],
                                disabled: disabled || busy,
                                onChange: (e)=>set(key, e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/src/components/forms/RecordForm.jsx",
                                lineNumber: 60,
                                columnNumber: 371
                            }, this)
                        ]
                    }, key, true, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 60,
                        columnNumber: 14
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 51,
                columnNumber: 5
            }, this),
            entity === "organ" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "note",
                children: "New organs start as AVAILABLE. Status transitions belong to the matching, allocation, and transplant workflows. Times are entered in UTC."
            }, void 0, false, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 62,
                columnNumber: 28
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "actions",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "button",
                        disabled: disabled || busy,
                        children: busy ? "Saving…" : record ? "Save changes" : "Create record"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 63,
                        columnNumber: 30
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onCancel,
                        disabled: busy,
                        children: "Cancel"
                    }, void 0, false, {
                        fileName: "[project]/src/components/forms/RecordForm.jsx",
                        lineNumber: 63,
                        columnNumber: 170
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/forms/RecordForm.jsx",
                lineNumber: 63,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/forms/RecordForm.jsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
_s1(RecordForm, "SanRC6pK199xvYgq3vxF7xz3us0=");
_c1 = RecordForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "DonorPicker");
__turbopack_context__.k.register(_c1, "RecordForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/ManagementPage.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ManagementPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/RecordForm.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$tables$2f$RecordsTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/tables/RecordsTable.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/records.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
async function api(url, options = {}) {
    const response = await fetch(url, {
        cache: "no-store",
        ...options
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "The request failed. Please try again.");
    return body;
}
function ManagementPage({ entity }) {
    _s();
    const plural = `${entity}s`, title = plural[0].toUpperCase() + plural.slice(1);
    const [references, setReferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        centres: [],
        organTypes: [],
        developmentWritesEnabled: false
    });
    const [referenceError, setReferenceError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        data: [],
        pagination: {
            page: 1,
            total: 0,
            totalPages: 0
        }
    });
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        search: "",
        centre_id: "",
        filter: "",
        page: 1
    });
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [refresh, setRefresh] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true), [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""), [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [token, setToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [selection, setSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const dialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null), panel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canWrite = references.developmentWritesEnabled && token.length >= 32;
    const filterKey = entity === "organ" ? "organ_status" : "blood_group";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ManagementPage.useEffect": ()=>{
            const controller = new AbortController();
            api("/api/reference-data", {
                signal: controller.signal
            }).then({
                "ManagementPage.useEffect": (body)=>{
                    setReferences(body.data);
                    setReferenceError("");
                }
            }["ManagementPage.useEffect"]).catch({
                "ManagementPage.useEffect": (e)=>{
                    if (!controller.signal.aborted) setReferenceError(e.message);
                }
            }["ManagementPage.useEffect"]);
            return ({
                "ManagementPage.useEffect": ()=>controller.abort()
            })["ManagementPage.useEffect"];
        }
    }["ManagementPage.useEffect"], [
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ManagementPage.useEffect": ()=>{
            const controller = new AbortController();
            setLoading(true);
            setError("");
            const params = new URLSearchParams({
                page: String(query.page),
                pageSize: "10",
                search: query.search
            });
            if (query.centre_id) params.set("centre_id", query.centre_id);
            if (query.filter) params.set(filterKey, query.filter);
            api(`/api/${plural}?${params}`, {
                signal: controller.signal
            }).then({
                "ManagementPage.useEffect": (body)=>{
                    if (query.page > Math.max(1, body.pagination.totalPages)) {
                        setQuery({
                            "ManagementPage.useEffect": (previous)=>({
                                    ...previous,
                                    page: Math.max(1, body.pagination.totalPages)
                                })
                        }["ManagementPage.useEffect"]);
                        return;
                    }
                    setResult(body);
                }
            }["ManagementPage.useEffect"]).catch({
                "ManagementPage.useEffect": (e)=>{
                    if (!controller.signal.aborted) {
                        setError(e.message);
                        setResult({
                            data: [],
                            pagination: {
                                page: query.page,
                                total: 0,
                                totalPages: 0
                            }
                        });
                    }
                }
            }["ManagementPage.useEffect"]).finally({
                "ManagementPage.useEffect": ()=>{
                    if (!controller.signal.aborted) setLoading(false);
                }
            }["ManagementPage.useEffect"]);
            return ({
                "ManagementPage.useEffect": ()=>controller.abort()
            })["ManagementPage.useEffect"];
        }
    }["ManagementPage.useEffect"], [
        entity,
        plural,
        filterKey,
        query,
        refresh
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ManagementPage.useEffect": ()=>{
            if (selection?.mode === "delete") dialog.current?.showModal();
            else if (selection) panel.current?.focus();
        }
    }["ManagementPage.useEffect"], [
        selection
    ]);
    async function action(mode, record) {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const body = await api(`/api/${plural}/${record[`${entity}_id`]}`);
            setSelection({
                mode,
                record: body.data
            });
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    async function mutate(method, data) {
        if (method === "PATCH" && !Object.keys(data).length) {
            setMessage("No changes to save.");
            return;
        }
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const recordId = selection?.record?.[`${entity}_id`];
            await api(`/api/${plural}${method === "POST" ? "" : `/${recordId}`}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                ...method === "DELETE" ? {} : {
                    body: JSON.stringify(data)
                }
            });
            setMessage(method === "DELETE" ? "Record deleted." : method === "POST" ? "Record created." : "Record updated.");
            setSelection(null);
            setRefresh((value)=>value + 1);
        } catch (e) {
            setError(e.message);
        } finally{
            setBusy(false);
        }
    }
    const filterValues = entity === "organ" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORGAN_STATUSES"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$records$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BLOOD_GROUPS"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "shell management",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        className: "brand",
                        href: "/",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mark",
                                "aria-hidden": "true",
                                children: "+"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 46
                            }, this),
                            "OrganSync ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                children: "V2"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 106
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Management",
                        children: [
                            "donors",
                            "patients",
                            "organs"
                        ].map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/${name}`,
                                "aria-current": plural === name ? "page" : undefined,
                                children: name[0].toUpperCase() + name.slice(1)
                            }, name, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 71,
                                columnNumber: 205
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 71,
                        columnNumber: 130
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 71,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "management-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "REGISTRY MANAGEMENT"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 48
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 94
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Manage fictional demonstration records. This educational system is not for clinical decisions."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 73,
                                        columnNumber: 110
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 73,
                                columnNumber: 43
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "button",
                                disabled: !canWrite || busy || loading,
                                onClick: ()=>{
                                    setSelection({
                                        mode: "create",
                                        record: null
                                    });
                                    setError("");
                                    setMessage("");
                                },
                                children: [
                                    "Add ",
                                    entity
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 73,
                                columnNumber: 217
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 73,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        className: "write-notice",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: references.developmentWritesEnabled ? "Local development writes enabled" : "Read-only mode"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Production authentication and role-based authorization are pending. ",
                                    references.developmentWritesEnabled ? "Enter your development token to enable forms. It stays in this page’s memory." : "Writes require an explicit local development setting and a server-configured token."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 149
                            }, this),
                            references.developmentWritesEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "development-token",
                                children: [
                                    "Development token",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "development-token",
                                        type: "password",
                                        autoComplete: "off",
                                        value: token,
                                        onChange: (e)=>setToken(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 74,
                                        columnNumber: 523
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 74,
                                columnNumber: 471
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 74,
                        columnNumber: 7
                    }, this),
                    referenceError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback error",
                        role: "alert",
                        children: [
                            "Reference data: ",
                            referenceError
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 75,
                        columnNumber: 26
                    }, this),
                    error && selection?.mode !== "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback error",
                        role: "alert",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 76,
                        columnNumber: 49
                    }, this),
                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "feedback success",
                        role: "status",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 77,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        className: "filters",
                        onSubmit: (event)=>{
                            event.preventDefault();
                            setQuery((previous)=>({
                                    ...previous,
                                    search,
                                    page: 1
                                }));
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "search-records",
                                children: [
                                    "Search",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        id: "search-records",
                                        type: "search",
                                        maxLength: 120,
                                        placeholder: entity === "organ" ? "Donor, organ type or centre" : "Name or centre",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 79,
                                        columnNumber: 47
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 79,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "filter-centre",
                                children: [
                                    "Centre",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "filter-centre",
                                        value: query.centre_id,
                                        onChange: (e)=>setQuery((previous)=>({
                                                    ...previous,
                                                    centre_id: e.target.value,
                                                    page: 1
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "All centres"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 80,
                                                columnNumber: 189
                                            }, this),
                                            references.centres.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: row.centre_id,
                                                    children: row.centre_name
                                                }, row.centre_id, false, {
                                                    fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                    lineNumber: 80,
                                                    columnNumber: 257
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 80,
                                        columnNumber: 46
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 80,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "filter-records",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["labels"][filterKey],
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "filter-records",
                                        value: query.filter,
                                        onChange: (e)=>setQuery((previous)=>({
                                                    ...previous,
                                                    filter: e.target.value,
                                                    page: 1
                                                })),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "All"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 81,
                                                columnNumber: 198
                                            }, this),
                                            filterValues.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: value
                                                }, value, false, {
                                                    fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                    lineNumber: 81,
                                                    columnNumber: 254
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 81,
                                        columnNumber: 60
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 81,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "button",
                                children: "Search"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setSearch("");
                                    setQuery({
                                        search: "",
                                        centre_id: "",
                                        filter: "",
                                        page: 1
                                    });
                                },
                                children: "Clear"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 65
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: loading,
                                onClick: ()=>setRefresh((value)=>value + 1),
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 82,
                                columnNumber: 198
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 78,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-label": `${title} listing`,
                        "aria-busy": loading,
                        children: [
                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "status",
                                className: "empty",
                                children: [
                                    "Loading ",
                                    plural,
                                    "…"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 20
                            }, this) : !error && !result.data.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "empty",
                                children: "No records found. Try a different search or filter."
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 111
                            }, this) : result.data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$tables$2f$RecordsTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                entity: entity,
                                records: result.data,
                                busy: busy,
                                canWrite: canWrite,
                                onAction: action
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 85,
                                columnNumber: 216
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pagination",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            result.pagination.total,
                                            " records · Page ",
                                            query.page,
                                            " of ",
                                            Math.max(1, result.pagination.totalPages)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 86,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: loading || query.page <= 1,
                                                onClick: ()=>setQuery((previous)=>({
                                                            ...previous,
                                                            page: previous.page - 1
                                                        })),
                                                children: "Previous"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 86,
                                                columnNumber: 175
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: loading || query.page >= result.pagination.totalPages,
                                                onClick: ()=>setQuery((previous)=>({
                                                            ...previous,
                                                            page: previous.page + 1
                                                        })),
                                                children: "Next"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 86,
                                                columnNumber: 319
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 86,
                                        columnNumber: 150
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 86,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 84,
                        columnNumber: 7
                    }, this),
                    selection && selection.mode !== "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "record-panel",
                        ref: panel,
                        tabIndex: -1,
                        "aria-labelledby": "record-panel-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "record-panel-heading",
                                children: selection.mode === "details" ? "Record details" : selection.mode === "create" ? `Add ${entity}` : `Edit ${entity}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 151
                            }, this),
                            selection.mode === "details" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                        className: "record-details",
                                        children: Object.entries(selection.record).map(([key, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["labels"][key] || key
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                        lineNumber: 88,
                                                        columnNumber: 438
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                        children: value === null ? "—" : String(value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                        lineNumber: 88,
                                                        columnNumber: 467
                                                    }, this)
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                                lineNumber: 88,
                                                columnNumber: 423
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 88,
                                        columnNumber: 336
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelection(null),
                                        children: "Close details"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 88,
                                        columnNumber: 527
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 334
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                entity: entity,
                                record: selection.record,
                                references: references,
                                disabled: !canWrite,
                                busy: busy,
                                onSave: (data)=>mutate(selection.mode === "create" ? "POST" : "PATCH", data),
                                onCancel: ()=>setSelection(null)
                            }, `${selection.mode}-${selection.record?.[`${entity}_id`] || "new"}`, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 88,
                                columnNumber: 598
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 88,
                        columnNumber: 52
                    }, this),
                    selection?.mode === "delete" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
                        ref: dialog,
                        onCancel: (event)=>{
                            if (busy) event.preventDefault();
                            else setSelection(null);
                        },
                        "aria-labelledby": "delete-heading",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                id: "delete-heading",
                                children: [
                                    "Delete this ",
                                    entity,
                                    "?"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 177
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    selection.record.full_name || `${selection.record.organ_name} from ${selection.record.donor_name}`,
                                    " (#",
                                    selection.record[`${entity}_id`],
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 227
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Deletion is permanent. The server will reject deletion if dependent records exist."
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 372
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                role: "alert",
                                className: "feedback error",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 471
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        autoFocus: true,
                                        disabled: busy,
                                        onClick: ()=>{
                                            setSelection(null);
                                            setError("");
                                        },
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 89,
                                        columnNumber: 551
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "danger",
                                        disabled: busy || !canWrite,
                                        onClick: ()=>mutate("DELETE"),
                                        children: busy ? "Deleting…" : "Confirm deletion"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                        lineNumber: 89,
                                        columnNumber: 654
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                                lineNumber: 89,
                                columnNumber: 526
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 89,
                        columnNumber: 40
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 72,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        children: "← Home"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 90,
                        columnNumber: 20
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "OrganSync V2 · Fictional demonstration data only"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/ManagementPage.jsx",
                        lineNumber: 90,
                        columnNumber: 48
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/ManagementPage.jsx",
                lineNumber: 90,
                columnNumber: 12
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/ManagementPage.jsx",
        lineNumber: 70,
        columnNumber: 10
    }, this);
}
_s(ManagementPage, "2VvKIi9rDUQNSeunHPT9Mld8KU0=");
_c = ManagementPage;
var _c;
__turbopack_context__.k.register(_c, "ManagementPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/tables/RecordsTable.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecordsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/forms/RecordForm.jsx [app-client] (ecmascript)");
"use client";
;
;
function RecordsTable({ entity, records, busy, canWrite, onAction }) {
    const keys = entity === "organ" ? [
        "organ_id",
        "organ_name",
        "donor_name",
        "centre_name",
        "organ_status"
    ] : [
        `${entity}_id`,
        "full_name",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex",
        "centre_name"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "table-scroll",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
                    className: "sr-only",
                    children: [
                        entity,
                        " records"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 47
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            keys.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$forms$2f$RecordForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["labels"][key]
                                }, key, false, {
                                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                    lineNumber: 6,
                                    columnNumber: 130
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                scope: "col",
                                children: "Actions"
                            }, void 0, false, {
                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                lineNumber: 6,
                                columnNumber: 176
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                        lineNumber: 6,
                        columnNumber: 109
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 102
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: records.map((record)=>{
                        const editable = entity !== "organ" || record.organ_status === "AVAILABLE";
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                keys.map((key)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: record[key] ?? "—"
                                    }, key, false, {
                                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                        lineNumber: 8,
                                        columnNumber: 62
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "row-actions",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: busy,
                                                onClick: ()=>onAction("details", record),
                                                children: "Details"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 136
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: busy || !canWrite || !editable,
                                                onClick: ()=>onAction("edit", record),
                                                children: "Edit"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 220
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "danger-text",
                                                disabled: busy || !canWrite || !editable,
                                                onClick: ()=>onAction("delete", record),
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                                lineNumber: 8,
                                                columnNumber: 324
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                        lineNumber: 8,
                                        columnNumber: 107
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                                    lineNumber: 8,
                                    columnNumber: 103
                                }, this)
                            ]
                        }, record[`${entity}_id`], true, {
                            fileName: "[project]/src/components/tables/RecordsTable.jsx",
                            lineNumber: 8,
                            columnNumber: 12
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/tables/RecordsTable.jsx",
                    lineNumber: 6,
                    columnNumber: 217
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/tables/RecordsTable.jsx",
            lineNumber: 6,
            columnNumber: 40
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/tables/RecordsTable.jsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = RecordsTable;
var _c;
__turbopack_context__.k.register(_c, "RecordsTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/records.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "BLOOD_GROUPS",
    ()=>BLOOD_GROUPS,
    "DONOR_TYPES",
    ()=>DONOR_TYPES,
    "ORGAN_STATUSES",
    ()=>ORGAN_STATUSES,
    "SEXES",
    ()=>SEXES,
    "calendarDate",
    ()=>calendarDate,
    "conflict",
    ()=>conflict,
    "fields",
    ()=>fields,
    "id",
    ()=>id,
    "invalid",
    ()=>invalid,
    "listOptions",
    ()=>listOptions,
    "validateRecord",
    ()=>validateRecord
]);
const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
];
const DONOR_TYPES = [
    "LIVING",
    "DECEASED"
];
const SEXES = [
    "FEMALE",
    "MALE",
    "OTHER",
    "UNDISCLOSED"
];
const ORGAN_STATUSES = [
    "AVAILABLE",
    "RESERVED",
    "TRANSPLANTED",
    "DISCARDED"
];
class AppError extends Error {
    constructor(status, code, message){
        super(message);
        this.status = status;
        this.code = code;
    }
}
const invalid = (message)=>{
    throw new AppError(400, "INVALID_INPUT", message);
};
const conflict = (message)=>{
    throw new AppError(409, "CONFLICT", message);
};
function id(value, field = "id", max = 18446744073709551615n) {
    if (typeof value !== "string" && typeof value !== "number" || typeof value === "number" && !Number.isSafeInteger(value) || !/^[1-9]\d{0,19}$/.test(String(value)) || BigInt(value) > max) invalid(`${field} must be a positive integer ID.`);
    return String(value);
}
function text(value, field, length, optional = false) {
    if (optional && (value === null || value === "")) return null;
    if (typeof value !== "string" || !value.trim() || [
        ...value.trim()
    ].length > length || /[\x00-\x1f\x7f]/.test(value)) invalid(`${field} must contain 1–${length} characters.`);
    return value.trim();
}
function enumeration(value, field, values) {
    if (!values.includes(value)) invalid(`${field} must be one of: ${values.join(", ")}.`);
    return value;
}
function calendarDate(value, field = "date_of_birth", now = new Date()) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid(`${field} must use YYYY-MM-DD.`);
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < "1900-01-01" || value > now.toISOString().slice(0, 10)) invalid(`${field} must be a valid date between 1900-01-01 and today.`);
    return value;
}
function retrievedAt(value) {
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z?$/.test(value)) invalid("retrieved_at must be a UTC date/time (YYYY-MM-DDTHH:mm:ssZ).");
    calendarDate(value.slice(0, 10), "retrieved_at");
    const normalized = value.replace(/Z$/, "");
    const full = normalized.length === 16 ? `${normalized}:00` : normalized;
    const parsed = new Date(`${full}Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 19) !== full || parsed > new Date()) invalid("retrieved_at must be a valid UTC time, not in the future.");
    return full.replace("T", " ");
}
const fields = {
    donor: [
        "centre_id",
        "full_name",
        "date_of_birth",
        "blood_group",
        "donor_type",
        "contact_phone"
    ],
    patient: [
        "centre_id",
        "full_name",
        "date_of_birth",
        "sex",
        "blood_group",
        "contact_phone",
        "city"
    ],
    organ: [
        "donor_id",
        "organ_type_id",
        "centre_id",
        "organ_status",
        "retrieved_at"
    ]
};
function validateRecord(entity, input, partial = false) {
    if (!input || typeof input !== "object" || Array.isArray(input)) invalid("A JSON object is required.");
    const allowed = fields[entity];
    if (!Object.keys(input).length || Object.keys(input).some((key)=>!allowed.includes(key))) invalid("Empty request or unsupported fields.");
    const required = entity === "organ" ? [
        "donor_id",
        "organ_type_id",
        "centre_id"
    ] : [
        "centre_id",
        "full_name",
        "date_of_birth",
        "blood_group",
        entity === "donor" ? "donor_type" : "sex"
    ];
    if (!partial && required.some((key)=>!Object.hasOwn(input, key))) invalid(`Required fields: ${required.join(", ")}.`);
    const result = {};
    for (const [key, value] of Object.entries(input)){
        if (key.endsWith("_id")) result[key] = id(value, key, key === "organ_type_id" ? 65535n : undefined);
        else if (key === "full_name") result[key] = text(value, key, 120);
        else if (key === "city") result[key] = text(value, key, 100, true);
        else if (key === "contact_phone") result[key] = text(value, key, 20, true);
        else if (key === "date_of_birth") result[key] = calendarDate(value);
        else if (key === "blood_group") result[key] = enumeration(value, key, BLOOD_GROUPS);
        else if (key === "donor_type") result[key] = enumeration(value, key, DONOR_TYPES);
        else if (key === "sex") result[key] = enumeration(value, key, SEXES);
        else if (key === "retrieved_at") result[key] = retrievedAt(value);
        else if (key === "organ_status") result[key] = enumeration(value, key, ORGAN_STATUSES);
    }
    if (entity === "organ" && Object.hasOwn(result, "organ_status")) {
        if (partial || result.organ_status !== "AVAILABLE") conflict("Organ status is controlled by matching, allocation, and transplant workflows. New organs must be AVAILABLE.");
    }
    if (!partial) {
        if (entity === "organ") {
            result.organ_status = "AVAILABLE";
            result.retrieved_at ??= null;
        } else {
            result.contact_phone ??= null;
            if (entity === "patient") result.city ??= null;
        }
    }
    return result;
}
function listOptions(entity, input = {}) {
    const allowed = [
        "page",
        "pageSize",
        "search",
        "centre_id",
        ...entity === "organ" ? [
            "organ_status",
            "organ_type_id",
            "donor_id"
        ] : [
            "blood_group",
            entity === "donor" ? "donor_type" : "sex"
        ]
    ];
    if (Object.keys(input).some((key)=>!allowed.includes(key))) invalid("Unsupported query parameter.");
    const integer = (value, fallback, max)=>{
        if (value === undefined) return fallback;
        if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) > max) invalid("Invalid pagination. pageSize must be 1–100; page must be 1–1000000.");
        return Number(value);
    };
    const result = {
        page: integer(input.page, 1, 1000000),
        pageSize: integer(input.pageSize, 10, 100),
        search: ""
    };
    if (input.search !== undefined) {
        if (typeof input.search !== "string" || input.search.length > 120) invalid("Search must be at most 120 characters.");
        result.search = input.search.trim();
    }
    for (const key of allowed.filter((k)=>![
            "page",
            "pageSize",
            "search"
        ].includes(k))){
        if (input[key] === undefined || input[key] === "") continue;
        if (key.endsWith("_id")) result[key] = id(input[key], key, key === "organ_type_id" ? 65535n : undefined);
        else result[key] = enumeration(input[key], key, key === "blood_group" ? BLOOD_GROUPS : key === "donor_type" ? DONOR_TYPES : key === "sex" ? SEXES : ORGAN_STATUSES);
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=_1-zra2g5tyrla._.js.map