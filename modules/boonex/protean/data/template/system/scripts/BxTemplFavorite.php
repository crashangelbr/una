<?php defined('BX_DOL') or die('hack attempt');
/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    UnaTemplateRepresentation UNA Template Representation Classes
 * @{
 */

/**
 * @see BxDolFavorite
 */
class BxTemplFavorite extends BxBaseFavorite
{
    function __construct($sSystem, $iId, $iInit = true, $oTemplate = false)
    {
        parent::__construct($sSystem, $iId, $iInit, $oTemplate);
    }
}

/** @} */
