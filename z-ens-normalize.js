// inspired from examples/example_node.mjs
import { readFileSync } from 'node:fs';

// Error code mappings
const ERROR_MESSAGES = {
    0: "Success",
    [-1]: "Out of memory",
    [-2]: "Invalid UTF-8 encoding",
    [-3]: "Invalid label extension (-- at positions 2-3)",
    [-4]: "Illegal script mixture",
    [-5]: "Whole confusable",
    [-6]: "Leading underscore",
    [-7]: "Fenced leading",
    [-8]: "Fenced adjacent",
    [-9]: "Fenced trailing",
    [-10]: "Disallowed character",
    [-11]: "Empty label",
    [-12]: "Combining mark leading",
    [-13]: "Combining mark after emoji",
    [-14]: "Non-spacing mark duplicate",
    [-15]: "Non-spacing mark excessive",
    [-99]: "Unknown error"
};

// ZensResult struct layout on wasm32: data (u32), len (u32), error_code (i32)
const RESULT_SIZE = 12;

const wasmBuffer = readFileSync(new URL('./z-ens-normalize/zig-out/bin/z_ens_normalize.wasm', import.meta.url));
const { instance } = await WebAssembly.instantiate(wasmBuffer);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function writeStringToMemory(str) {
    const bytes = encoder.encode(str);
    const ptr = instance.exports.zens_alloc(bytes.length);
    if (ptr === 0) throw new Error('wasm allocation failed');
    // Create the view after zens_alloc: growing memory detaches old buffers
    new Uint8Array(instance.exports.memory.buffer, ptr, bytes.length).set(bytes);
    return { ptr, len: bytes.length };
}

function callInto(fnName, input) {
    const { ptr, len } = writeStringToMemory(input);
    const resultPtr = instance.exports.zens_alloc(RESULT_SIZE);
    if (resultPtr === 0) {
        instance.exports.zens_dealloc(ptr, len);
        throw new Error('wasm allocation failed');
    }
    try {
        instance.exports[fnName](resultPtr, ptr, len);

        const view = new DataView(instance.exports.memory.buffer);
        const dataPtr = view.getUint32(resultPtr, true);
        const dataLen = view.getUint32(resultPtr + 4, true);
        const errorCode = view.getInt32(resultPtr + 8, true);

        if (errorCode !== 0) {
            throw new Error(`[${errorCode}] ${ERROR_MESSAGES[errorCode] || "Unknown error"}`);
        }

        // Copy the bytes out before freeing the result
        const bytes = new Uint8Array(instance.exports.memory.buffer, dataPtr, dataLen).slice();
        instance.exports.zens_free_result(resultPtr);
        return decoder.decode(bytes);
    } finally {
        instance.exports.zens_dealloc(resultPtr, RESULT_SIZE);
        instance.exports.zens_dealloc(ptr, len);
    }
}

export function zig_normalize(name) {  
    if (!name) return ""; // ptr issue with empty
    return callInto('zens_normalize_into', name);
}
