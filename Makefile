ARCHES := x86 arm
include node_modules/@start9labs/start-sdk/s9pk.mk

.PHONY: normalize-package-permissions

$(BASE_NAME).s9pk $(BASE_NAME)_%.s9pk: normalize-package-permissions
ingredients: normalize-package-permissions

normalize-package-permissions: javascript/index.js
	chmod -R a+rX javascript assets
	chmod a+r icon.svg instructions.md README.md LICENSE
