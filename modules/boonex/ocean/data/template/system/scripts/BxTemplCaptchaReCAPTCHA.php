<?php defined('BX_DOL') or die('hack attempt');
/**
 * Copyright (c) UNA, Inc - https://una.io
 * MIT License - https://opensource.org/licenses/MIT
 *
 * @defgroup    UnaTemplateRepresentation UNA Template Representation Classes
 * @{
 */

/**
 * @see BxDolCaptcha
 */
class BxTemplCaptchaReCAPTCHA extends BxBaseCaptchaReCAPTCHA
{
    public function __construct ($aObject, $oTemplate = false)
    {
        parent::__construct ($aObject, $oTemplate);
    }
}

/** @} */
