ARCHES := x86 arm
# overrides to s9pk.mk must precede the include statement
JS_BUNDLE := rm -rf javascript && npx ncc build startos/index.ts -o javascript && chmod -R 755 javascript
include node_modules/@start9labs/start-sdk/s9pk.mk
