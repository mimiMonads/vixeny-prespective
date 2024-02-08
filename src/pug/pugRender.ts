import { CyclePlugin, FunRouterOptions } from "vixeny/components/http/types";
import { compile, compileClient, compileFile, compileFileClient } from "pug";
import { Petition } from "vixeny/components/http/src/framework/optimizer/types";

interface Options {
  filename?: string; // The name of the file being compiled.
  basedir?: string; // The root directory of all absolute inclusion.
  doctype?: string; // Specifies the doctype of the template.
  pretty?: boolean | string; // [Deprecated] Whether to format the output HTML for readability.
  filters?: { [key: string]: Function }; // Custom filters for template transformations.
  self?: boolean; // Whether to use `self` namespace for locals.
  debug?: boolean; // Enables logging of tokens and function body to stdout.
  compileDebug?: boolean; // Includes function source in compiled template for better error messages.
  globals?: string[]; // List of global names to make accessible in templates.
  cache?: boolean; // Enables caching of compiled functions.
  inlineRuntimeFunctions?: boolean; // Inlines runtime functions instead of requiring them from a shared version.
  name?: string; // The name of the template function (for `compileClient` functions).
}

interface CompileFunction {
  (locals?: { [key: string]: any }): string;
}

// Returns a string representing a function for client-side use

// not implemented
// For compileClientWithDependenciesTracked
interface CompileClientWithDependenciesTrackedResult {
  body: string; // The function body as a string
  dependencies: string[]; // Array of dependencies filenames
}

// export function compileClientWithDependenciesTracked(source: string, options?: Options): CompileClientWithDependenciesTrackedResult;
// export function compileFileClient(path: string, options?: Options): CompileClientFunctionString;
// export function render(source: string, options?: Options): string;
// export function renderFile(path: string, options?: Options): string;

//posible types ins pug
type plugin =
  | "compile"
  | "compileFile"
  | "compileClient"
  | "compileFileClient"; // | "renderFile"
// | "render"
// | "compileClientWithDependenciesTracked"
// Creating a plugin for rendering Pug templates
const pugRenderer = (needs: plugin) => {
  const sym = Symbol("pugRenderer");

  switch (needs) {
    case "compile":
      return {
        name: sym,
        isFunction: true,
        type: {} as { source: string; options?: Options } | {},
        // This plugin does not have a specific type requirement
        f: (o: FunRouterOptions) => (userOptions: Petition) => {
          //getting name
          const currentName = Object
            .keys(o?.cyclePlugin ?? [])
            //@ts-ignore
            .find((name) => o?.cyclePlugin[name].name === sym) as string;

          const options = "plugins" in userOptions && userOptions.plugins
            ? userOptions.plugins[currentName] as {
              source: string;
              options?: Options;
            }
            : null;

          if (options === null || options === undefined) {
            throw new Error("Expecting source in: " + currentName);
          }

          try {
            const compose = compile(options.source, options.options);
            return compose as CompileFunction;
          } catch (e) {
            throw new Error(
              "The pluging : " + currentName + " has panicked in : " +
                userOptions.path,
            );
          }
        },
      };
    case "compileFile":
      return {
        name: sym,
        isFunction: true,
        type: {} as { path: string; options?: Options } | {},
        // This plugin does not have a specific type requirement
        f: (o: FunRouterOptions) => (userOptions: Petition) => {
          //getting name
          const currentName = Object
            .keys(o?.cyclePlugin ?? [])
            //@ts-ignore
            .find((name) => o?.cyclePlugin[name].name === sym) as string;

          const options = "plugins" in userOptions && userOptions.plugins
            ? userOptions.plugins[currentName] as {
              path: string;
              options?: Options;
            }
            : null;

          if (options === null || options === undefined) {
            throw new Error("Expecting path in: " + currentName);
          }

          try {
            const compose = compileFile(options.path, options.options);
            return compose as CompileFunction;
          } catch (e) {
            throw new Error(
              "The pluging : " + currentName + " has panicked in : " +
                userOptions.path,
            );
          }
        },
      };
    case "compileClient":
      return {
        name: sym,
        isFunction: true,
        type: {} as { source: string; options?: Options } | {},
        // This plugin does not have a specific type requirement
        f: (o: FunRouterOptions) => (userOptions: Petition) => {
          //getting name
          const currentName = Object
            .keys(o?.cyclePlugin ?? [])
            //@ts-ignore
            .find((name) => o?.cyclePlugin[name].name === sym) as string;

          const options = "plugins" in userOptions && userOptions.plugins
            ? userOptions.plugins[currentName] as {
              source: string;
              options?: Options;
            }
            : null;

          if (options === null || options === undefined) {
            throw new Error("Expecting source in: " + currentName);
          }

          try {
            const composed = compileClient(
              options.source,
              options.options,
            ) as string;
            return (() => composed) as CompileFunction;
          } catch (e) {
            throw new Error(
              "The pluging : " + currentName + " has panicked in : " +
                userOptions.path,
            );
          }
        },
      };
    case "compileFileClient":
      return {
        name: sym,
        isFunction: true,
        type: {} as { path: string; options?: Options , source: never} | {},
        // This plugin does not have a specific type requirement
        f: (o: FunRouterOptions) => (userOptions: Petition) => {
          //getting name
          const currentName = Object
            .keys(o?.cyclePlugin ?? [])
            //@ts-ignore
            .find((name) => o?.cyclePlugin[name].name === sym) as string;

          const options = "plugins" in userOptions && userOptions.plugins
            ? userOptions.plugins[currentName] as {
              path: string;
              options?: Options;
            }
            : null;

          if (options === null || options === undefined) {
            throw new Error("Expecting path in: " + currentName);
          }

          try {
            const composed = compileFileClient(
              options.path,
              options.options,
            ) as string;
            return (() => composed) as CompileFunction;
          } catch (e) {
            throw new Error(
              "The pluging : " + currentName + " has panicked in : " +
                userOptions.path,
            );
          }
        },
      };
  }
};

// Self-invoking function to enforce type-checking against the CyclePlugin type.
((I: CyclePlugin) => I)(pugRenderer("compile"));

export default pugRenderer;
