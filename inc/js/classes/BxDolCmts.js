/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    UnaCore UNA Core
 * @{
 */

function BxDolCmts (options) {
    this._sObjName = undefined == options.sObjName ? 'oCmts' : options.sObjName;    // javascript object name, to run current object instance from onTimer
    this._sActionsUrl = options.sRootUrl + 'cmts.php'; // actions url address

    this._sSystem = options.sSystem; // current comment system
    this._iAuthorId = options.iAuthorId; // this comment's author ID.
    this._iObjId = options.iObjId; // this object id comments
    this._sBaseUrl = options.sBaseUrl; // base url to view comment's listing.

    this._iMinPostForm = undefined == options.iMinPostForm ? 0 : options.iMinPostForm;
    this._sPostFormPosition = undefined == options.sPostFormPosition ? 'top' : options.sPostFormPosition;
    this._sDisplayType = undefined == options.sDisplayType ? 'threaded' : options.sDisplayType;
    this._iDisplayStructure = undefined == options.iDisplayStructure ? 0 : options.iDisplayStructure;

    this._sBrowseType = undefined == options.sBrowseType ? 'tail' : options.sBrowseType;
    this._sBrowseFilter = undefined == options.sBrowseFilter ? 'all' : options.sBrowseFilter;

    this._sSP = options.sStylePrefix === undefined ? 'cmt' : options.sStylePrefix;
    this._sAnimationEffect = 'fade';
    this._iAnimationSpeed = 'slow';

    this._oSavedTexts = {};
    this._sRootId = '#cmts-box-' + this._sSystem + '-' + this._iObjId;

    this._bLiveUpdatePaused = false;
}

/*--- Main layout functionality ---*/
BxDolCmts.prototype.cmtInit = function()
{
    var $this = this;

    $(document).ready(function() {
        // init post comment form    
        var sFormId = $this._sRootId + ' .cmt-post-reply form';
        if ($(sFormId).length) {
            $(sFormId).each(function() {
                $this.cmtInitFormPost($(this));
            });
        }

        // blink (highlight) necessary comments
        $this._cmtsBlink($($this._sRootId));
    });
};

BxDolCmts.prototype.cmtInitFormPost = function(oCmtForm)
{
    var $this = this;

    oCmtForm.ajaxForm({
        dataType: "json",
        beforeSubmit: function (formData, jqForm, options) {
            window[$this._sObjName].cmtBeforePostSubmit(oCmtForm);
        },
        success: function (oData) {
            window[$this._sObjName].cmtAfterPostSubmit(oCmtForm, oData);
        }
    });
};

BxDolCmts.prototype.cmtShowForm = function(oElement)
{
    var oForm = $(oElement).parents('.cmt-reply.cmt-reply-min:first');
    oForm.find('.cmt-body-min').bx_anim('hide', this._sAnimationEffect, this._iAnimationSpeed, function() {
        oForm.find('.cmt-body').show(function() {
            var oTextarea = oForm.find("[name='cmt_text']");
            if(oTextarea && oTextarea.hasClass('bx-form-input-html') && typeof bx_editor_get_htmleditable === 'function')
                oTextarea = bx_editor_get_htmleditable(oTextarea);

            if(!oTextarea || oTextarea.length == 0)
                return;

            oTextarea.focus();
        });
    });
};

BxDolCmts.prototype.cmtBeforePostSubmit = function(oCmtForm)
{
    this._loadingInButton($(oCmtForm).children().find(':submit'), true);
};

BxDolCmts.prototype.cmtAfterPostSubmit = function (oCmtForm, oData)
{
	var $this = this;
	var fContinue = function() {
            var oParent = oCmtForm.parents('.cmt-reply:first');

            if(oData && oData.id != undefined) {
                var iCmtId = parseInt(oData.id);
                if(iCmtId > 0) {
                    $this._getCmt(oCmtForm, iCmtId);

                    var iCmtParentId = parseInt(oData.parent_id);
                    if(iCmtParentId == 0)
                        $this._getForm(undefined, {CmtParent: iCmtParentId}, function(sFormWrp) {
                            if(sFormWrp && sFormWrp.length > 0)
                                sFormWrp = $(sFormWrp).html();

                            oParent.hide().html(sFormWrp).bxProcessHtml().show();

                            $this.cmtInitFormPost(oParent.find('form'));
                        });
                    else
                        oParent.remove();
                        
                }

                return;
            }

            if(oData && oData.form != undefined && oData.form_id != undefined) {
                oParent.find('form').replaceWith(oData.form);

                $this.cmtInitFormPost(oParent.find('form'));

                return;
            }
	};

	this._loadingInButton($(oCmtForm).children().find(':submit'), false);

	if(oData && oData.msg != undefined)
            bx_alert(oData.msg, fContinue);
        else 
            fContinue();
};

BxDolCmts.prototype.cmtInitFormEdit = function(sCmtFormId)
{
	var $this = this;
	var oCmtForm = $('#' + sCmtFormId);

	oCmtForm.ajaxForm({
        dataType: "json",
        beforeSubmit: function (formData, jqForm, options) {
            window[$this._sObjName].cmtBeforeEditSubmit(oCmtForm);
        },
        success: function (oData) {
            window[$this._sObjName].cmtAfterEditSubmit(oCmtForm, oData);
        }
    });
};

BxDolCmts.prototype.cmtBeforeEditSubmit = function(oCmtForm)
{
    this._loadingInButton($(oCmtForm).children().find(':submit'), true);
};

BxDolCmts.prototype.cmtAfterEditSubmit = function (oCmtForm, oData, onComplete)
{
    var $this = this;
    var fContinue = function() {
        if(oData && oData.id != undefined && oData.content != undefined) {
            var iCmtId = parseInt(oData.id);
            if(iCmtId > 0) {
                $('#cmt' + iCmtId + ' .cmt-cont-cnt:first').bx_anim('hide', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
                    $(this).html(oData.content).bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed);
                });
            }
        }

        if(oData && oData.form != undefined && oData.form_id != undefined) {
            $('#' + oData.form_id).replaceWith(oData.form);
            $this.cmtInitFormEdit(oData.form_id);
        }

        if(typeof onComplete == 'function')
            onComplete(oCmtForm, oData);
    };

    this._loadingInButton($(oCmtForm).children().find(':submit'), false);

    if(oData && oData.msg != undefined)
        bx_alert(oData.msg, fContinue);
    else 
        fContinue();
};

BxDolCmts.prototype.cmtPin = function(oLink, iCmtId, iWay, bHideMenu) {
    var $this = this;

    if(bHideMenu == undefined || bHideMenu)
        $(oLink).parents('.bx-popup-applied:first:visible').dolPopupHide();

    var oParams = this._getDefaultActions();
    oParams['action'] = 'Pin';
    oParams['Cmt'] = iCmtId;
    oParams['way'] = iWay;

    var oCmt = $(this._sRootId + ' #cmt' + iCmtId);
    this._loadingInBlock(oCmt, true);

    jQuery.post (
        this._sActionsUrl,
        oParams,
        function (oData) {
            var fContinue = function() {
                if(oData && oData.parent_id != undefined) {
                    $this._getCmts(oLink, {
                        CmtParent: oData.parent_id,
                        CmtBrowse: $this._sBrowseType,
                        CmtFilter: $this._sBrowseFilter,
                        CmtDisplay: $this._sDisplayType
                    }, function(sListId, sContent) {
                        $this._loadingInBlock(oCmt, false);

                        $this._sDisplayType = $this._sDisplayType;
                        $this._cmtsReplaceContent($(sListId), sContent);
                    });
            	}
            };

            if(oData && oData.msg != undefined)
                bx_alert(oData.msg, fContinue);
            else
                fContinue();
        },
        'json'
    );
};

BxDolCmts.prototype.cmtEdit = function(oLink, iCmtId, bHideMenu) {
    var $this = this;

    if(bHideMenu == undefined || bHideMenu)
        $(oLink).parents('.bx-popup-applied:first:visible').dolPopupHide();

    var sContentId = this._sRootId + ' #cmt' + iCmtId + ' .cmt-cont-cnt:first';
    if ($(sContentId + ' > form').length) {
        $(sContentId).bx_anim('hide', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
            $(this).html($this._oSavedTexts[iCmtId]).bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed);
        });

        return;
    }

    var oParams = this._getDefaultActions();
    oParams['action'] = 'GetFormEdit';
    oParams['Cmt'] = iCmtId;

    this._oSavedTexts[iCmtId] = $(sContentId).html();

    this._loadingInContent(oLink, true);

    jQuery.post (
        this._sActionsUrl,
        oParams,
        function (oData) {
            var fContinue = function() {
                if(oData && oData.form != undefined && oData.form_id != undefined) {
                    $(sContentId).bx_anim('hide', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
                        $(this).html(oData.form).bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
                            $this.cmtInitFormEdit(oData.form_id);
                        });
                    });
            	}
            };

            $this._loadingInContent(oLink, false);

            if(oData && oData.msg != undefined)
                bx_alert(oData.msg, fContinue);
            else
                fContinue();
        },
        'json'
    );
};

BxDolCmts.prototype.cmtRemove = function(e, iCmtId) {
	var $this = this;

	$(e).parents('.bx-popup-active:first').dolPopupHide();

	bx_confirm('', function() {
	    var oParams = $this._getDefaultActions();
	    oParams['action'] = 'Remove';
	    oParams['Cmt'] = iCmtId;

	    $this._loadingInContent(e, true);

	    jQuery.post (
	        $this._sActionsUrl,
	        oParams,
	        function(oData) {
	            var fContinue = function() {
	            	if(oData && oData.id != undefined) {
		            	$(e).parents('.bx-popup-applied:first:visible').dolPopupHide();

		            	$('#cmt' + oData.id).bx_anim('hide', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
		                	var oCounter = $(this).parent('ul.cmts').siblings('.cmt-cont').find('.cmt-actions a.cmt-comment-replies span');
		                	if(oCounter)
		                		oCounter.html(oCounter.html() - 1);

		                	$(this).remove();
		                });
		            }
	            };

	            $this._loadingInContent(e, false);

	            if(oData && oData.msg != undefined)
	                bx_alert(oData.msg, fContinue);	            
	            else
	            	fContinue();
	        },
	        'json'
	    );
	});
};

BxDolCmts.prototype.cmtLoad = function(oLink, iCmtParentId, iStart, iPerView)
{
	var $this = this;
	var bButton = $(oLink).hasClass('bx-btn');

	if(bButton)
		this._loadingInButton(oLink, true);
	else 
		this._loading($(oLink).parents('ul.cmts:first'), true);

	this._getCmts(oLink, {
		CmtParent: iCmtParentId,
		CmtStart: iStart,
		CmtPerView: iPerView,
		CmtBrowse: this._sBrowseType,
		CmtFilter: this._sBrowseFilter,
		CmtDisplay: this._sDisplayType,
                CmtDisplayStructure: this._iDisplayStructure
	}, function(sListId, sContent) {
		if(bButton)
			$this._loadingInButton(oLink, false);
		else 
			$this._loading($(oLink).parents('ul.cmts:first'), false);

		$this._cmtsReplace($(oLink).parents('li:first'), sContent);
	});
};

BxDolCmts.prototype.cmtChangeDisplay = function(oLink, sType)
{
	var $this = this;
	this._getCmts(oLink, {
		CmtParent: 0,
		CmtBrowse: this._sBrowseType,
		CmtFilter: this._sBrowseFilter,
		CmtDisplay: sType
	}, function(sListId, sContent) {
		$this._sDisplayType = sType;
		$this._cmtsReplaceContent($(sListId), sContent);
	});
};

BxDolCmts.prototype.cmtChangeBrowse = function(oLink, sType)
{
	var $this = this;
	this._getCmts(oLink, {
		CmtParent: 0,
		CmtBrowse: sType,
		CmtFilter: this._sBrowseFilter,
		CmtDisplay: this._sDisplayType
	}, function(sListId, sContent) {
		$this._sBrowseType = sType;
		$this._cmtsReplaceContent($(sListId), sContent);
	});
};

BxDolCmts.prototype.cmtChangeFilter = function(oLink, sType)
{
	var $this = this;
	this._getCmts(oLink, {
		CmtParent: 0,
		CmtBrowse: this._sBrowseType,
		CmtFilter: sType,
		CmtDisplay: this._sDisplayType
	}, function(sListId, sContent) {
		$this._sBrowseFilter = sType;
		$this._cmtsReplaceContent($(sListId), sContent);
	});
};

BxDolCmts.prototype.showReplacement = function(iCmtId)
{
    $('#cmt' + iCmtId + '-hidden').bx_anim('hide', this._sAnimationEffect, this._iAnimationSpeed, function(){
        $(this).next('#cmt' + iCmtId).bx_anim('show', this._sAnimationEffect, this._iAnimationSpeed);
    });
};

BxDolCmts.prototype.showMore = function(oLink)
{
	$(oLink).parent('span').next('span').show().prev('span').remove();
};

BxDolCmts.prototype.showImage = function(oLink, sUrl) {
	$(this._sRootId + '-view-image-popup').dolPopupImage(sUrl, $(oLink).parents('.cmt-attached:first'));
};

BxDolCmts.prototype.toggleReply = function(e, iCmtParentId, iQuote)
{
    var $this = this;
    var aParams = {
        CmtParent: iCmtParentId,
        CmtQuote: iQuote != undefined ? parseInt(iQuote) : 0
    };
    var fOnShow = function() {
        $(this).find('textarea:first').focus();
    };

    var sParentId = this._sRootId + ' #cmt' + iCmtParentId;
    var sReplyQuoteId = '.cmt-reply-quote';
    var sReplyQuoteIdOpst = ':not(' + sReplyQuoteId + ')';

    var sReplyId = '';
    var sReplyIdOpst = '';
    if(aParams['CmtQuote']) {
        sReplyId = '.cmt-reply' + sReplyQuoteId;
        sReplyIdOpst = '.cmt-reply' + sReplyQuoteIdOpst;
    }
    else {
        sReplyId = '.cmt-reply' + sReplyQuoteIdOpst;
        sReplyIdOpst = '.cmt-reply' + sReplyQuoteId;
    }

    //--- Hide opposite form.
    if ($(sParentId + ' > ' + sReplyIdOpst + ':visible').length)
        $(sParentId + ' > ' + sReplyIdOpst).hide();

    if ($(sParentId + ' > ' + sReplyId).length) {
        $(sParentId + ' > ' + sReplyId).bx_anim('toggle', this._sAnimationEffect, this._iAnimationSpeed, fOnShow);
        return;
    }

    this._getForm(e, aParams, function(sForm) {
        var oForm = $(sForm).hide().addClass('cmt-reply-' + $this._sPostFormPosition).addClass('cmt-reply-margin');
        var oFormSibling = $(sParentId + ' > ul.cmts:first');
        switch($this._sPostFormPosition) {
            case 'top':
                oFormSibling.before(oForm);
                break;

            case 'bottom':
                oFormSibling.after(oForm);
                break;
        }

        $this.cmtInitFormPost(oForm.find('form'));

        $(sParentId).children(sReplyId).bx_anim('toggle', $this._sAnimationEffect, $this._iAnimationSpeed, fOnShow);
    });
};

BxDolCmts.prototype.toggleQuote = function(e, iCmtParentId)
{
    this.toggleReply(e, iCmtParentId, 1);
};

BxDolCmts.prototype.goTo = function(oLink, sGoToId, sBlinkIds, onLoad)
{
    $(oLink).parents('.bx-popup-applied:first:visible').dolPopupHide();

    var $this = this;
    this._getCmts(null, {
        CmtParent: 0,
        CmtBrowse: this._sBrowseType,
        CmtFilter: this._sBrowseFilter,
        CmtDisplay: this._sDisplayType,
        CmtBlink: sBlinkIds
    }, function(sListId, sContent) {
        $this._cmtsReplaceContent($(sListId), sContent, function() {
            location.hash = sGoToId;

            if(typeof onLoad == 'function')
                onLoad();
        });
    });
};

BxDolCmts.prototype.goToBtn = function(oLink, sGoToId, sBlinkIds, onLoad)
{
    var $this = this;

    this._loadingInButton(oLink, true);

    this._getCmts(null, {
        CmtParent: 0,
        CmtBrowse: this._sBrowseType,
        CmtFilter: this._sBrowseFilter,
        CmtDisplay: this._sDisplayType,
        CmtBlink: sBlinkIds
    }, function(sListId, sContent) {
        $this._cmtsReplaceContent($(sListId), sContent, function() {
            location.hash = sGoToId;

            if(typeof onLoad == 'function')
                onLoad();

            $this._loadingInButton(oLink, false);
            $(oLink).parents('.cmt-lu-button:first').remove();

            $this.resumeLiveUpdates();
        });
    });
};

BxDolCmts.prototype.goToAndReply = function(oLink, sGoToId, sBlinkIds)
{
    var $this = this;
    this.goTo(oLink, sGoToId, sBlinkIds, function() {
        var aBlinkIds = sBlinkIds.split(",");
        $.each(aBlinkIds, function(iIndex, iValue) {
            $this.toggleReply(null, iValue);
        });
    });
};

/*----------------------------*/
/*--- Live Updates methods ---*/
/*----------------------------*/
BxDolCmts.prototype.showLiveUpdate = function(oData)
{
    if(!oData.code)
        return;

    var oButton = $(oData.code);
    var sId = oButton.attr('id');
    $('#' + sId).remove();

    oButton.prependTo(this._sRootId);
};

BxDolCmts.prototype.showLiveUpdates = function(oData)
{
	/*
	 * Note. oData.count_old and oData.count_new are also available and can be checked or used in notification popup.  
	 */
	if(!oData.code)
            return;

	var $this = this;

	var oNotifs = $(oData.code);
	var sId = oNotifs.attr('id');
	$('#' + sId).remove();

	oNotifs.prependTo('body').dolPopup({
    	position: 'fixed',
    	left: '1rem',
    	top: 'auto',
    	bottom: '1rem',
    	fog: false,
    	onBeforeShow: function() {
    	},
    	onBeforeHide: function() {
    	},
        onShow: function() {
            setTimeout(function() {
                $('.bx-popup-chain.bx-popup-applied:visible:first').dolPopupHide();
            }, 5000);
        },
    	onHide: function() {
            $this.resumeLiveUpdates();
    	}
    });
};

BxDolCmts.prototype.previousLiveUpdate = function(oLink)
{
	var fPrevious = function() {
		var sClass = 'bx-popup-chain-item';
		$(oLink).parents('.' + sClass + ':first').hide().prev('.' + sClass).show();
	};

	if(!this.pauseLiveUpdates(fPrevious));
		fPrevious();
};

BxDolCmts.prototype.hideLiveUpdate = function(oLink)
{
	$(oLink).parents('.bx-popup-applied:visible:first').dolPopupHide();
};

BxDolCmts.prototype.resumeLiveUpdates = function(onLoad)
{
	if(!this._bLiveUpdatePaused)
		return false;

	var $this = this;
	this.changeLiveUpdates('ResumeLiveUpdate', function() {
		$this._bLiveUpdatePaused = false;

		if(typeof onLoad == 'function')
			onLoad();
	});

	return true;
};

BxDolCmts.prototype.pauseLiveUpdates = function(onLoad)
{
	if(this._bLiveUpdatePaused)
		return false;

	var $this = this;
	this.changeLiveUpdates('PauseLiveUpdate', function() {
		$this._bLiveUpdatePaused = true;

		if(typeof onLoad == 'function')
			onLoad();
	});

	return true;
};

BxDolCmts.prototype.changeLiveUpdates = function(sAction, onLoad)
{
	var $this = this;
    var oParams = this._getDefaultActions();
    oParams['action'] = sAction;

	jQuery.get(
	    this._sActionsUrl,
	    oParams,
	    function() {
	    	if(typeof onLoad == 'function')
				onLoad();
	    }
	);
};

/*----------------------------------*/
/*--- Methods for internal usage ---*/
/*----------------------------------*/
BxDolCmts.prototype._getCmt = function (e, iCmtId)
{
    var $this = this;
    var oData = this._getDefaultActions();
    oData['action'] = 'GetCmt';
    oData['Cmt'] = iCmtId;
    oData['CmtBrowse'] = this._sBrowseType;
    oData['CmtDisplay'] = this._sDisplayType;

    this._loadingInBlock (e);

    jQuery.post (
        this._sActionsUrl,
        oData,
        function (oData) {
            $this._loadingInBlock (e, false);

            var sListId = $this._sRootId + ' #cmt' + oData.vparent_id + ' > ul';
            var sReplyFormId = $this._sRootId + ' #cmt' + oData.parent_id + ' > .cmt-reply';

            //--- Hide reply form ---//
            if($(sReplyFormId).length)
            	$(sReplyFormId).bx_anim('hide', $this._sAnimationEffect, $this._iAnimationSpeed);

            $(sListId).each(function() {
                //--- Some number of comments already loaded ---//
                if($(this).children('li.cmt').length)
                    $(this).children('li.cmt:last').after($(oData.content).hide()).next('li.cmt:hidden').bxProcessHtml().bx_anim('toggle', $this._sAnimationEffect, $this._iAnimationSpeed);
                //-- There is no comments at all ---//
                else
                    $(this).hide().html(oData.content).bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed);
            });
        },
        'json'
    );
};

BxDolCmts.prototype._getCmts = function (oElement, oRequestParams, onLoad)
{
    var $this = this;
    var oData = this._getDefaultActions();    
    oData['action'] = 'GetCmts';
    oData = $.extend({}, oData, oRequestParams);

    var sListId =  this._sRootId + ' #cmt' + oData['CmtParent'] + ' > ul:first';

    if(oElement)
        this._loadingInBlock(oElement, true);

    jQuery.post (
        this._sActionsUrl,
        oData,
        function(s) {
        	if(oElement)
        		$this._loadingInBlock(oElement, false);

        	if(typeof onLoad == 'function')
    			onLoad(sListId, s);
        	else
        		$this._cmtsAppend(sListId, s);
        }
    );
};

BxDolCmts.prototype._getForm = function (e, oParams, onLoad)
{
    var $this = this;
    var oData = $.extend({}, this._getDefaultActions(), {
        action: 'GetFormPost',
        CmtType: 'reply',
        CmtBrowse: this._sBrowseType, 
        CmtDisplay: this._sDisplayType, 
        CmtMinPostForm: this._iMinPostForm
    }, oParams);

    if(e)
    	this._loadingInContent(e, true);

    jQuery.post (
        this._sActionsUrl,
        oData,
        function (s) {
            if(e)
                $this._loadingInContent(e, false);

            if(typeof onLoad == 'function')
                onLoad(s);
        }
    );
};

BxDolCmts.prototype._cmtsAppend = function(sIdTo, sContent)
{
	$(sIdTo).append($(sContent).hide()).children(':hidden').bxProcessHtml().bx_anim('show', this._sAnimationEffect, this._iAnimationSpeed);
};

BxDolCmts.prototype._cmtsPrepend = function(sIdTo, sContent)
{
	$(sIdTo).prepend($(sContent).hide()).children(':hidden').bxProcessHtml().bx_anim('show', this._sAnimationEffect, this._iAnimationSpeed);
};

BxDolCmts.prototype._cmtsReplace = function(oReplace, sContent, onLoad)
{
	var $this = this;
	$(oReplace).bx_anim('hide', this._sAnimationEffect, this._iAnimationSpeed, function() {
		$(this).after($(sContent).hide()).nextAll(':hidden').bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
			$this._cmtsBlink($(this));

			if(typeof onLoad == 'function')
    			onLoad();
		});
		$(this).remove();
	});
};
BxDolCmts.prototype._cmtsReplaceContent = function(oParent, sContent, onLoad)
{
	var $this = this;
	$(oParent).bx_anim('hide', this._sAnimationEffect, this._iAnimationSpeed, function() {
		$(this).html(sContent).bxProcessHtml().bx_anim('show', $this._sAnimationEffect, $this._iAnimationSpeed, function() {
			$this._cmtsBlink($(this));

			if(typeof onLoad == 'function')
    			onLoad();
		});
	});
};

BxDolCmts.prototype._cmtsBlink = function(oParent)
{
	var sBlinkClass = 'cmt-blink';

	oParent.find('.' + sBlinkClass + '-plate:visible').animate({
		opacity: 0
	}, 
	5000, 
	function() {
		oParent.find('.' + sBlinkClass).removeClass(sBlinkClass);
	});
};

BxDolCmts.prototype._getDefaultActions = function() {
    var oDate = new Date();
    return {
        sys: this._sSystem,
        id: this._iObjId,
        _t: oDate.getTime()
    };
};

BxDolCmts.prototype._loading = function(e, bShow) {
    var oParent = $(e).length ? $(e) : $('body'); 
    bx_loading(oParent, bShow);
};

BxDolCmts.prototype._loadingInBlock = function(e, bShow) {
    var oParent = $(e).length ? $(e).parents('.bx-db-content:first') : $('body'); 
    bx_loading(oParent, bShow);
};

BxDolCmts.prototype._loadingInContent = function(e, bShow) {
    var oParent = $(e).length ? $(e).parents('li.cmt:first,.cmt-reply:first') : $('body'); 
    bx_loading(oParent, bShow);
};

BxDolCmts.prototype._loadingInButton = function(e, bShow) {
    if($(e).length)
        bx_loading_btn($(e), bShow);
    else
        bx_loading($('body'), bShow);
};

/** @} */
