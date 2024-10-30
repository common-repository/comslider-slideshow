/**
 * comSlider Block
 */
 const {
	Toolbar,
	Button,
	ButtonGroup
} = wp.components;
 
( function( blocks, editor, i18n, element ) {
	var el = element.createElement;
	var __ = i18n.__;

	var AlignmentToolbar = editor.AlignmentToolbar;
	var BlockControls = editor.BlockControls;
	var InspectorControls = editor.InspectorControls;	
	
	var cmsToken = null;
	var userSlideshowsList = null;
	var templatesList = null;
	var _edit = null;
	var _selectedid = null;
	var _selectedtemplate = null;	
	
	if (window.addEventListener) {
		window.addEventListener("message", handleMessage);
	} else {
		window.attachEvent("onmessage", handleMessage);
	}
	function handleMessage(event) {
		cmsToken = event.data.authtoken;
	}	
	
	function doAuth(){	
		var retries = 20;
		function onAuthDone(){
			listSlideshows();
		}
		function checkResponse(){
			if (cmsToken === null){
				if (retries == 0){
					cmsToken = 'noauth';
					onAuthDone();
				} else {			
					window.setTimeout(checkResponse, 500);
					retries--;
				}
			} else {
				onAuthDone();
			}
		}
		cmsToken = null;
		jQuery("#cms-authframe-ph").html('<iframe width=0 height=0 frameborder=0 src="https://www.comslider.com/api/ssoauth.php"></iframe>');
		checkResponse();
	}	
		
	function setActive(){
		var resetretries = 30;
		function reSetActive(){
			if (jQuery("#cms-inspector-ph").find("#"+_selectedid).length){
				jQuery("#cms-inspector-ph").find("#"+_selectedid).addClass('is-active');
			}
			if (resetretries > 0){
				window.setTimeout(reSetActive, 50);
				resetretries--;
			}
		}	
		reSetActive();
	}
		
	function onThumbSelected(slideshow){
		if (_edit){		
		
			var $block = jQuery('#block-'+_edit.props.clientId);
			if ($block.length){
				$block.find('.cms-btn-preview').click();
			}						
			var $selected = jQuery("#cms-inspector-ph").find(".cms-editor-block-styles").find(".is-active");
			if ($selected.length){
				_selectedid = $selected.attr('id');
			}
			_edit.props.setAttributes({cmsID: slideshow.session_id, cmsKey: slideshow.session_key});
			//
			setActive();
		}		
	}

	function previewTemplate(){
		if ((!_selectedtemplate) || (!_edit)) {
			return false;			
		}
		var $block = jQuery('#block-'+_edit.props.clientId);
		var template = _selectedtemplate;
		if (($block.find('.cms-block-ph-preview').length == 0) || ($block.find('#comslider_in_point_'+_selectedtemplate.session_id).length == 0)) { //if change
			$block.find('.cms-block-ph').html('<div class="cms-block-ph-preview"><div id="comslider_in_point_'+_selectedtemplate.session_id+'"><div style="width: auto; min-height:100px"><div class="cms-loaderwrapper"><div class="cms-loader"></div></div></div></div><script type="text/javascript">var oCOMScript'+_selectedtemplate.session_id+'=document.createElement(\'script\');oCOMScript'+_selectedtemplate.session_id+'.src="https://commondatastorage.googleapis.com/comslider/target/users/'+_selectedtemplate.session_key+'/comslider.js?timestamp=1561968489&ct="+Date.now();oCOMScript'+_selectedtemplate.session_id+'.type=\'text/javascript\';document.getElementsByTagName("head").item(0).appendChild(oCOMScript'+_selectedtemplate.session_id+');</script></div>');		
		}			
		//
		jQuery("#cms-inspector-ph .cms-block-editor-block-styles__item").removeClass('is-active');
		jQuery("#cms-inspector-ph").find("#cms-thumb-"+_selectedtemplate.session_id).addClass('is-active');
	}	

	function onTemplateSelected(template){
		if (!_edit){
			return false;
		}
		_selectedtemplate = template;
		var $block = jQuery('#block-'+_edit.props.clientId);
		if ($block.length){
			$block.find('.cms-btn-preview').click();
		}			
		previewTemplate();
	}
	
	function onCreateFromTemplate(template){
		jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper').show();
		jQuery("#cms-inspector-ph").find('.cms-loader-text').html('Creating a new slideshow from the template, please wait...').show();		
		jQuery("#cms-inspector-ph").find('input').prop('disabled', true);
		userSlideshowsList = null;
		listSlideshows(template.session_id);
	}

	function dumpRefreshBtn(){
		return '<div style="width:100%;text-align:right;"><button id="cms-refresh-list" type="button" class="cms-button" style="width:180px;height:24px;font-size:11px;line-height:25px">RELOAD&nbsp;SLIDESHOWS&nbsp;LIST</button></div>';		
	}
	
	function dumpLogo(){
		return '<div style="width:100%;height:24px;position:relative;"><img style="position:absolute;right:0;top:0;" src="'+cmsScript.pluginsUrl+'/includes/logo_txt.png"/></div>';
	}

	function isCmsKeyValid(){
		if (!_edit){
			return false;
		}
		var cmsID = _edit.props.attributes.cmsID;
		var cmsKey = _edit.props.attributes.cmsKey;
		//to do -> more sophisticated check
		if ((cmsID != '') && (cmsKey != '')){
			return true;
		}
	}
	
	function dumpTemplates(createfromtemplate){
		function loadTemplates(){
			jQuery.ajax({
					type: 'POST', 
					crossDomain: true,
					//xhrFields: {withCredentials: true},					
					url: 'https://www.comslider.com/api/templatelist.php', 
					data: {},
					success: function(jsondata){
						const data = (function(raw) {
							try {
								return JSON.parse(raw);
							} catch (err) {
								return false;
							}
						})(jsondata);
						if ((!data) || (data.state == 0)){				
							dumpGeneralError();
						} else {
							if (typeof data.data !== 'undefined'){
								templatesList = data.data;
								dumpTemplates(createfromtemplate);
							} else {
								dumpGeneralError();
							}
						}
					},
					error: function(){
						dumpGeneralError();
					}
				});			
			
		}
		if (templatesList === null){
			loadTemplates();
			return;
		}
		var html = '<div class="cms-editor-block-styles">';
		_selectedtemplate = null;		
		templatesList.forEach(function(template){
			html += '\
				<div id="cms-thumb-'+template.session_id+'" class="cms-block-editor-block-styles__item" role="button" tabindex="0" aria-label="Default">\
					<div class="cms-block-editor-block-styles__item-preview">\
						<div class="cms-block-editor-block-preview__content">';
			html += '		<img src="https://www.comslider.com/templates/cmsttb_'+template.session_id+'.jpg"/>';
			html += '	</div>\
					</div>\
					<div class="cms-block-editor-block-styles__item-label">\
						'+template.title+'\
					</div>';
			if (createfromtemplate){
				html += '<div class="cms-block-editor-block-styles__create-template"><button id="cms-use-template-'+template.session_id+'" type="button" class="cms-button" style="width:120px;height:22px;line-height:22px;font-size:10px;margin-top:3px;">USE THIS TEMPLATE</button></div>';	
			}
			html += '</div>';
			//
			if ((!isCmsKeyValid()) && (!_selectedtemplate))  {
				_selectedtemplate = template;
			}
		});
		html += '</div>';
		var $listph = jQuery("#cms-templates-list");
		$listph.html(html);				
		$listph.find('.cms-block-editor-block-styles__item').bind('click', function(){
			$listph.find('.cms-block-editor-block-styles__item').removeClass('is-active');
			jQuery(this).addClass('is-active');
			var id = jQuery(this).attr('id').substr(10);
			for (var i=0; i<templatesList.length; i++){
				if (templatesList[i].session_id == id){
					onTemplateSelected(templatesList[i]);
					break;
				}
			}					
		});
		$listph.find('.cms-block-editor-block-styles__create-template button').bind('click', function(){
			var id = jQuery(this).attr('id').substr(17);
			for (var i=0; i<templatesList.length; i++){
				if (templatesList[i].session_id == id){
					onCreateFromTemplate(templatesList[i]);
					break;
				}
			}			
		});
		jQuery("#cms-inspector-ph").find('.cms-loader-text').html('');
		jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper,.cms-loader-text').hide();	
		//
		previewTemplate();		
	}
	
	function dumpGeneralError(){
		//failed to access comslider.com
		var html = dumpLogo();
		html += '<div style="margin-bottom:10px;margin-top:5px;">'+dumpRefreshBtn()+'</div>';		
		html += '<div style="margin-bottom:10px;margin-top:15px;"><span style="color:#ff0000;">An error occurred!</span><br>Failed to get data from <a target="_blank" href="https://www.comslider.com">comslider.com</a>.<br>Please check your internet connection.<br><br>If error persists, please contact us at <a target="_blank" href="mailto:support@comslider.com">support@comslider.com</a></div>';		
		jQuery("#cms-panel").html(html);					
		jQuery("#cms-inspector-ph").find('.cms-loader-text').html('');
		jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper,.cms-loader-text').hide();
	}	
	
	function listSlideshows(fromtemplate){
		function refreshList(){
			jQuery("#cms-inspector-ph").find('.cms-loader-text').html('').hide();		
			jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper').show();
			jQuery("#cms-inspector-ph").find('input').prop('disabled', true);
			userSlideshowsList = null;
			doAuth();
		}
		function dumpAuthFailed(){
			//auth failed -> no comslider session
			jQuery("#cms-panel").html('auth failed -> no comslider session');					
			jQuery("#cms-inspector-ph").find('.cms-loader-text').html('');			
			jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper,.cms-loader-text').hide();
		}
		function dumpNoAuth(){
			//comslider session -> not logged in
			var html = dumpLogo();
			html += '<div style="margin-bottom:10px;margin-top:5px;">'+dumpRefreshBtn()+'</div>';
			html += '<div style="width:100%;padding:10px 0px;">To import your slideshows log in or sign up at <a target="_blank" href="https://www.comslider.com">comslider.com</a> and create your slideshows first.</div>';
			html += '<div style="width:100%;text-align:center;margin-top:10px;"><div style="width:100%;text-align:left;font-size:1.2em">Slideshow Templates:</div><div id="cms-templates-list"></div></div>';			
			jQuery("#cms-panel").html(html);					
			jQuery("#cms-refresh-list").bind('click', refreshList);
			dumpTemplates();
		}		
		function dumpNoSlideshows(){
			//comslider session -> not logged in
			var html = dumpLogo();
			html += '<div style="margin-bottom:10px;margin-top:5px;">'+dumpRefreshBtn()+'</div>';
			html += '<div style="width:100%;padding:10px 0px;">You do not have any slideshows created at <a target="_blank" href="https://www.comslider.com">comslider.com</a>.<br><br>Feel free to use templates bellow and create a professional stunning Slider, Gallery or Presentation simple and fast.</div>';
			html += '<div style="width:100%;text-align:center;margin-top:10px;"><div style="width:100%;text-align:left;font-size:1.2em">Slideshow Templates:</div><div id="cms-templates-list"></div></div>';			
			jQuery("#cms-panel").html(html);					
			jQuery("#cms-refresh-list").bind('click', refreshList);
			dumpTemplates(true);
		}			
		function dumpList(){
			if (userSlideshowsList.length == 0){
				dumpNoSlideshows();
			} else {	
				var html = dumpLogo();
				html += '<div style="margin-bottom:10px;margin-top:5px;">'+dumpRefreshBtn()+'</div>';				
				html += '<div class="cms-editor-block-styles">';
				html += '<div style="width:100%;text-align:center;margin-top:10px;"><div style="width:100%;text-align:left;font-size:1.2em">Your Slideshows:</div><div id="cms-templates-list"></div></div>';							
				var unusedslideshow = null;
				userSlideshowsList.forEach(function(slideshow){
					if ((!unusedslideshow) && (jQuery("#comslider_in_point_"+slideshow.session_id).length == 0)){
						unusedslideshow = slideshow;					
					}
					html += '\
						<div id="cms-thumb-'+slideshow.session_id+'" class="cms-block-editor-block-styles__item" role="button" tabindex="0" aria-label="Default">\
							<div class="cms-block-editor-block-styles__item-preview">\
								<div class="cms-block-editor-block-preview__content">';
					if (slideshow.imagetype == 'img'){
						html += '<img src="'+slideshow.image+'"/>';
					} else if (slideshow.imagetype == 'blank') {
						html += slideshow.image;
					}
					html += '	</div>\
							</div>\
							<div class="cms-block-editor-block-styles__item-label">\
								ID: <b>'+slideshow.session_id+'</b>'+((slideshow.title !== null) ? ' ('+function(title){
									if (title.length > 20){
										return title.substring(0, 20)+'...';
									}
									return title;
								}(slideshow.title)+')' : '')+'\
							</div>';
					html += '<div class="cms-block-editor-block-styles__create-slideshow"><a href="https://www.comslider.com?editsess='+slideshow.session_key+'" target="_blank"><button type="button" class="cms-button" style="width:120px;height:22px;line-height:22px;font-size:10px;margin-top:3px;">EDIT</button></a></div>';
					html += '</div>';
				});
				html += '</div>';
				var $listph = jQuery("#cms-panel");
				$listph.html(html);				
				$listph.find('.cms-block-editor-block-styles__item').bind('click', function(){
					$listph.find('.cms-block-editor-block-styles__item').removeClass('is-active');
					jQuery(this).addClass('is-active');
					var id = jQuery(this).attr('id').substr(10);
					for (var i=0; i<userSlideshowsList.length; i++){
						if (userSlideshowsList[i].session_id == id){
							onThumbSelected(userSlideshowsList[i]);
							break;
						}
					}					
				});
				jQuery("#cms-refresh-list").bind('click', refreshList);				
				jQuery("#cms-inspector-ph").find('.cms-loader-text').html('');				
				jQuery("#cms-inspector-ph").find('.cms-overlay,.cms-loaderwrapper,.cms-loader-text').hide();
				
				if ((_edit) && (_edit.props.attributes.cmsID == '') && (_edit.props.attributes.cmsKey == '') && (unusedslideshow)){
					onThumbSelected(unusedslideshow); //initial set -> e.g. on add new
				} else {				
					setActive();
				}
			}
		}
		//
		if (cmsToken == null){
			dumpAuthFailed();
		}
		else if (cmsToken == 'noauth'){
			dumpNoAuth();
		} else {
			if (userSlideshowsList === null){
				var postdata = {authtoken:cmsToken};
				if ((typeof fromtemplate !== 'undefined') && (fromtemplate != '')){
					postdata.createfromtemplate = fromtemplate;
				}
				jQuery.ajax({
					type: 'POST', 
					crossDomain: true,
					//xhrFields: {withCredentials: true},					
					url: 'https://www.comslider.com/api/slideshowlist.php', 
					data: postdata,
					success: function(jsondata){
						const data = (function(raw) {
							try {
								return JSON.parse(raw);
							} catch (err) {
								return false;
							}
						})(jsondata);
						if ((!data) || (data.state == 0)){				
							dumpAuthFailed();
						} else {
							userSlideshowsList = data.data;
							dumpList();
						}
					},
					error: function(){
						dumpGeneralError();
					}
				});				
			} else {
				dumpList();			
			}
		}
	}
	
	function onShowBlock(props){	
	var attributes = props.attributes;
	var $block = jQuery('#block-'+props.clientId);
		var $block = jQuery('#block-'+props.clientId);
		if ($block.length == 0){
			window.setTimeout(function(){onShowBlock(props)}, 200);
			return false;
		}		
		if ($block.find('.cms-btn-preview').hasClass('is-active')){
			//preview mode
			if (isCmsKeyValid()){
				jQuery('#cms-templates-list').find('.cms-block-editor-block-styles__item').removeClass('is-active'); //deselect template							
				if (($block.find('.cms-block-ph-preview').length == 0) || ($block.find('#comslider_in_point_'+attributes.cmsID).length == 0)) { //if change
					$block.find('.cms-block-ph').html('<div class="cms-block-ph-preview"><div id="comslider_in_point_'+attributes.cmsID+'"><div style="width: auto; min-height:100px"><div class="cms-loaderwrapper"><div class="cms-loader"></div></div></div></div><script type="text/javascript">var oCOMScript'+attributes.cmsID+'=document.createElement(\'script\');oCOMScript'+attributes.cmsID+'.src="https://commondatastorage.googleapis.com/comslider/target/users/'+attributes.cmsKey+'/comslider.js?timestamp=1561968489&ct="+Date.now();oCOMScript'+attributes.cmsID+'.type=\'text/javascript\';document.getElementsByTagName("head").item(0).appendChild(oCOMScript'+attributes.cmsID+');</script></div>');		
				}
			} else {
				previewTemplate();
			}
		} else if ($block.find('.cms-btn-settings').hasClass('is-active')){ 
			//settings mode
			if ($block.find('.cms-block-ph-settings').length == 0){ //if change
				var html = '<div class="cms-block-ph-settings">';
				html += '<div style="text-align:right;margin-bottom:-20px;"><img src="'+cmsScript.pluginsUrl+'/includes/logo_txt.png"/></div>';
				html += '<div style="text-align:left;"><span>ID:</span></div><input class="cms-block-settings-id components-text-control__input" type="text" value="'+(((typeof attributes.cmsID !== 'undefined') && (attributes.cmsID)) ? attributes.cmsID : '')+'"/>';
				html += '<div style="text-align:left;"><span>Key:</span></div><input class="cms-block-settings-key components-text-control__input" type="text" value="'+(((typeof attributes.cmsKey !== 'undefined') && (attributes.cmsKey)) ? attributes.cmsKey : '')+'"/>';
				html += '<div style="text-align:right;"><button class="cms-button cms-button-apply" style="width: 80px;height: 25px;line-height: 26px;font-size: 12px;margin-top: 10px;">Apply</button></div>';
				var $blockph = $block.find('.cms-block-ph');
				$blockph.html(html);
				//
				$blockph.find('.cms-block-settings-id')
				.on('change', function(){
					$blockph.find('.cms-button-apply').prop('disabled', false);
				})
				.on('keypress', function(){
					_latestSettingsEditingBlock = $block;
					$blockph.find('.cms-button-apply').prop('disabled', false);
				});
				//
				$blockph.find('.cms-block-settings-key')
				.on('change', function(){
					$blockph.find('.cms-button-apply').prop('disabled', false);
				})
				.on('keypress', function(){
					_latestSettingsEditingBlock = $block;
					$blockph.find('.cms-button-apply').prop('disabled', false);
				});	
				//
				$blockph.find('.cms-button-apply')
				.on('click', function(){
					props.setAttributes({cmsID: $blockph.find('.cms-block-settings-id').val(), cmsKey: $blockph.find('.cms-block-settings-key').val()});					
					$block.find('.cms-btn-preview').click();
				})
				.prop('disabled', true);
			}
		} else {
			if ($block.find('.cms-block-ph-init').length == 0){ //if change		
				$block.find('.cms-block-ph').html('<div class="cms-block-ph-init" style="min-height:100px;"><div class="cms-loaderwrapper"><div class="cms-loader"></div></div></div>');					
				window.setTimeout(function(){onShowBlock(props)}, 200);						
			} else {
				if (($block.find('.cms-btn-preview').length == 0) && ($block.find('.cms-btn-settings').length == 0)){
					//if not selected for edit mode
					$block.find('.cms-block-ph').html('<div class="cms-block-ph-preview"><div id="comslider_in_point_'+attributes.cmsID+'"><div style="width: auto; min-height:100px"><div class="cms-loaderwrapper"><div class="cms-loader"></div></div></div></div><script type="text/javascript">var oCOMScript'+attributes.cmsID+'=document.createElement(\'script\');oCOMScript'+attributes.cmsID+'.src="https://commondatastorage.googleapis.com/comslider/target/users/'+attributes.cmsKey+'/comslider.js?timestamp=1561968489&ct="+Date.now();oCOMScript'+attributes.cmsID+'.type=\'text/javascript\';document.getElementsByTagName("head").item(0).appendChild(oCOMScript'+attributes.cmsID+');</script></div>');							
				} else {
					window.setTimeout(function(){onShowBlock(props)}, 200);		
				}
			}
		}
	}
	
	const cmsIcon = el('svg', 
				{width: 20, height: 20, xmlns: "http://www.w3.org/2000/svg", version:"1.1"},
					el('g',
					{transform:"translate(-308.22982,-522.03985)"},
						el('g',
						{transform:"matrix(0.29782731,0,0,0.29782731,246.81871,376.34232)"},
							el('rect',
							{ry:"10.698428", rx:"10.646994", y:"544.61218", x:"254", height:"3.25", width:"3.625", style:{color:'#000000',fill:'#4dc4e2',fillOpacity:'1',fillRule:'evenodd',stroke:'#000000',strokeWidth:'0',strokeLinecap:'butt',strokeLinejoin:'miter',strokeMiterlimit:'4',strokeOpacity:'1',strokeDasharray:'none',strokeDashoffset:'0',marker:'none',visibility:'visible',display:'inline',overflow:'visible',enableBackground:'accumulate'}}							
							),
							el('rect',
							{ry:"10.698428", rx:"10.646994", y:"534.61218", x:"245.375", height:"3.5", width:"3.625", style:{color:'#000000',fill:'#777777',fillOpacity:'1',fillRule:'evenodd',stroke:'#000000',strokeWidth:'0',strokeLinecap:'butt',strokeLinejoin:'miter',strokeMiterlimit:'4',strokeOpacity:'1',strokeDasharray:'none',strokeDashoffset:'0',marker:'none',visibility:'visible',display:'inline',overflow:'visible',enableBackground:'accumulate'}}							
							),
							el('path',
							{d:"m 218.84955,489.21317 25.9609,0 c 3.18529,0 3.16932,0.0163 3.17097,3.18628 l 0.0221,42.54095 c 9.1e-4,1.76501 -0.0507,1.75207 -2.5633,1.74998 l -26.59067,-0.0221 c -3.17412,-0.003 -3.17096,0.007 -3.17096,-3.18629 l 0,-41.08254 c 0,-3.18261 0.008,-3.18628 3.17096,-3.18628 z", style:{color:'#000000',fill:'#4dc4e2',fillOpacity:'1',fillRule:'evenodd',stroke:'#4dc4e2',strokeWidth:'0',strokeLinecap:'butt',strokeLinejoin:'miter',strokeMiterlimit:'4.0999999',strokeOpacity:'1',strokeDasharray:'none',strokeDashoffset:'0',marker:'none',visibility:'visible',display:'inline',overflow:'visible',enableBackground:'accumulate'}}							
							),
							el('path',
							{d:"m 227.46111,498.80918 25.9609,4.5e-4 c 3.19302,6e-5 3.17099,0.029 3.17099,3.18629 l 0,42.53566 c 0,1.7652 -0.0857,1.7816 -1.84282,1.78003 l -27.41055,-0.0244 c -3.27459,-0.003 -3.31563,-0.0369 -3.31563,-3.19693 l 0,-6.41865 23.94704,0 0.0234,-8.64376 -23.97044,-2.4e-4 0.0114,-27.43747 c 7.4e-4,-1.76521 0.16978,-1.78049 1.92587,-1.78049 z", style:{color:'#000000',fill:'#777777',fillOpacity:'1',fillRule:'evenodd',stroke:'#4dc4e2',strokeWidth:'0',strokeLinecap:'butt',strokeLinejoin:'miter',strokeMiterlimit:'4.0999999',strokeOpacity:'1',strokeDasharray:'none',strokeDashoffset:'0',marker:'none',visibility:'visible',display:'inline',overflow:'visible',enableBackground:'accumulate'}}							
							),
							el('path',
							{d:"m 236.54289,508.80918 25.94528,0 c 3.17413,0 3.17097,0.10589 3.17097,3.28818 l 0,41.08254 c 0,3.17784 0.006,3.18628 -3.17097,3.18628 l -25.9609,0 c -3.16145,0 -3.17372,-5.3e-4 -3.17096,-3.18628 l 0.006,-6.89272 23.16007,0 0.0706,-28.616 -23.237,0 0,-5.57375 c 0,-3.22362 -0.006,-3.28825 1.75069,-3.28825 z", style:{color:'#000000',fill:'#4dc4e2',fillOpacity:'1',fillRule:'evenodd',stroke:'#4dc4e2',strokeWidth:'0',strokeLinecap:'butt',strokeLinejoin:'miter',strokeMiterlimit:'4.0999999',strokeOpacity:'1',strokeDasharray:'none',strokeDashoffset:'0',marker:'none',visibility:'visible',display:'inline',overflow:'visible',enableBackground:'accumulate'}}							
							)
						)
					)
				);
 
	
	blocks.registerBlockType( 'comslider/comslider-basic-block', {
		title: __( 'comSlider Slideshow', 'comslider' ),
		description: __( 'Embed a comSlider slideshow', 'comslider' ),
		icon: cmsIcon,
		category: 'embed',
		attributes: {
			cmsID: {
				type: 'string',
				default: '',
			},
			cmsKey: {
				type: 'string',
				default: '',
			},
			alignment: {
				type: 'string',
				default: 'none',
			},
		},
		edit: function(props) {
			if (props.isSelected){
				_edit = {props: props};
			}
			var attributes = props.attributes;
			var alignment = props.attributes.alignment;			
			if (props.isSelected){
				_selectedid = null;
				if ((typeof attributes.cmsID !== 'undefined') && (attributes.cmsID)){
						_selectedid = 'cms-thumb-'+attributes.cmsID;
				}
			}
			function onChangeAlignment( newAlignment ) {
				props.setAttributes( { alignment: newAlignment === undefined ? 'none' : newAlignment } );
			}
			var retries = 10;
			function onBlockSelected(){
				if (retries <= 0){
					return;
				}
				if ((!jQuery("#cms-panel").length) || ((retries > 8) && (cmsToken != null))){ //wait at least two cycles (on add new problem)
					window.setTimeout(onBlockSelected, 200); retries--;
				} else {
					if (cmsToken == null){
						jQuery("#cms-inspector-ph").find('input').prop('disabled', true);
						doAuth();
					} else {
						listSlideshows();
					}
				}				
			}
			if (props.isSelected){
				onBlockSelected();
			}
			//			
			onShowBlock(props);						
			//
			return [
				el(
					InspectorControls,
					{},
					el(
						'div',
						{id: 'cms-inspector-ph'},
						el(
							'div',
							{class: 'components-panel__body is-opened', style:{position: 'relative'}},
							[
								el(
									'div',
									{id:'cms-panel'},
									el(
										'div',
										{style:{width:'100%',height:'24px',textAlign:'center', margin:'20px 0px'}},
										el(
											'img',
											{src:cmsScript.pluginsUrl+'/includes/logo_txt.png'}											
										)
									)
								),							
								el(
									'div',
									{class:'cms-overlay'}
								),								
								el(
									'div',
									{class:'cms-loaderwrapper'},	
									el(
										'div',
										{class:'cms-loader'},	
									)									
								),
								el(
									'div',
									{class:'cms-loader-text'},	
									""
								)								
							]
						)
					), 										
					el(
						'div',
						{id: 'cms-authframe-ph', style: { width: '0px', height: '0px' }},
						null
					)					
				),					
				el(
					BlockControls,
					{ key: 'controls' },
					el(
						AlignmentToolbar,
						{
							value: alignment,
							onChange: onChangeAlignment,
						}
					),
					el(
						Toolbar,
						{
						},
							el(
								Button,
								{
									style:{outline:'none',border:'0px',boxShadow: 'none'},
									className:'cms-btn-preview components-tab-button is-active',
									onClick: function(e){
										var $block = jQuery('#block-'+props.clientId);									
										$block.find('.cms-btn-settings').removeClass('is-active');
										$block.find('.cms-btn-preview').addClass('is-active');
										onShowBlock(props);
									}
								},
								el('span', {}, 'Preview')
							),
							el(
								Button,
								{
									style:{outline:'none',border:'0px',boxShadow: 'none'},
									className:'cms-btn-settings components-tab-button',
									onClick: function(e){
										var $block = jQuery('#block-'+props.clientId);									
										$block.find('.cms-btn-preview').removeClass('is-active');
										$block.find('.cms-btn-settings').addClass('is-active');
										onShowBlock(props);
									}									
								},
								el('span', {}, 'Settings')
							)																
					)										
				),
				el(
					'div',
					{ className: props.className+' cms-block-ph', style: { textAlign: alignment }},
					el(
						'div',
						{className:'cms-block-ph-init', style:{minHeight:'60px'}},
						el(
							'div',
							{class:'cms-loaderwrapper'},	
							el(
								'div',
								{class:'cms-loader'},	
							)									
						)
					)					
				)
			];
		},
		save: function(props) {
			var attributes = props.attributes;
			return el(
				'p',
				{},
				el(
				'div',
				{className: 'cms-block-ph-preview'},
					el(
					'div',
					{id: 'comslider_in_point_'+attributes.cmsID, style:{textAlign:((typeof props.attributes.alignment != 'undefined') ? props.attributes.alignment : 'none')}},
						el(
						'script',
						{type: 'text/javascript'},
						'var oCOMScript'+attributes.cmsID+'=document.createElement(\'script\');oCOMScript'+attributes.cmsID+'.src="https://commondatastorage.googleapis.com/comslider/target/users/'+attributes.cmsKey+'/comslider.js?timestamp=1561968489&ct="+Date.now();oCOMScript'+attributes.cmsID+'.type=\'text/javascript\';document.getElementsByTagName("head").item(0).appendChild(oCOMScript'+attributes.cmsID+');'
						)
					)
				)
			);
		},
	} );
}(
	window.wp.blocks,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element
) );


var _latestSettingsEditingBlock = null;
jQuery(window).mousemove(function(){
	function setSettingsMode(block){
		if (block.retries-- < 0){
			return false;
		}
		if (block.blockph.find('.cms-btn-settings').length){
			block.blockph.find('.cms-btn-preview').removeClass('is-active');					
			block.blockph.find('.cms-btn-settings').addClass('is-active');				
		} else {
			window.setTimeout(function(){setSettingsMode(block);}, 100);
		}
	}
	if (_latestSettingsEditingBlock !== null){
		setSettingsMode({blockph: _latestSettingsEditingBlock, retries: 10});
		_latestSettingsEditingBlock = null;
	}
});

