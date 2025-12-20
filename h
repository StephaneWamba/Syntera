warning: in the working copy of 'widget/vite.config.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/widget/vite.config.ts b/widget/vite.config.ts[m
[1mindex 102dbd6..0d820af 100644[m
[1m--- a/widget/vite.config.ts[m
[1m+++ b/widget/vite.config.ts[m
[36m@@ -7,13 +7,20 @@[m [mexport default defineConfig({[m
     lib: {[m
       entry: resolve(__dirname, 'src/index.ts'),[m
       name: 'SynteraWidget',[m
[31m-      fileName: 'widget',[m
[32m+[m[32m      fileName: (format) => 'widget.js', // Output as widget.js (not widget.iife.js)[m
       formats: ['iife'], // Immediately Invoked Function Expression for script tag[m
     },[m
     rollupOptions: {[m
       output: {[m
         // Ensure single file output[m
         inlineDynamicImports: true,[m
[32m+[m[32m        // Customize CSS file name[m
[32m+[m[32m        assetFileNames: (assetInfo) => {[m
[32m+[m[32m          if (assetInfo.name === 'style.css') {[m
[32m+[m[32m            return 'widget.css'[m
[32m+[m[32m          }[m
[32m+[m[32m          return assetInfo.name || 'asset'[m
[32m+[m[32m        },[m
       },[m
     },[m
     minify: 'terser',[m
