<?php defined('BX_DOL') or die('hack attempt');
/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    UnaTemplateRepresentation UNA Template Representation Classes
 * @{
 */

/**
 * @see BxDolUploader
 */
class BxTemplCmtsUploaderSimple extends BxBaseCmtsUploaderSimple
{
    function __construct($aObject, $sStorageObject, $sUniqId, $oTemplate)
    {
        parent::__construct($aObject, $sStorageObject, $sUniqId, $oTemplate);
    }
}

/** @} */
