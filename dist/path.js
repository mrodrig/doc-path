/**
 * @license MIT
 * doc-path <https://github.com/mrodrig/doc-path>
 * Copyright (c) 2015-present, Michael Rodrigues.
 */
"use strict";function evaluatePath(t,r){if(!t)return null;let{dotIndex:e,key:a,remaining:i}=state(r);return e>=0&&!t[r]?Array.isArray(t[a])?t[a].map(t=>evaluatePath(t,i)):evaluatePath(t[a],i):Array.isArray(t)?t.map(t=>evaluatePath(t,r)):t[r]}function setPath(t,r,e){if(!t)throw new Error("No object was provided.");if(!r)throw new Error("No keyPath was provided.");return r.startsWith("__proto__")||r.startsWith("constructor")||r.startsWith("prototype")?t:_sp(t,r,e)}function _sp(t,r,e){let{dotIndex:a,key:i,remaining:s}=state(r);if(a>=0){if(!t[i]&&Array.isArray(t))return t.forEach(t=>_sp(t,r,e));t[i]||(t[i]={}),_sp(t[i],s,e)}else{if(Array.isArray(t))return t.forEach(t=>_sp(t,s,e));t[r]=e}return t}function state(t){let r=t.indexOf(".");return{dotIndex:r,key:t.slice(0,r>=0?r:void 0),remaining:t.slice(r+1)}}module.exports={evaluatePath:evaluatePath,setPath:setPath};