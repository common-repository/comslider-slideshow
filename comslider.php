<?php
/**
/*
Plugin Name: comSlider Slideshow
Plugin URI: https://www.comslider.com
Description: comSlider - The most powerful and fully customizable <strong>Online Slideshow Creator</strong>. Use this WP Plugin to integrate your comSlider slideshows. To get started: first create your slideshows on <a href="https://www.comslider.com" target="_blank">comslider.com</a> and then use comSlider Block on the WP Page Builder to import your slideshows.
Author: eTipSis team
Version: 1.0.11
Author URI: https://www.etipsis.com
License: GPLv2 or later
*/

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

Copyright 2019 eTipSis team
*/


require_once plugin_dir_path(__FILE__) . 'includes/cms-settings.php';
require_once plugin_dir_path(__FILE__) . 'includes/cms-block.php';

wp_enqueue_script('cms-block-script', get_stylesheet_directory_uri() . '/includes/cms-block.js');
wp_localize_script('cms-block-script', 'cmsScript', array(
    'pluginsUrl' => plugins_url('', __FILE__ ),
));


