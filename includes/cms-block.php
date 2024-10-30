<?php

defined( 'ABSPATH' ) || exit;

/**
 * Registers all comSLider block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * Passes translations to JavaScript.
 */
function comslider_register_block() {

	if ( ! function_exists( 'register_block_type' ) ) {
		// Gutenberg is not active.
		return;
	}

	wp_register_script(
		'comslider',
		plugins_url( 'cms-block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'cms-block.js' )
	);

	wp_register_style(
		'comslider-style-editor',
		plugins_url( 'cms-editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'cms-editor.css' )
	);

	wp_register_style(
		'comslider-style',
		plugins_url( 'cms-style.css', __FILE__ ),
		array( ),
		filemtime( plugin_dir_path( __FILE__ ) . 'cms-style.css' )
	);	
	
	register_block_type( 'comslider/comslider-basic-block', array(
		'style' => 'comslider-style',
		'editor_style' => 'comslider-style-editor',		
		'editor_script' => 'comslider',
	) );

}
add_action( 'init', 'comslider_register_block' );
