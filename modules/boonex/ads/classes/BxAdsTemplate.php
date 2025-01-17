<?php defined('BX_DOL') or die('hack attempt');
/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    Ads Ads
 * @ingroup     UnaModules
 *
 * @{
 */

/*
 * Module representation.
 */
class BxAdsTemplate extends BxBaseModTextTemplate
{
    function __construct(&$oConfig, &$oDb)
    {
        $this->MODULE = 'bx_ads';

        parent::__construct($oConfig, $oDb);

        $this->aMethodsToCallAddJsCss[] = 'categories';
    }

    public function entryOfferAccepted($iUserId, $aContent, $aOffer)
    {
        $CNF = &$this->_oConfig->CNF;

        $sJsCode = $sJsMethod = '';
        $aJs = BxDolPayments::getInstance()->getAddToCartJs($aContent[$CNF['FIELD_AUTHOR']], $this->MODULE, $aContent[$CNF['FIELD_ID']], $aOffer[$CNF['FIELD_OFR_QUANTITY']], true);
        if(!empty($aJs) && is_array($aJs))
            list($sJsCode, $sJsMethod) = $aJs;

        return $this->parseHtmlByName('entry-offer-accepted.html', array(
            'amount' => _t_format_currency($aOffer['amount']),
            'quantity' => _t('_bx_ads_txt_n_items', $aOffer['quantity']),
            'bx_if:show_pay' => array(
                'condition' => !empty($sJsMethod),
                'content' => array(
                    'js_method' => $sJsMethod,
                )
            ),
            'js_code' => $sJsCode
        ));
    }

    public function entryBreadcrumb($aContentInfo, $aTmplVarsItems = array())
    {
    	$CNF = &$this->_oConfig->CNF;

        $oPermalink = BxDolPermalinks::getInstance();

        $aTmplVarsItems = array();
        $this->_entryBreadcrumb($aContentInfo[$CNF['FIELD_CATEGORY']], $oPermalink, $aTmplVarsItems);
        $aTmplVarsItems = array_reverse($aTmplVarsItems);
        
        $aTmplVarsItems[] = array(
            'url' => BX_DOL_URL_ROOT . $oPermalink->permalink('page.php?i=' . $CNF['URI_VIEW_ENTRY'] . '&id=' . $aContentInfo[$CNF['FIELD_ID']]),
            'title' => bx_process_output($aContentInfo[$CNF['FIELD_TITLE']])
        );

    	return parent::entryBreadcrumb($aContentInfo, $aTmplVarsItems);
    }

    public function categoriesList($aParams = array())
    {
        $CNF = &$this->_oConfig->CNF;

        $sResult = $this->_categoriesList(0, array(
            'url' => BX_DOL_URL_ROOT . BxDolPermalinks::getInstance()->permalink($CNF['URL_CATEGORIES'], array('category' => ''))
        ));

        if(empty($sResult) && isset($aParams['show_empty']) && $aParams['show_empty'] === true)
            $sResult = MsgBox(_t('_Empty'));

        return $sResult;
    }

    public function getEntryLink($aEntry)
    {
        $CNF = &$this->_oConfig->CNF;

        return $this->getLink('entry-link', array(
            'href' => BX_DOL_URL_ROOT . BxDolPermalinks::getInstance()->permalink('page.php?i=' . $CNF['URI_VIEW_ENTRY'], array(
                'id' => $aEntry[$CNF['FIELD_ID']]
            )),
            'title' => bx_html_attribute($aEntry[$CNF['FIELD_TITLE']]),
            'content' => $aEntry[$CNF['FIELD_TITLE']]
        ));
    }

    /**
     * Use Gallery image for both because currently there is no Unit types with small thumbnails.
     */
    protected function getUnitThumbAndGallery ($aData)
    {
        list($sPhotoThumb, $sPhotoGallery) = parent::getUnitThumbAndGallery($aData);

        return array($sPhotoGallery, $sPhotoGallery);
    }

    protected function _categoriesList($iParentId, $aParams = array())
    {
        $aCategories = $this->_oDb->getCategories(array('type' => 'parent_id', 'parent_id' => $iParentId));

        $aTmplVars = array();
        foreach($aCategories as $aCategory) {
            $iItems = (int)$aCategory['items'];

            $sSibcategories = $this->_categoriesList($aCategory['id'], $aParams);
            if($iItems == 0 && empty($sSibcategories))
                continue;

            $aTmplVars[] = array(
                'url' => $aParams['url'] . $aCategory['id'],
                'title' => _t($aCategory['title']),
                'bx_if:show_icon' => array(
                    'condition' => !empty($aCategory['icon']),
                    'content' => array(
                        'icon' => $aCategory['icon'],
                    )
                ),
                'bx_if:show_counter' => array(
                    'condition' => $iItems != 0,
                    'content' => array(
                        'items' => $iItems,
                    )
                ),
                'bx_if:show_subcategories' => array(
                    'condition' => !empty($sSibcategories),
                    'content' => array(
                        'subcategories' => $sSibcategories
                    )
                )
            );
        }

        if(empty($aTmplVars))
            return '';

        return $this->parseHtmlByName('categories.html', array(
            'bx_repeat:categories' => $aTmplVars
        ));
    }

    protected function _entryBreadcrumb($iCategory, &$oPermalink, &$aTmplVarsItems)
    {
        $CNF = &$this->_oConfig->CNF;

        $aCategory = $this->_oDb->getCategories(array('type' => 'id', 'id' => $iCategory));
        if(empty($aCategory) || !is_array($aCategory))
            return;

        $aTmplVarsItems[] = array(
            'url' => BX_DOL_URL_ROOT . $oPermalink->permalink($CNF['URL_CATEGORIES'], array($CNF['GET_PARAM_CATEGORY'] => $aCategory['id'])),
            'title' => bx_process_output(_t($aCategory['title']))
        );

        if(empty($aCategory['parent_id']))
            return;

        $this->_entryBreadcrumb((int)$aCategory['parent_id'], $oPermalink, $aTmplVarsItems);
    }
}

/** @} */
