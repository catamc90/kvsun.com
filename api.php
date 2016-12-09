<?php
namespace KVSun;

use \shgysk8zer0\Core as Core;
use \shgysk8zer0\Core_API\Abstracts\HTTPStatusCodes as Status;

ob_start();
require_once __DIR__ . DIRECTORY_SEPARATOR . 'autoloader.php';

if (DEBUG) {
	Core\Console::getInstance()->asErrorHandler()->asExceptionHandler();
}

$header = Core\Headers::getInstance();
if ($header->accept === 'application/json') {
	$resp = Core\JSON_Response::getInstance();
	if (array_key_exists('url', $_GET)) {
		$url = new Core\URL($_GET['url']);
		$page = new \KVSun\Page($url);
		$header->content_type = 'application/json';
		Core\Console::getInstance()->log($page);
		exit($page);
	} elseif (array_key_exists('form', $_REQUEST) and is_array($_REQUEST[$_REQUEST['form']])) {
		require_once COMPONENTS . 'handlers' . DIRECTORY_SEPARATOR . 'form.php';
	} elseif (array_key_exists('datalist', $_GET)) {
		$resp->notify('Request for datalist', $_GET['datalist']);
	} elseif (array_key_exists('load_menu', $_GET)) {
		if (@file_exists(COMPONENTS . $_GET['load_menu'] . '.html')) {
			$resp->append('body', file_get_contents(COMPONENTS . $_GET['load_menu'] . '.html'));
		} else {
			$resp->notify('Request for menu', $_GET['load_menu']);
		}
	} else {
		$resp->notify('Invalid request', null, DOMAIN . 'images/sun-icons/128.png');
	}
	$resp->send();
	exit();
}  elseif(array_key_exists('url', $_GET)) {
	$url = new Core\URL($_GET['url']);
	if ($url->host === $_SERVER['SERVER_NAME']) {
		$header->location = "{$url}";
		http_response_code(Status\SEE_OTHER);
	} else {
		http_response_code(Status\BAD_REQUEST);
	}
}  else {
	http_response_code(Status\BAD_REQUEST);
	$header->content_type = 'application/json';
	exit('{}');
}