<?php
/*
 * Add comSlider to the Admin Control Panel
 */
 
class comSlider extends WP_Widget{
  public $plugin;
  //Create the widget
  public function __construct(){
    parent::__construct( 'comslider',
    __( 'comSlider' ),
    array( 'description' => __( 'Online Slideshow Creator - WP Plugin') )
  );
  if ( is_active_widget( false, false, $this->id_base ) ) {
    add_action( 'wp_head', array( $this, 'css' ) );
  }
}
}

//Register Widget With WordPress
function register_comslider() {
  register_widget( 'comSlider' );
}
//Use widgets_init action hook to execute custom function
add_action( 'widgets_init', 'register_comslider' );

//CSS import
function cms_settings_css() {
	wp_enqueue_style('cms_settings', plugins_url('cms-settings.css', __FILE__));
	wp_enqueue_style('cms_settings_fonts', 'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:700&display=swap');	
}
add_action('admin_enqueue_scripts', 'cms_settings_css');

//Add to the menu
add_action( 'admin_menu', 'comslider_menu' );
function comslider_menu() {
  add_menu_page( 'comSlider', 'comSlider', 'manage_options', 'comslider-settings', 'comslider_options', plugins_url('logo.png',__FILE__));
}
function comslider_options() {
  echo '<div class="cms-settings-wrapper">';
  echo '<div><div style="display:inline-block;vertical-align:bottom;"><img src="'.plugins_url('logo_txt.png',__FILE__).'"/></div><div style="vertical-align:bottom;padding-left:15px;display:inline-block;"><a href="https://www.comslider.com" target="_blank"><button type="button" class="cms-button" style="width:210px;height:32px;"><span class="s1">COM</span><span class="s2">SLIDER</span>&nbsp;<span>CREATOR</span>&nbsp;<span><img style="vertical-align:middle;margin-bottom:2px;margin-left:5px;" src="'.plugins_url('ar.png',__FILE__).'"/></span></button></a></div></div>';  
  echo '<div class="cms-slogan">';
  echo '<div>The most powerful and fully customizable slideshow maker.</div>';
  echo '<div>Make custom slideshow in minutes...</div>';
  echo '</div>';
  echo '<div style="margin-top:40px;"><h1>Online Slideshow Creator - WP Integration Plugin</h1></div>';
  echo '<div style="font-size:16px;line-height:22px;">Use <b>comSlider Block</b> on the Page Builder to import your slideshows.<br>You could find the comSlider block under the <b>Embeds</b> category:</div>';
  echo '<div style="margin-top:5px;"><img src="'.plugins_url('helpblock.jpg',__FILE__).'"/></div>';
  echo '</div>';
}
  