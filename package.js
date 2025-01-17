Package.describe({
	summary: 'Sass and SCSS support for Meteor. Supports M1 CPUs.',
	version: '1.0.6',
	git: 'https://github.com/leonardoventurini/meteor-scss.git',
	name: 'leonardoventurini:scss',
})

Package.registerBuildPlugin({
	name: 'compileScssBatch',
	use: ['caching-compiler@1.2.2', 'ecmascript@0.15.1'],
	sources: ['plugin/compile-scss.js'],
	npmDependencies: {
		sass: '1.63.6',
	},
})

Package.onUse(function (api) {
	api.versionsFrom('2.3')
	api.use('isobuild:compiler-plugin@1.0.0')
})

Package.onTest(function (api) {
	api.use(['ecmascript', 'leonardoventurini:scss', 'meteortesting:mocha'])

	// Tests for .scss
	api.addFiles([
		'test/scss/_emptyimport.scss',
		'test/scss/_not-included.scss',
		'test/scss/_top.scss',
		'test/scss/_top3.scss',
		'test/scss/empty.scss',
		'test/scss/dir/_in-dir.scss',
		'test/scss/dir/_in-dir2.scss',
		'test/scss/dir/root.scss',
		'test/scss/dir/subdir/_in-subdir.scss',
	])

	api.addFiles('test/scss/top2.scss', 'client', { isImport: true })

	// Test for includePaths
	api.addFiles([
		'test/include-paths/include-paths.scss',
		'test/include-paths/modules/module/_module.scss',
	])

	api.mainModule('tests.js', 'client')
})
