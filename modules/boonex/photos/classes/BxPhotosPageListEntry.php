<?php defined('BX_DOL') or die('hack attempt');
/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    Photos Photos
 * @ingroup     UnaModules
 *
 * @{
 */

/**
 * List entry page
 */
class BxPhotosPageListEntry extends BxBaseModTextPageListEntry
{    
    public function __construct($aObject, $oTemplate = false)
    {
        $this->MODULE = 'bx_photos';
        parent::__construct($aObject, $oTemplate);
    }
}

/** @} */
